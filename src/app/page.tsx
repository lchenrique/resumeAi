"use client";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Editor } from "../components/editor";
import { useState, useEffect } from "react";
import { YooptaContentValue, YooptaBlockData } from "@yoopta/editor";
import TemplateManager from "../components/editor/template-manager";
import { getTemplateById, ResumeTemplate } from "../components/editor/initial";
import { Layout } from "lucide-react";
import AIChatPanel, { ResumeEditCommand, AddCommand, UpdateCommand, DeleteCommand, MoveCommand } from "../components/ai/AIChatPanel";
import { ModeToggle } from "@/components/theme-toggle";
import useTemplate from "@/hooks/use-template";

// Helper Typeguard for YooptaBlockData
function isYooptaBlockData(block: any): block is YooptaBlockData {
  return block &&
         typeof block === 'object' &&
         typeof block.id === 'string' &&
         typeof block.type === 'string' &&
         typeof block.meta === 'object' &&
         block.meta !== null &&
         typeof block.meta.order === 'number' &&
         Array.isArray(block.value);
}

export default function Home() {
  const { selectedTemplate, setSelectedTemplate } = useTemplate();
  const [showTemplates, setShowTemplates] = useState(false);
  const [resumeContent, setResumeContent] = useState<YooptaContentValue | undefined>(selectedTemplate?.content);
  const [editorUpdateKey, setEditorUpdateKey] = useState<number>(0);

  const handleSelectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    // NÃO resetar o resumeContent, apenas mudar o template selecionado
    // setResumeContent(template.content);
  };

  const handleContentChange = (content: YooptaContentValue | undefined) => {
    setResumeContent(content);
  };

  const handleApplyCommands = (commands: ResumeEditCommand[]) => {
    if (!resumeContent) {
      console.error("Tentativa de aplicar comandos sem resumeContent definido.");
      return;
    }

    let updatedContent = JSON.parse(JSON.stringify(resumeContent));

    try {
      commands.forEach(command => {
        console.log(`Processando comando: ${command.action}`);
        switch (command.action) {
          case 'add': {
            const addCmd = command as AddCommand;
            const newBlockId = addCmd.block_data.id;
            if (!updatedContent[newBlockId]) {
              const highestOrder: number = Object.values(updatedContent).reduce((max: number, block: unknown) => {
                if (isYooptaBlockData(block)) {
                  return Math.max(max, block.meta.order);
                }
                return max;
              }, -1);
              addCmd.block_data.meta.order = addCmd.new_order ?? highestOrder + 1;
              updatedContent[newBlockId] = addCmd.block_data;
              console.log(`Bloco adicionado: ${newBlockId}`, addCmd.block_data);
            } else {
              console.warn(`Bloco com id ${newBlockId} já existe. Comando 'add' ignorado.`);
            }
            break;
          }
          case 'update': {
            const updateCmd = command as UpdateCommand;
            if (updatedContent[updateCmd.block_id]) {
              updatedContent[updateCmd.block_id].value = updateCmd.new_value;
              console.log(`Bloco atualizado: ${updateCmd.block_id}`, updateCmd.new_value);
            } else {
              console.warn(`Bloco com id ${updateCmd.block_id} não encontrado para 'update'.`);
            }
            break;
          }
          case 'delete': {
            const deleteCmd = command as DeleteCommand;
            if (updatedContent[deleteCmd.block_id]) {
              delete updatedContent[deleteCmd.block_id];
              console.log(`Bloco deletado: ${deleteCmd.block_id}`);
            } else {
              console.warn(`Bloco com id ${deleteCmd.block_id} não encontrado para 'delete'.`);
            }
            break;
          }
          case 'move': {
            const moveCmd = command as MoveCommand;
            if (updatedContent[moveCmd.block_id]) {
              updatedContent[moveCmd.block_id].meta.order = moveCmd.new_order;
              console.log(`Ordem do bloco ${moveCmd.block_id} atualizada para ${moveCmd.new_order}. Reordenação completa pode ser necessária.`);
            } else {
              console.warn(`Bloco com id ${moveCmd.block_id} não encontrado para 'move'.`);
            }
            break;
          }
          default:
            console.warn("Comando desconhecido ou inválido:", command);
        }
      });

      setResumeContent(updatedContent);
      console.log("Conteúdo do resumo atualizado após aplicar comandos.");

      setEditorUpdateKey(prevKey => prevKey + 1);
      console.log("Chave do editor incrementada para forçar atualização visual.");

    } catch (error) {
      console.error("Erro ao processar comandos de edição:", error);
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={25} maxSize={40} minSize={20}>
        <div className="p-4 h-[100vh] border-r">
          <AIChatPanel 
            resumeContent={resumeContent || {}} 
            onApplyCommands={handleApplyCommands}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
      <ResizablePanel defaultSize={75}>
        <div className="flex h-screen overflow-y-auto">
          {showTemplates && (
            <div className="w-[300px] h-full border-r bg-background flex-shrink-0">
              <TemplateManager
                onSelectTemplate={handleSelectTemplate}
                selectedTemplate={selectedTemplate}
              />
            </div>
          )}

          <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="border-b bg-background p-3 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-3 py-1.5 text-sm rounded-md bg-background border border-gray-200 hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
              >
                <Layout size={16} />
                <span>{showTemplates ? 'Fechar Modelos' : 'Abrir Modelos'}</span>
              </button>
              <div className="text-sm text-gray-600">
                Modelo atual: <span className="font-medium text-gray-800">{selectedTemplate.name}</span>
              </div>
            </div>

            <main className="flex-1 bg-card overflow-auto p-4 md:p-8">
              <div className={`relative mx-auto w-[21cm] min-h-[29.7cm] bg-background shadow-lg ${selectedTemplate?.className || ''}`}>
                <div className="absolute inset-0 border border-gray-200 pointer-events-none"></div>
                <div className="absolute inset-[2mm] border border-gray-100 pointer-events-none"></div>

                <div className="p-6 md:p-10 h-[29.7cm] w-[21cm]">
                  <Editor 
                    selectedTemplate={selectedTemplate} 
                    onContentChange={handleContentChange} 
                    resumeContent={resumeContent}
                    key={editorUpdateKey}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
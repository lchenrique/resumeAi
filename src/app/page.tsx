"use client";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import TemplateManager from "../components/editor/template-manager";
import { Layout, RotateCcw as ResetZoomIcon, Settings, ZoomIn, ZoomOut } from 'lucide-react';
import AIChatPanel, { ResumeEditCommand } from "../components/ai/AIChatPanel"; // Comandos específicos do Yoopta podem precisar de ajuste
import { ResumeTemplate, sampleModernSidebarContent } from "../components/editor/initial";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import useTemplate from "@/hooks/use-template";

// Novo import para ResumeRenderer e CustomResumeData
import { ResumeRenderer } from "@/components/resume/renderer/ResumeRenderer";
import { CustomResumeData } from "@/types/resume-data";
import { useCallback, useEffect, useState } from "react"; // Adicionado useCallback


export default function Home() {
  const { selectedTemplate, setSelectedTemplate } = useTemplate();
  const [currentResumeData, setCurrentResumeData] = useState<CustomResumeData | undefined>(
    selectedTemplate?.initialContent || sampleModernSidebarContent 
  );
  const [isEditable, setIsEditable] = useState(true); // Para controlar a editabilidade do ResumeRenderer
  const [zoomLevel, setZoomLevel] = useState(1); // Estado para o nível de zoom

  // Atualizar currentResumeData quando o template selecionado mudar e tiver initialContent
  useEffect(() => {
    if (selectedTemplate?.initialContent) {
      setCurrentResumeData(selectedTemplate.initialContent);
    }
    // As propriedades bgColor, bgImage, borderRadius foram movidas para layoutConfig ou sectionStyles
    // A estilização agora é controlada pelo ResumeRenderer com base no template.className e layoutConfig
  }, [selectedTemplate]);

  const handleSelectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    // O useEffect acima cuidará de atualizar currentResumeData se o novo template tiver initialContent
  };

  // Callback para ResumeRenderer atualizar os dados
  const handleResumeDataChange = useCallback((newData: CustomResumeData) => {
    console.log("Resume data changed by ResumeRenderer:", newData);
    setCurrentResumeData(newData);
  }, []);

  // TODO: A lógica de handleApplyCommands e handleReplaceContext precisa ser completamente 
  // refatorada para funcionar com CustomResumeData e a estrutura do BlockNote,
  // em vez do formato YooptaContentValue.
  // Por enquanto, vamos mantê-las comentadas ou com placeholders.

  const handleApplyCommands = (commands: ResumeEditCommand[]) => {
    console.warn("[handleApplyCommands] Precisa ser reimplementado para CustomResumeData e BlockNote.", commands);
    // Exemplo: Se os comandos da IA agora geram alterações para CustomResumeData, 
    // você aplicaria essas alterações a currentResumeData aqui.
  };

  const handleReplaceContext = (pdfInfo: { name: string; title?: string }) => {
    console.warn("[handleReplaceContext] Precisa ser reimplementado para CustomResumeData.", pdfInfo);
    // Exemplo: Atualizar currentResumeData.personalInfo com pdfInfo
    // setCurrentResumeData(prevData => ({
    //   ...prevData!, // Assumindo que prevData existe
    //   personalInfo: {
    //     name: pdfInfo.name,
    //     title: pdfInfo.title || prevData?.personalInfo?.title || ''
    //   }
    //   // Outras seções precisariam ser preenchidas ou limpas conforme necessário
    // }));
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2)); // Zoom máximo de 200%
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // Zoom mínimo de 50%
  const resetZoom = () => setZoomLevel(1);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-57px)] flex gap-1">
      <ResizablePanel defaultSize={25} maxSize={40} minSize={20} className="rounded-2xl">
        <Card className="h-full  border-0">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                <Settings size={18} />
              </div>
              Assistente IA
            </CardTitle>
            <CardDescription>Use a IA para melhorar seu currículo</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-76px)]">
            <AIChatPanel 
              // resumeContent agora é CustomResumeData, AIChatPanel pode precisar de adaptação
              // ou uma função para converter CustomResumeData para o formato que ele espera (se diferente)
              resumeContent={{ rawString: JSON.stringify(currentResumeData) }} // Exemplo de passagem simples
              onApplyCommands={handleApplyCommands}
              onReplaceContext={handleReplaceContext}
            />
          </CardContent>
        </Card>
      </ResizablePanel>
      
      <ResizableHandle withHandle className="w-1 hover:bg-border/80 transition-colors bg-transparent" />
      
      <ResizablePanel defaultSize={75} className="rounded-2xl">
        <div className="flex h-full flex-col">
          <Card className="rounded-none  border-0 shadow-none ">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Layout size={16} />
                      <span>Modelos</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="right" 
                    className="w-[350px] sm:w-[400px] pb-0 pr-0 flex flex-col h-full" 
                    style={{ /* ... Estilos do Sheet ... */ }}
                  >
                    <SheetHeader className="pb-2">
                      <SheetTitle>Modelos de Currículo</SheetTitle>
                      <SheetDescription>
                        Escolha um modelo para seu currículo.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 overflow-y-auto flex-1 pr-4">
                      <TemplateManager
                        onSelectTemplate={handleSelectTemplate}
                        selectedTemplate={selectedTemplate}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                {/* Controles de Zoom */}
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="icon" onClick={zoomOut} title="Diminuir Zoom">
                    <ZoomOut size={16} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={resetZoom} title="Resetar Zoom">
                    <ResetZoomIcon size={16} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={zoomIn} title="Aumentar Zoom">
                    <ZoomIn size={16} />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Modelo atual: <span className="font-medium text-foreground">{selectedTemplate?.name}</span>
              </div>
            </CardContent>
          </Card>

          <main className="flex-1 bg-muted overflow-auto p-4 md:p-8">
            {/* A área do editor Yoopta é substituída pelo ResumeRenderer */}
            <div 
              className={` mx-auto bg-card shadow-lg`}
              style={{
                width: '21cm',
                minHeight: '29.7cm',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center top',
                transition: 'transform 0.2s ease-out' // Opcional: transição suave para o zoom
              }}
            >
              {/* As classes de template como selectedTemplate?.className são agora aplicadas pelo ResumeRenderer internamente */}
              {/* As bordas decorativas podem permanecer se desejado */}
              <div className="absolute inset-0 border border-border pointer-events-none"></div>
              <div className="absolute inset-[2mm] border border-border/30 pointer-events-none"></div>
              {
                !selectedTemplate || !currentResumeData ? (
                  <div>Carregando template ou preparando dados iniciais...</div>
                ) : (
                  <ResumeRenderer 
                    data={currentResumeData}
                    template={selectedTemplate}
                  />
                )
              }
            </div>
          </main>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
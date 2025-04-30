"use client";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Editor } from "../components/editor";
import { useState, useEffect } from "react";
import { YooptaContentValue } from "@yoopta/editor";
import TemplateManager from "../components/editor/template-manager";
import { getTemplateById } from "../components/editor/initial";
import { Layout } from "lucide-react";
import AIChatPanel from "../components/ai/AIChatPanel";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("basic-template");
  const [showTemplates, setShowTemplates] = useState(false);
  const [resumeContent, setResumeContent] = useState<YooptaContentValue | undefined>();

  useEffect(() => {
    const initialTemplate = getTemplateById(selectedTemplateId);
    setResumeContent(initialTemplate?.content);
  }, [selectedTemplateId]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleContentChange = (content: YooptaContentValue | undefined) => {
    setResumeContent(content);
  };

  const handleJsonUpdate = (newContent: YooptaContentValue) => {
    console.log("Recebendo JSON da IA para atualizar o editor:", newContent);

    console.log('resumeContent', resumeContent);  

      if (resumeContent) {
    
        setResumeContent(undefined);
        setTimeout(() => {
          setResumeContent(newContent);
        }, 100);
      }

  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={25} maxSize={40} minSize={20}>
     <ModeToggle  />
        <div className="p-4 h-[100vh] border-r">
          <AIChatPanel 
            resumeContent={resumeContent || {}} 
            onJsonUpdate={handleJsonUpdate}
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
                selectedTemplateId={selectedTemplateId}
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
                Modelo atual: <span className="font-medium text-gray-800">{getTemplateById(selectedTemplateId)?.name || 'Básico'}</span>
              </div>
            </div>

            <main className="flex-1 bg-card overflow-auto p-4 md:p-8">
              <div className="relative mx-auto w-[21cm] min-h-[29.7cm] bg-background shadow-lg">
                <div className="absolute inset-0 border border-gray-200 pointer-events-none"></div>
                <div className="absolute inset-[2mm] border border-gray-100 pointer-events-none"></div>

                <div className="p-6 md:p-10">
                  <Editor 
                    selectedTemplate={selectedTemplateId} 
                    onChangeTemplate={setSelectedTemplateId} 
                    onContentChange={handleContentChange} 
                    resumeContent={resumeContent}
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
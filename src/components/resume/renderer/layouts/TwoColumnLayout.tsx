import React, { useState } from 'react';
import { CustomResumeData, ResumeSectionKey } from '@/types/resume-data';
import { TemplateLayoutConfig } from '@/components/editor/initial';
import { Editor } from '@/components/editor/DynamicEditor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { TwoColumnController } from './controllers/TwoColumnContoller';
import { ChevronRight, Settings } from 'lucide-react';

interface TwoColumnLayoutProps {
    layoutConfig: TemplateLayoutConfig;
    resumeData: CustomResumeData;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
    layoutConfig,
    resumeData,
}) => {
    const [isMenuMinimized, setIsMenuMinimized] = useState(false);
    
    if (layoutConfig.type !== 'twoColumnFixedLeft' && layoutConfig.type !== 'twoColumnFixedRight') {
        // Não deve acontecer se ResumeRenderer fizer o switch corretamente
        console.error('Invalid layoutConfig type for TwoColumnLayout');
        return <div>Erro de configuração de layout.</div>;
    }

    const { twoColumnOptions } = layoutConfig;
    if (!twoColumnOptions) {
        console.error('TwoColumnOptions is missing in layoutConfig');
        return <div>Erro: Opções de duas colunas não definidas.</div>;
    }

    const leftSections = twoColumnOptions.leftColumn?.sections || [];
    const rightSections = twoColumnOptions.rightColumn?.sections || [];
    const gap = twoColumnOptions.gap || '1rem';

    // Determina a ordem das colunas e suas larguras com base no tipo de layout
    let firstColumnSections: ResumeSectionKey[], secondColumnSections: ResumeSectionKey[];
    let firstColumnStyle: React.CSSProperties, secondColumnStyle: React.CSSProperties;


    if (layoutConfig.type === 'twoColumnFixedLeft') {
        firstColumnSections = leftSections;
        secondColumnSections = rightSections;
        firstColumnStyle = { ...twoColumnOptions.leftColumn.style, flexShrink: 0 };
        secondColumnStyle = { ...twoColumnOptions.rightColumn.style, flexGrow: 1 };
    } else { // twoColumnFixedRight
        firstColumnSections = rightSections;
        secondColumnSections = leftSections;
        firstColumnStyle = { ...twoColumnOptions.leftColumn.style, flexShrink: 0 }; // Esta será a coluna da direita
        secondColumnStyle = { ...twoColumnOptions.rightColumn.style, flexGrow: 1 }; // Esta será a coluna da esquerda
    }

    const renderSections = (sectionKeys: ResumeSectionKey[]) => {
        return sectionKeys.map((sectionKey) => {
            // Acessa os dados da seção. O tipo de resumeData[sectionKey] deve ser string
            // ou algo que SectionEditorWrapper possa converter para o initialContent do BlockNote.
            const sectionData = resumeData[sectionKey] as string | undefined;

            return (
                <div key={sectionKey} className="mb-4 w-full h-full">
                    <Editor />
                </div>
            );
        });
    };

    // Ajuste para renderizar as colunas na ordem correta para 'twoColumnFixedRight'
    const ColumnOne = () => (
        <div
            className={`flex-1 w-full`}
        >
            {renderSections(firstColumnSections)}
        </div>
    );

    const ColumnTwo = () => (
        <div
            className={`flex-1 w-full`}
           
        >
            {renderSections(secondColumnSections)}
        </div>
    );

    const columnStyle = (style: React.CSSProperties) => ({
        background: style.backgroundColor,
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
    })

    return (

            <div
                className="resume-layout two-column-layout flex flex-1 w-full p-[10mm] h-[29.7cm]"
                style={{ gap: gap }}
            >
                <div className='absolute top-0 left-0'>
              <div
            className={`
                fixed z-50 right-6 bottom-1/2 transform translate-y-1/2 flex flex-col justify-center items-center rounded-xl 
                bg-background/95 backdrop-blur-sm border border-border/40 shadow-lg transition-all duration-200 ease-in-out
                ${isMenuMinimized ? 'w-12 p-2 h-12' : 'w-[400px] p-4 h-[636px]'}
              `}
          >
            <button onClick={() => setIsMenuMinimized(!isMenuMinimized)} className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-border hover:bg-primary/20 transition-colors" title={isMenuMinimized ? "Expandir menu" : "Minimizar menu"}>
              <ChevronRight size={14} className={`text-primary transition-transform duration-200 ${isMenuMinimized ? 'rotate-180' : ''}`} />
            </button>
            {isMenuMinimized ? (
              <div className="flex flex-col gap-3 py-2">
                <button onClick={() => setIsMenuMinimized(false)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Configurar modelo">
                  <Settings size={18} />
                </button>
              </div>
            ) : (
                <TwoColumnController 
                    template={layoutConfig.type}
                    barColor={firstColumnStyle.backgroundColor}
                    onChangeBarColor={(color) => {
                        firstColumnStyle.backgroundColor = color;
                    }}
                    isBarOpen={true}
                    setBgImage={() => {}}
                    borderRadius={ { topLeft: null, topRight: null, bottomLeft: null, bottomRight: null }}
                    setBorderRadius={() => {}}
                    bgPosition={ 'center'}
                    setBgPosition={() => {}}
                    />
            )}
          </div>
                </div>
                {layoutConfig.type === 'twoColumnFixedLeft' ? (
                    <ResizablePanelGroup direction="horizontal" className="h-full flex gap-1">
                        <ResizablePanel style={columnStyle(firstColumnStyle)} defaultSize={25} maxSize={100} minSize={1} className="rounded-2xl w-full">
                            <ColumnOne />
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel style={columnStyle(secondColumnStyle)} className="rounded-2xl w-full">
                            <Editor initialContent={resumeData.personalInfo.name } level={1} />
                            <ColumnTwo />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                ) : (
                    <ResizablePanelGroup direction="horizontal" className="h-full flex gap-1">
                        <ResizablePanel style={ columnStyle(secondColumnStyle)} defaultSize={25} maxSize={100} minSize={1} className="rounded-2xl w-full">
                            <ColumnTwo /> {/* Main content (left) when sidebar is right */}
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel className="rounded-2xl">
                            <Editor initialContent={resumeData.personalInfo.name} level={1} />
                            <ColumnOne /> 
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
        </div>

    );
}; 
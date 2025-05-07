import React from 'react';
import { CustomResumeData, ResumeSectionKey } from '@/types/resume-data';
import { TemplateLayoutConfig } from '@/components/editor/initial';
import { Editor } from '@/components/editor/DynamicEditor'; // Seu componente Editor

interface SingleColumnLayoutProps {
  layoutConfig: TemplateLayoutConfig;
  resumeData: CustomResumeData;
  // sectionStyles?: any; // Futuramente, para estilização específica por seção
}

export const SingleColumnLayout: React.FC<SingleColumnLayoutProps> = ({
  layoutConfig,
  resumeData,
}) => {
  if (layoutConfig.type !== 'singleColumn') {
    console.error('Invalid layoutConfig type for SingleColumnLayout');
    return <div>Erro de configuração de layout.</div>;
  }

  const { singleColumnOptions } = layoutConfig;
  if (!singleColumnOptions || !singleColumnOptions.sectionOrder) {
    console.error('singleColumnOptions or sectionOrder is missing in layoutConfig');
    return <div>Erro: Opções de coluna única ou ordem das seções não definidas.</div>;
  }

  const sectionOrder = singleColumnOptions.sectionOrder;

  return (
    <div 
      className="resume-layout single-column-layout"
      style={singleColumnOptions.style} // Aplica estilos definidos para o contêiner da coluna
    >
      {sectionOrder.map((sectionKey) => {
        const sectionData = resumeData[sectionKey] as string | undefined;
        // O componente Editor precisará de uma prop onContentChange no futuro
        // para que onSectionContentChange possa ser chamado.
        // Exemplo: onContentChange={(newStringContent) => onSectionContentChange(sectionKey, newStringContent)}
        return (
          <div key={sectionKey} className="resume-section-editor-container mb-4">
            <Editor 
          
            />
          </div>
        );
      })}
    </div>
  );
}; 
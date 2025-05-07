import { CustomResumeData, ResumeSectionKey } from "@/types/resume-data";
import { ResumeTemplate } from "@/components/editor/initial";
import { TwoColumnLayout } from "./layouts/TwoColumnLayout";
import { SingleColumnLayout } from "./layouts/SingleColumnLayout";
import { ProfileFeatureLayout } from "./layouts/ProfileFeatureLayout";
// Importar outros componentes de layout (ex: SingleColumnLayout) quando forem criados.

interface ResumeRendererProps {
  data: CustomResumeData;
  template: ResumeTemplate;
}

export const ResumeRenderer = ({
  data,
  template,
}: ResumeRendererProps) => {
  const layoutConfig = template.layoutConfig;

  // TODO: Aplicar estilos globais do template aqui, se houver.
  // Ex: <div style={{ fontFamily: template.styles?.fontFamily, color: template.styles?.textColor }}>
  console.log(template.layoutConfig);
  // Renderiza o layout com base no tipo especificado no template
  switch (layoutConfig.type) {
    case "twoColumnFixedLeft":
    case "twoColumnFixedRight":
      return (
        <TwoColumnLayout
          layoutConfig={layoutConfig}
          resumeData={data}
        />
      );
    case "singleColumn":
      return (
        <SingleColumnLayout
          layoutConfig={layoutConfig}
          resumeData={data}
        />
      );
    case "profileFeatureLayout":
      return (
        <ProfileFeatureLayout
          layoutConfig={layoutConfig}
          resumeData={data}
          isEditable={true}
          onSectionContentChange={() => {}}
        />
      );
    default:
      console.warn("Unsupported layout type:", layoutConfig.type);
      return <div>Layout não suportado: {layoutConfig.type}</div>;
  }
};

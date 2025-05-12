import { CustomResumeData, ResumeSectionKey } from "@/types/resume-data";
import { ResumeTemplate } from "@/components/editor/initial";
// import { TranformedLayout } from "./layouts/TranformedLayout"; // Comentado pois não será mais usado diretamente aqui
// import { SystemLayout } from "./layouts/SystemLayout"; // Comentado se não for usado
import { LayoutCell, LayoutContainer, NestedLayoutExample, SwapableItem, SwapyNestedLayout ,} from "./layouts/SwapyNestedLayout";

// --- Componentes Placeholder para Seções do Currículo ---
// Estes componentes receberiam os dados específicos da seção e os renderizariam.
// Por exemplo, data.profile, data.experience etc.

const ProfileSection: React.FC<{ data: CustomResumeData['personalInfo'] }> = ({ data }) => (
  <div><h3>Perfil</h3><p>{data?.name}</p>{/* ...e outros campos do perfil */}</div>
);

const ExperienceSection: React.FC<{ data: CustomResumeData['experience'] }> = ({ data }) => (
  <div><h3>Experiência</h3>{data?.map(job => <div key={job.id}>{job.company}</div>)}</div>
);

const EducationSection: React.FC<{ data: CustomResumeData['education'] }> = ({ data }) => (
  <div><h3>Educação</h3>{data?.map(edu => <div key={edu.id}>{edu.institution}</div>)}</div>
);

// Adicione outros componentes de seção conforme necessário (skills, projects, etc.)
// --- Fim dos Componentes Placeholder ---

interface ResumeRendererProps {
  data: CustomResumeData;
  template: ResumeTemplate;
}

export const ResumeRenderer = ({
  data,
  template,
}: ResumeRendererProps) => {

  return (
     
    <NestedLayoutExample />

       
  )



  // O código abaixo não será alcançado devido ao return anterior.
  // Removido para clareza.
  /*
  return <TranformedLayout
    layoutConfig={layoutConfig} // layoutConfig aqui pode não ser o tipo esperado por TranformedLayout
    resumeData={data}
    isEditable={true}
    onSectionContentChange={() => { }}
  />
  */
};

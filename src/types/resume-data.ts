export interface CustomContactInfo {
  phone?: string;
  email?: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

export interface CustomExperienceItem {
  id: string; // ID único (ex: uuid)
  company: string;
  title: string;
  startDate?: string;
  endDate?: string; // Pode ser "presente"
  location?: string;
  description: string; // Usar Markdown
}

export interface CustomEducationItem {
  id: string; // ID único
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string; // Usar Markdown
}

export interface CustomSkillCategory {
  id: string; // ID único
  categoryName: string;
  skills: string[];
}

export interface CustomReferenceItem {
    id: string; // ID único
    name: string;
    title?: string;
    company?: string;
    contactInfo?: string; // Texto livre
}

// Adicionar outras interfaces se necessário (projetos, certificados, seções customizadas)
export interface CustomProjectItem {
  id: string;
  name: string;
  description: string; // Usar Markdown
  technologies?: string[];
  url?: string;
  repositoryUrl?: string;
}

export interface CustomCertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string; // Opcional
  credentialID?: string;
  credentialURL?: string;
}

// export interface CustomSection { id: string; title: string; content: string; }

// Interface Principal para os dados do currículo
export interface CustomResumeData {
  personalInfo: {
    name: string;
    title: string;
  };
  contactInfo?: CustomContactInfo;
  summary?: string; // Markdown
  experience?: CustomExperienceItem[];
  education?: CustomEducationItem[];
  skills?: CustomSkillCategory[];
  references?: CustomReferenceItem[];
  projects?: CustomProjectItem[];
  certifications?: CustomCertificationItem[];
  // customSections?: CustomSection[];
}

// Tipo auxiliar para as chaves das seções (usado no layoutConfig)
// Exclui 'personalInfo' pois é tratado separadamente no layout
export type ResumeSectionKey = keyof CustomResumeData;

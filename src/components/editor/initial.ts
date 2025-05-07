import { v4 as uuidv4 } from 'uuid';
import { CustomResumeData, ResumeSectionKey } from '@/types/resume-data';
import React from 'react'; // Necessário para React.CSSProperties

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  className?: string;
  layoutConfig: TemplateLayoutConfig;
  initialContent?: CustomResumeData;
}

// Adicionando uma interface para os estilos de seção
export interface SectionSpecificStyles {
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  titleColor?: string;
  subtitleColor?: string;
  borderColor?: string;
}

// Definição do sampleModernSidebarContent (RECRIADO)
export const sampleModernSidebarContent: CustomResumeData = {
  personalInfo: {
    name: 'Alice Wonderland',
    title: 'Desenvolvedora Full Stack Criativa',
  },
  contactInfo: {
    email: 'alice.dev@example.com',
    phone: '(11) 98765-4321',
    linkedin: 'linkedin.com/in/alicewonderdev',
    website: 'alicewonder.dev',
    location: 'São Paulo, SP',
  },
  summary: 'Desenvolvedora full stack apaixonada por criar soluções inovadoras e interfaces de usuário intuitivas. Experiência em JavaScript, React, Node.js e metodologias ágeis. Buscando desafios para aplicar minhas habilidades e aprender novas tecnologias.',
  experience: [
    {
      id: uuidv4(),
      company: 'Tech Solutions Inc.',
      title: 'Desenvolvedora Full Stack Pleno',
      startDate: 'Jan 2021',
      endDate: 'Presente',
      location: 'Remoto',
      description: '- Desenvolvimento e manutenção de aplicações web usando React, Next.js e Node.js.\n- Colaboração em equipes multidisciplinares para entrega de projetos de alta qualidade.\n- Participação ativa em todo o ciclo de vida do desenvolvimento de software.',
    },
    {
      id: uuidv4(),
      company: 'Web Wizards Agency',
      title: 'Desenvolvedora Frontend Júnior',
      startDate: 'Jun 2019',
      endDate: 'Dez 2020',
      location: 'São Paulo, SP',
      description: '- Criação de interfaces responsivas e interativas com HTML, CSS e JavaScript (React).\n- Integração com APIs REST para consumo de dados.',
    },
  ],
  education: [
    {
      id: uuidv4(),
      institution: 'Universidade Xyz',
      degree: 'Bacharelado em Ciência da Computação',
      fieldOfStudy: 'Ciência da Computação',
      startDate: 'Fev 2015',
      endDate: 'Dez 2018',
      description: 'Projeto de conclusão de curso sobre desenvolvimento de um sistema de gerenciamento de tarefas com foco em UX.',
    },
  ],
  skills: [
    {
      id: uuidv4(),
      categoryName: 'Linguagens de Programação',
      skills: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'Java'],
    },
    {
      id: uuidv4(),
      categoryName: 'Frontend',
      skills: ['React', 'Next.js', 'Redux', 'HTML5', 'CSS3', 'Tailwind CSS', 'Styled Components'],
    },
    {
      id: uuidv4(),
      categoryName: 'Backend',
      skills: ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'GraphQL'],
    },
    {
      id: uuidv4(),
      categoryName: 'Ferramentas e Outros',
      skills: ['Git', 'Docker', 'CI/CD', 'Metodologias Ágeis (Scrum)', 'Testes Unitários'],
    }
  ],
  references: [
    {
      id: uuidv4(),
      name: 'Bob o Construtor',
      title: 'Líder Técnico',
      company: 'Tech Solutions Inc.',
      contactInfo: 'Disponível sob solicitação.',
    }
  ],
  projects: [
    {
      id: uuidv4(),
      name: 'Meu Portfólio Pessoal',
      description: 'Website de portfólio para mostrar meus projetos e habilidades. Construído com Next.js e Tailwind CSS.',
      technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
      url: 'https://meuportfolio.dev',
      repositoryUrl: 'https://github.com/me/meu-portfolio'
    }
  ],
  certifications: [
    {
      id: uuidv4(),
      name: 'Desenvolvedor Full Stack Certificado',
      issuingOrganization: 'Awesome Certs Co.',
      issueDate: 'Mar 2022',
      credentialURL: 'https://cert.example.com/12345'
    }
  ]
};

export interface Options {
  barColor?: string;
  isBarOpen?: boolean;
  barPosition?: 'top' | 'bottom' | 'left' | 'right';
  barSize?: number;
  borderRadius?: { topLeft: number | null; topRight: number | null; bottomLeft: number | null; bottomRight: number | null; };
  bgImage?: string;
  bgPosition?: string;
  layoutGap?: string;
}


type Row = {
  id: string;
  sections?: ResumeSectionKey[];
  style?: React.CSSProperties;
  columns?: Column[];
}

type Column = {
  rows: Row[];
  style?: React.CSSProperties;
  options?: Options;
}


export interface TemplateLayoutConfig {
  type: 'singleColumn' | 'twoColumnFixedLeft' | 'twoColumnFixedRight' | 'profileFeatureLayout';
  containerStyle?: React.CSSProperties;
  columns?: Column[];
  rows?: Row[];
  fontFamily?: string;
  baseFontSize?: string;
  // Nova propriedade para estilos específicos de seção
  sectionStyles?: Partial<Record<ResumeSectionKey, SectionSpecificStyles>>;
  // Adicionar mais configurações globais de estilo se necessário
}

// Definição do BASIC_TEMPLATE (ADICIONADO AQUI)
export const BASIC_TEMPLATE: ResumeTemplate = {
  id: "basic-template",
  name: "Básico",
  description: "Modelo tradicional completo com destaque para experiência profissional.",
  className: "template-basic",
  layoutConfig: {
    type: 'singleColumn',
    fontFamily: "'Arial', sans-serif",
    baseFontSize: '11pt',
    columns: [
      {
        rows: [
          {
            id: uuidv4(),
            sections: ['summary', 'experience', 'education', 'skills', 'projects', 'references']
          }
        ]
      }
    ],
    sectionStyles: {
      summary: { textColor: '#444' },
      experience: { titleColor: '#222' }
    }
  },
  // Se o BASIC_TEMPLATE deve começar com conteúdo, defina sampleBasicContent e atribua aqui.
  // Por enquanto, sem conteúdo inicial específico, ele usará o que for passado para ResumeRenderer
  // ou um estado inicial vazio se o ResumeRenderer não receber dados.
  // Para consistência com a página principal que usa sampleModernSidebarContent como fallback:
  initialContent: undefined, // Ou poderia ser um sampleBasicContent específico
};

export const modernSidebarTemplate: ResumeTemplate = {
  id: 'modern-sidebar-template',
  name: 'Modern Sidebar',
  description: '...',
  className: 'modern-sidebar-theme',
  layoutConfig: {
    type: 'twoColumnFixedLeft',
    containerStyle: { backgroundColor: '#FFFFFF' }, // Fundo do "papel"
    fontFamily: "'Inter', sans-serif",
    baseFontSize: '10pt',
    columns: [
      {
        rows: [
          {
            id: uuidv4(),
            sections: ['summary', 'experience', 'education', 'skills', 'projects', 'references']
          }
        ]
      },
    ],
    sectionStyles: {
      summary: {
        textColor: '#333333',
        fontSize: '10pt',
      },
      experience: {
        borderColor: '#e0e0e0',
        titleColor: '#1a202c',
        subtitleColor: '#555555',
      },
    },
  },
  initialContent: sampleModernSidebarContent
};

export const profileFeatureTemplate: ResumeTemplate = {
  id: 'profile-feature-template',
  name: 'Profile Feature',
  description: 'Layout com coluna de perfil e conteúdo em duas linhas à direita.',
  className: 'profile-feature-theme',
  layoutConfig: {
    type: 'profileFeatureLayout',
    containerStyle: { backgroundColor: '#f4f4f5' }, // Um cinza claro para o fundo do "papel"
    fontFamily: "'Inter', sans-serif",
    baseFontSize: '10pt',
    columns: [
      {
        rows: [
          {
            id: uuidv4(),
            sections: ["personalInfo"]
          },
          {
            id: uuidv4(),
            columns: [
              {
                rows: [
                  {
                    id: uuidv4(),
                    sections: ['experience', 'projects', 'education', 'certifications']
                  }
                ],
              },
              {
                rows: [
                  {
                    id: uuidv4(),
                    sections: ['summary']
                  }
                ],
              }
            ]
          }
        ]
      },

    ],
    sectionStyles: {
      summary: { textColor: '#374151' },
      experience: { titleColor: '#1f2937' },
    }
  },
  initialContent: sampleModernSidebarContent // Pode criar um initialContent específico se desejar
};



export const classicTemplate: ResumeTemplate = {
  id: 'classic-template',
  name: 'Clássico',
  description: '...',
  className: 'classic-theme',
  layoutConfig: {
    type: 'singleColumn',
    containerStyle: { backgroundColor: '#f7fafc' },
    fontFamily: "'Times New Roman', serif",
    baseFontSize: '12pt',
    columns: [
      {
        rows: [
          {
            id: uuidv4(),
            sections: ['summary', 'experience', 'education', 'skills', 'references']
          }
        ]
      }
    ],
    sectionStyles: {
      summary: { textColor: '#374151' },
    }
  },
  initialContent: undefined
};



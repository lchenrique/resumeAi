import { v4 as uuidv4 } from 'uuid';
import { CustomResumeData, ResumeSectionKey } from '@/types/resume-data';
import React from 'react'; // Necessário para React.CSSProperties
import { ResumeTemplate } from '../resume/renderer/types';
import { createLayoutConfig } from '@/lib/create-layout-config';


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

export interface BorderRadius {
  topLeft?: number | null;
  topRight?: number | null;
  bottomLeft?: number | null;
  bottomRight?: number | null;
}
export interface BorderSideValues {
  top: number | null;
  right: number | null;
  bottom: number | null;
  left: number | null;
}
// Options não é mais usado diretamente no layoutConfig final, mas pode ser usado por sectionStyles
export interface Options { // Renomeado para evitar conflito com OldOptions, mas representa a mesma coisa.
  bgColor?: string;
  bgImage?: string;
  imagePosition?: string;
  imageSize?: string;
  imageOpacity?: number;
  imageRepeat?: string;
  imageAttachment?: string;
  imageBlendMode?: string;
  border?: string;
  padding?: string;
  margin?: string;
  shadow?: string;
  borderRadius?: BorderRadius;
  borderWidth?: BorderSideValues;
  borderColor?: string;
}

export const templateOne: ResumeTemplate = {
  id: "template-one",
  name: "Minimalista Elegante",
  description: "Design limpo e moderno, com foco na legibilidade e organização.",
  className: "template-one-theme",
  layoutConfig: createLayoutConfig({
    sections: [
      'personalInfo',
      'contactInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'references',
      'projects',
      'certifications',
    ] as const,
    containers: [
        {
          id: "personalInfo",
          rows: 5,
          cols: 24,
          options: {
            borderRadius: {
              topLeft: 10,
              topRight: 10,
              bottomLeft: 10,
              bottomRight: 10,
            },
          }
        },
        {
          id: "summary",
          rows: 3,
          cols: 24,
        },
        {
          id: "experience",
          rows: 9,
          cols: 24,
        },
        {
          id: "education",
          rows: 9,
          cols: 24,
        },
        {
          id: "skills",
          rows: 7,
          cols: 24,
        },
        {
          id: "references",
          rows: 6,
          cols: 24,
        },
      
    ],
  },
  ),
  initialContent: sampleModernSidebarContent,
};

export const availableTemplates: ResumeTemplate[] = [
  templateOne,
];



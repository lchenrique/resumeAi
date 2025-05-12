import { v4 as uuidv4 } from 'uuid';
import { CustomResumeData, ResumeSectionKey } from '@/types/resume-data';
import React from 'react'; // Necessário para React.CSSProperties
import { TextStyle } from './type';
import { PanelNode, ContentLeaf, LayoutItem } from '../resizable-layout/types'; // NOVAS IMPORTAÇÕES

// Interface antiga para referência durante a transformação
interface OldOptions {
  bgColor?: string;
  borderRadius?: BorderRadius;
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
  gap?: string;
  shadow?: string;
  borderWidth?: BorderSideValues;
  borderColor?: string;
}

interface OldRow {
  id: string;
  sections?: ResumeSectionKey[];
  columns?: OldColumn[]; // Referencia OldColumn
  options?: OldOptions;
}

interface OldColumn {
  id: string;
  rows: OldRow[];
  options?: OldOptions; // Adicionado para consistência se necessário
}

interface OldTemplateLayoutConfig {
  containerStyle?: React.CSSProperties;
  columns?: OldColumn[];
  rows?: OldRow[]; // Se a raiz for uma linha de seções
  fontFamily?: string;
  baseFontSize?: string;
  sectionStyles?: Partial<{
    personalInfo?: {
      name?: TextStyle;
      title?: TextStyle;
    };
    contactInfo?: {
      email?: TextStyle;
      phone?: TextStyle;
      linkedin?: TextStyle;
      website?: TextStyle;
      location?: TextStyle;
    };
    summary?: {
      content?: TextStyle;
    };
    experience?: {
      company?: TextStyle;
      position?: TextStyle;
      period?: TextStyle;
      description?: TextStyle;
    };
    education?: {
      institution?: TextStyle;
      degree?: TextStyle;
      period?: TextStyle;
      description?: TextStyle;
    };
    skills?: {
      category?: TextStyle;
      items?: TextStyle;
    };
    references?: {
      name?: TextStyle;
      position?: TextStyle;
      contact?: TextStyle;
    };
    projects?: {
      name?: TextStyle;
      description?: TextStyle;
      technologies?: TextStyle;
    };
    certifications?: {
      name?: TextStyle;
      issuer?: TextStyle;
      date?: TextStyle;
    };
  }>;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  className?: string;
  layoutConfig: PanelNode; // ATUALIZADO AQUI
  initialContent?: CustomResumeData;
}

// Adicionando uma interface para os estilos de seção
export interface SectionSpecificStyles extends TextStyle {

}

// --- FUNÇÕES DE TRANSFORMAÇÃO ---

// Helper para converter seções antigas em ContentLeafs
function sectionsToContentLeaves(sectionKeys: ResumeSectionKey[]): ContentLeaf[] {
  // Se sectionKeys for undefined ou null, retorna um array vazio para evitar erros.
  if (!sectionKeys) {
    return [];
  }
  return sectionKeys.map((key) => ({
    type: 'content',
    id: key, // A ResumeSectionKey é usada como ID para o ContentLeaf e slot Swapy
    contentId: key, // A ResumeSectionKey é usada para o renderMap
  }));
}

function transformOldRow(oldRow: OldRow): PanelNode | ContentLeaf[] {
  if (oldRow.sections && oldRow.sections.length > 0) {
    // Se a linha contém seções, ela se torna um nó 'col' (por padrão, seções empilham)
    // ou diretamente um array de ContentLeafs se for simples.
    // Para maior flexibilidade, vamos envolvê-los em um PanelNode 'col'.
    // Se houver apenas uma seção, pode ser um único ContentLeaf, mas o ResizableLayout espera PanelNode como raiz.
    const contentLeaves = sectionsToContentLeaves(oldRow.sections);
    if (contentLeaves.length === 1 && !oldRow.columns) { // Caso simples de uma única seção numa linha
        // Para consistência, e para que Panel.tsx sempre receba um PanelNode ou ContentLeaf
        // dentro de um PanelNode pai, vamos sempre retornar um PanelNode
    }
    return {
      id: oldRow.id,
      type: 'col', // As seções dentro de uma "row" antiga empilham verticalmente por padrão.
      children: contentLeaves,
      // TODO: Mapear oldRow.options para sizes ou outras props do PanelNode se aplicável
    };
  } else if (oldRow.columns && oldRow.columns.length > 0) {
    // Se a linha contém colunas, ela se torna um nó 'row'
    return {
      id: oldRow.id,
      type: 'row', // As colunas dentro de uma "row" antiga são dispostas horizontalmente.
      children: oldRow.columns.map(col => transformOldColumn(col)),
      // TODO: Mapear oldRow.options
    };
  }
  // Caso a linha esteja vazia ou malformada (sem sections ou columns válidos)
  return { id: oldRow.id, type: 'col', children: [] }; // Retorna um nó de coluna vazio
}

function transformOldColumn(oldColumn: OldColumn): PanelNode {
  return {
    id: oldColumn.id,
    type: 'col', // Uma "coluna" antiga é naturalmente um PanelNode do tipo 'col'.
    children: oldColumn.rows.map(row => transformOldRow(row)).flat().filter(Boolean) as LayoutItem[],
    // O .flat() e filter(Boolean) são para o caso de transformOldRow poder retornar ContentLeaf[]
    // e precisarmos achatá-los e remover nulos/undefined, embora a versão atual de transformOldRow
    // sempre retorne PanelNode. Ajustar se transformOldRow mudar.
    // Atualmente, transformOldRow sempre retorna PanelNode, então .flat() pode não ser necessário
    // mas deixo por segurança caso a lógica de transformOldRow evolua para retornar arrays.
    // Melhor ainda: transformOldRow deve consistentemente retornar PanelNode.
    // children: oldColumn.rows.map(row => transformOldRow(row) as PanelNode), // Ajustado para o retorno atual

    // TODO: Mapear oldColumn.options
  };
}

function transformOldLayoutConfig(oldConfig: OldTemplateLayoutConfig): PanelNode {
  let rootChildren: LayoutItem[] = [];
  if (oldConfig.columns && oldConfig.columns.length > 0) {
    // Se a configuração antiga tem colunas na raiz, a raiz do novo layout é uma 'row'
    // que contém essas colunas transformadas.
    rootChildren = oldConfig.columns.map(col => transformOldColumn(col));
    return {
      id: uuidv4(), // ID para o nó raiz
      type: 'row',
      children: rootChildren,
      // TODO: Mapear containerStyle, fontFamily, baseFontSize para o PanelNode raiz ou um wrapper
    };
  } else if (oldConfig.rows && oldConfig.rows.length > 0) {
    // Se a configuração antiga tem linhas na raiz (menos comum, mas possível)
    rootChildren = oldConfig.rows.map(row => transformOldRow(row) as PanelNode);
    return {
      id: uuidv4(),
      type: 'col',
      children: rootChildren,
    }
  }
  // Fallback para uma configuração vazia
  return { id: uuidv4(), type: 'col', children: [] };
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
  borderRadius?: BorderRadius;
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
  gap?: string;
  shadow?: string;
  borderWidth?: BorderSideValues;
  borderColor?: string;
}

// Template 1: Coluna Única Elegante
// A estrutura original de templateOne.layoutConfig
const oldTemplateOneLayoutConfig: OldTemplateLayoutConfig = {
  fontFamily: "'Poppins', sans-serif",
  baseFontSize: '10.5pt',
  columns: [
    {
      id: uuidv4(), // Mantendo IDs originais para colunas e linhas se possível, ou gerando novos.
      rows: [
        { id: uuidv4(), sections: ['personalInfo'] },
        {
          id: uuidv4(), sections: ['contactInfo'],
          options: { bgColor: "#353535", borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 } }
        },
        {
          id: uuidv4(), sections: ['experience', 'education'],
          options: { bgColor: "#ebebeb", borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 } }
        },
        { id: uuidv4(), sections: ['skills', 'projects'] },
        { id: uuidv4(), sections: ['certifications', 'references'] },
        // { id: uuidv4(), sections: ['contactInfo'] } // Duplicado, removendo para simplificar
      ],
    }
  ],
  sectionStyles: {
    personalInfo: { title: { textColor: '#111827', } },
    summary: { content: { textColor: '#111827', } }, // Summary não está no layout de templateOne
    experience: { company: { textColor: '#1f2937', }, position: { textColor: '#1f2937', }, period: { textColor: '#1f2937', }, description: { textColor: '#1f2937', } },
    education: { institution: { textColor: '#1f2937', }, degree: { textColor: '#1f2937', }, period: { textColor: '#1f2937', }, description: { textColor: '#1f2937', } },
    skills: { category: { textColor: '#1f2937', }, items: { textColor: '#1f2937', } },
    projects: { name: { textColor: '#1f2937', }, description: { textColor: '#1f2937', }, technologies: { textColor: '#1f2937', } },
    contactInfo: { email: { textColor: '#ffffff', }, phone: { textColor: '#ffffff', }, linkedin: { textColor: '#ffffff', }, website: { textColor: '#ffffff', }, location: { textColor: '#ffffff', } }
  }
};

export const templateOne: ResumeTemplate = {
  id: "template-one",
  name: "Minimalista Elegante",
  description: "Design limpo e moderno, com foco na legibilidade e organização.",
  className: "template-one-theme",
  layoutConfig: transformOldLayoutConfig(oldTemplateOneLayoutConfig), // APLICANDO A TRANSFORMAÇÃO
  // Os sectionStyles e outras propriedades globais (fontFamily, baseFontSize)
  // precisam ser gerenciados de forma diferente agora.
  // Poderiam ser passados para ResizableLayout ou aplicados globalmente.
  // Por ora, vou mantê-los no objeto oldTemplateOneLayoutConfig, mas o ResizableLayout
  // atualmente só aceita initialLayout (PanelNode) e renderMap.
  // Precisaremos de uma estratégia para os estilos globais e de seção.
  initialContent: sampleModernSidebarContent,
};

// Para os outros templates (templateTwo, templateThree, templateFour),
// você precisará definir suas estruturas "old" (OldTemplateLayoutConfig)
// e então aplicar transformOldLayoutConfig(seuOldLayoutConfig).

// Exemplo para templateTwo (precisaria da definição completa de oldTemplateTwoLayoutConfig)
/*
const oldTemplateTwoLayoutConfig: OldTemplateLayoutConfig = { ... };
export const templateTwo: ResumeTemplate = {
  id: "template-two",
  name: "Perfil Profissional",
  // ...
  layoutConfig: transformOldLayoutConfig(oldTemplateTwoLayoutConfig),
  initialContent: sampleModernSidebarContent,
};
*/

// Manter as definições originais de templateTwo, three, four por enquanto,
// mas elas precisarão ser transformadas para o novo formato PanelNode.
// Vou comentá-las para evitar erros de tipo imediatos,
// e você poderá transformá-las uma a uma.

export const templateTwo: ResumeTemplate = {
  id: "template-two",
  name: "Perfil Profissional",
  description: "Layout moderno com barra lateral à esquerda para informações de destaque.",
  className: "template-two-theme",
  layoutConfig: { // Placeholder - PRECISA SER TRANSFORMADO
    id: 'temp2-root', type: 'col', children: [
      {id: 'temp2-placeholder', type: 'content', contentId: 'summary'}
    ]
  },
  initialContent: sampleModernSidebarContent,
};

export const templateThree: ResumeTemplate = {
  id: "template-three",
  name: "Destaque Moderno",
  description: "Conteúdo principal à esquerda com uma barra lateral elegante à direita.",
  className: "template-three-theme",
  layoutConfig: { // Placeholder - PRECISA SER TRANSFORMADO
    id: 'temp3-root', type: 'col', children: [
      {id: 'temp3-placeholder', type: 'content', contentId: 'summary'}
    ]
  },
  initialContent: sampleModernSidebarContent,
};

export const templateFour: ResumeTemplate = {
  id: "template-four",
  name: "Estrutura Dinâmica",
  description: "Layout com colunas e linhas aninhadas para uma apresentação criativa.",
  className: "template-four-theme",
  layoutConfig: { // Placeholder - PRECISA SER TRANSFORMADO
    id: 'temp4-root', type: 'col', children: [
      {id: 'temp4-placeholder', type: 'content', contentId: 'summary'}
    ]
  },
  initialContent: sampleModernSidebarContent,
};


// --- EXPORTAR LISTA DE TEMPLATES DISPONÍVEIS ---
export const availableTemplates: ResumeTemplate[] = [
  templateOne,
  templateTwo,
  templateThree,
  templateFour,
];
// ... (o resto do arquivo, como sectionStyles e initialContent, pode permanecer como está,
// mas a forma como sectionStyles é aplicado pode precisar mudar, já que layoutConfig agora é PanelNode)

// NOTA SOBRE ESTILOS (fontFamily, baseFontSize, sectionStyles, containerStyle):
// A estrutura PanelNode atual não tem um lugar padrão para esses estilos.
// Estratégias:
// 1. Passar o objeto `oldTemplateOneLayoutConfig` (ou um subconjunto dele com os estilos)
//    adicionalmente para o `ResumeRenderer` e aplicar os estilos lá.
// 2. Modificar `PanelNode` para incluir uma propriedade opcional `styleProps` ou similar.
// 3. Usar contextos React para prover esses estilos globalmente ou por seção.
// Por enquanto, eles estão "perdidos" no que diz respeito ao `ResizableLayout` porque
// `transformOldLayoutConfig` só retorna a estrutura de nós.
// O `className` em `ResumeTemplate` pode ser usado para aplicar CSS global para o template.



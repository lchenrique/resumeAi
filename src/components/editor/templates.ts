import { v4 as uuidv4 } from 'uuid';
import { ResumeTemplate } from './initial';
import { BASIC_TEMPLATE_CONTENT } from './templates/content/basic';
import { MODERN_SIDEBAR_TEMPLATE_CONTENT } from './templates/content/modern-sidebar';


export interface YooptaContentValue {
  [key: string]: {
    id: string;
    type: string;
    meta: {
      depth: number;
      order: number;
      align?: 'left' | 'center' | 'right';
    };
    value: {
      id: string;
      type: string;
      children: { text: string, bold?: boolean, italic?: boolean, code?: boolean, highlight?: {color?:string, backgroundColor?: string} }[];
      props?: {
        nodeType: string;
        theme?: string;

      }
    }[];
  };
}

// Função helper para criar Divider
export const createDivider = (order: number): YooptaContentValue => ({
  [`idDivider${order}`]: {
    id: `idDivider${order}`,
    type: "Divider",
    meta: { depth: 0, order },
    value: [{ id: uuidv4(), type: "divider", children: [{ text: "" }], props: { nodeType: "block" } }]
  }
});



export const BASIC_TEMPLATE: ResumeTemplate = {
  id: "basic-template",
  name: "Básico",
  description: "Modelo tradicional completo com destaque para experiência profissional",
  content: BASIC_TEMPLATE_CONTENT,
  hasPhoto: false,
  className: "template-basic"
};

export const MODERN_SIDEBAR_TEMPLATE: ResumeTemplate = {
  id: "modern-sidebar-template",
  name: "Moderno com Barra Lateral",
  description: "Modelo moderno com barra lateral para destacar habilidades e projetos",
  content: MODERN_SIDEBAR_TEMPLATE_CONTENT,
  hasPhoto: true,
  className: "template-modern-sidebar",
  bgImage: "https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  bgColor: "#1a0070",
  sidebarSize: 5,
  borderRadius: {
    topLeft:15,
    topRight: 15,
    bottomLeft: 15,
    bottomRight: 15
  }
};

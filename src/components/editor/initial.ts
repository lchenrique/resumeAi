import { v4 as uuidv4 } from 'uuid';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  content: YooptaContentValue;
  hasPhoto?: boolean;
  className: string;
  bgImage?: string;
  bgColor?: string;
  borderRadius?: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  sidebarSize?: number;
}

// Importamos os templates do arquivo templates.ts
import { 
  BASIC_TEMPLATE, 
  MODERN_SIDEBAR_TEMPLATE,
  YooptaContentValue,
} from './templates';
import { BASIC_TEMPLATE_CONTENT } from './templates/content/basic';

// Coleção de todos os templates disponíveis
export const RESUME_TEMPLATES: ResumeTemplate[] = [
  BASIC_TEMPLATE,
  MODERN_SIDEBAR_TEMPLATE,
];

// Exporta o template padrão para manter compatibilidade com o código existente
export const RESUME_TEMPLATE = BASIC_TEMPLATE_CONTENT;

// Função para obter um template pelo ID
export const getTemplateById = (templateId: string): ResumeTemplate | undefined => {
  return RESUME_TEMPLATES.find(template => template.id === templateId);
};


import { v4 as uuidv4 } from 'uuid';

// Interface para o conteúdo dos templates Yoopta
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
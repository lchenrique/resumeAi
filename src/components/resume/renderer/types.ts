import { CustomResumeData } from "@/types/resume-data";

// Tipos para o modelo de layout
type LayoutDirection = 'row' | 'column';

// Opções de estilo
export interface Options {
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

// Definição para uma CÉLULA individual no layout
export interface CellType {
    contentId: ResumeSectionKey;
    options?: Options;
}

export const resumeSectionKeys = [
    "personalInfo", "contactInfo", "summary", "experience", "education",
    "skills", "references", "projects", "certifications"
  ] as const;
  
  type ResumeSectionKey = typeof resumeSectionKeys[number];
  
  export interface ContainerType<T> {
    id: T;
    rows: number;
    cols: number;
    options?: Options;
  }
  
  export interface ResumeLayout<T extends readonly string[] = readonly string[]> {
    sections: T;
    containers: ContainerType<T[number]>[];
  }

export interface ResumeTemplate<T extends readonly string[] = readonly string[]> {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
    className?: string;
    layoutConfig: ResumeLayout<T>;
    initialContent?: CustomResumeData;
}
  
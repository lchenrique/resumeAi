import { Block, BlockNoteDocument } from "@/components/editor/type";
import { ResumeLayout } from "@/components/resume/renderer/types";
import { CustomResumeData, ResumeSectionKey } from "@/types/resume-data";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChildren(value: any[] | any, displayName: string): any {
  const childrenArray: any[] = Array.isArray(value) ? value : [value];

  for (const child of childrenArray) {
    // Verifica se o elemento atual corresponde ao displayName
    if (child?.type?.displayName === displayName) {
      return child as React.ReactElement;
    }

    // Se o elemento atual tem filhos, chama a função recursivamente para procurar nos filhos
    if (child?.props?.children) {
      const nestedChild = getChildren(child.props.children, displayName) as any;

      // Se encontrou o elemento nos filhos, retorna imediatamente
      if (nestedChild) {
        return nestedChild;
      }
    }
  }

  // Retorna undefined se não encontrou o elemento
  return undefined;
}


export const convertToBlock = (type: keyof CustomResumeData, value: CustomResumeData, style: ResumeLayout["cells"][]): BlockNoteDocument | null => {

  if (!value) return null;
  const sectionsEntries = Object.entries(value);

  const separetedSections = sectionsEntries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, any>);

  const personalInfo = separetedSections.personalInfo as CustomResumeData["personalInfo"];
  const contactInfo = separetedSections.contactInfo as CustomResumeData["contactInfo"];
  const summary = separetedSections.summary as CustomResumeData["summary"];
  const experience = separetedSections.experience as CustomResumeData["experience"];
  const education = separetedSections.education as CustomResumeData["education"];
  const skills = separetedSections.skills as CustomResumeData["skills"];
  const references = separetedSections.references as CustomResumeData["references"];
  const projects = separetedSections.projects as CustomResumeData["projects"];
  const certifications = separetedSections.certifications as CustomResumeData["certifications"];

  const personalInfoBlock = getBLockBasedOnType("personalInfo", personalInfo, style);
  const contactInfoBlock = getBLockBasedOnType("contactInfo", contactInfo, style);
  const summaryBlock = getBLockBasedOnType("summary", summary, style);
  const experienceBlock = getBLockBasedOnType("experience", experience, style);
  const educationBlock = getBLockBasedOnType("education", education, style);
  const skillsBlock = getBLockBasedOnType("skills", skills, style);
  const referencesBlock = getBLockBasedOnType("references", references, style);
  const projectsBlock = getBLockBasedOnType("projects", projects, style);
  const certificationsBlock = getBLockBasedOnType("certifications", certifications, style);

  const blockToRetun: Record<keyof CustomResumeData, BlockNoteDocument | null> = {
    personalInfo: personalInfoBlock,
    contactInfo: contactInfoBlock,
    summary: summaryBlock,
    experience: experienceBlock,
    education: educationBlock,
    skills: skillsBlock,
    references: referencesBlock,
    projects: projectsBlock,
    certifications: certificationsBlock
  }

  return blockToRetun[type]




}

const getBLockBasedOnType = (
  type: keyof CustomResumeData,
  value: any,
  style: any): BlockNoteDocument | null => {
  switch (type) {
    case "personalInfo":
      return [{
        type: "heading",
        content: value.name,
        props: {
          level: 1
        }
      }, {
        type: "heading",
        content: value.title,
        props: {
          level: 3
        }
      }] as BlockNoteDocument;

    case "contactInfo":
      return [{
        type: "bulletListItem",
        content:[{
          type: "text",
          text: value.email,
          styles: {
            ...style?.contactInfo?.email,
            color: style?.contactInfo?.email?.textColor
          }
        }],
       
      }, {
        type: "bulletListItem",
        content: [{
          type: "text",
          text: value.phone,
          styles: {
            ...style?.contactInfo?.phone,
            color: style?.contactInfo?.phone?.textColor
          }
        }]
      }, {
        type: "bulletListItem",
        content: [{
          type: "text",
          text: value.linkedin,
          styles: {
            ...style?.contactInfo?.linkedin,
            color: style?.contactInfo?.linkedin?.textColor
          }
        }]
      }, {
        type: "bulletListItem",
        content: [{
          type: "text",
          text: value.website,
          styles: {
            ...style?.contactInfo?.website,
            color: style?.contactInfo?.website?.textColor
          }
        }],
      }, {
        type: "bulletListItem",
        content: [{
          type: "text",
          text: value.location,
          styles: {
            ...style?.contactInfo?.location,
            color: style?.contactInfo?.location?.textColor
          }
        }],
      }];
    case "summary":
      return [{
        type: "paragraph",
        content: value,
        styles: style?.summary
      }]
    case "experience":
      const experience = value.map((experience: any) => ({
          type: "text",
          text: experience.company,
          styles:{
            bold: false,
          },
      }))
      return [{
        type: "heading",
        content: experience,
        styles: style?.experience,
        props:{
          level: 3
        }
      }]
    case "education":
      return [{
        type: "heading",
        content: value.school,
        styles: style?.education
      }]
    case "skills":
      return [{
        type: "heading",
        content: value.skills,
        styles: style?.skills
      }]
      
    default:
      return null;
  }


}

// create a hook to get the selected template whith a zustand store

import { ResumeTemplate } from '@/components/editor/initial';
import { BASIC_TEMPLATE } from '@/components/editor/templates';
import { YooptaContentValue } from '@yoopta/editor';
import { create } from 'zustand';

export interface TemplateStore {
  selectedTemplate: ResumeTemplate
  setSelectedTemplate: (template: ResumeTemplate) => void;
}
const useTemplate = create<TemplateStore>((set) => ({
  selectedTemplate: BASIC_TEMPLATE,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));

export default useTemplate;


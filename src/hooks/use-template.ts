// create a hook to get the selected template whith a zustand store

import { BASIC_TEMPLATE, ResumeTemplate } from '@/components/editor/initial';
import { create } from 'zustand';

export interface TemplateStore {
  selectedTemplate: ResumeTemplate
  setSelectedTemplate: (template: ResumeTemplate) => void;
}
const useTemplate = create<TemplateStore>((set) => ({
  selectedTemplate: BASIC_TEMPLATE ,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));

export default useTemplate;


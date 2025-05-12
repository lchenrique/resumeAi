// create a hook to get the selected template whith a zustand store

import { ResumeTemplate, availableTemplates } from '@/components/editor/initial';
import { create } from 'zustand';

export interface TemplateStore {
  selectedTemplate: ResumeTemplate
  setSelectedTemplate: (template: ResumeTemplate) => void;
}
const useTemplate = create<TemplateStore>((set) => ({
  selectedTemplate: availableTemplates[0] ,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));

export default useTemplate;


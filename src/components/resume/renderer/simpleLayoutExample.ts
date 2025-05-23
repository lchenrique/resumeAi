import { ResumeSectionKey } from '@/types/resume-data';
import { ResumeLayout } from './types';




// Layout exemplo 1: Sidebar Left - Layout com barra lateral à esquerda
export const sidebarLeftLayout: ResumeLayout = {
  rootId: 'root-container',
  containers: {
    'root-container': {
      direction: 'row',
      childrenIds: ['sidebar-container', 'main-container'],
      sizes: [30, 70] // 30% para barra lateral, 70% para conteúdo principal
    },
    'sidebar-container': {
      direction: 'column',
      childrenIds: ['personal-info-cell', 'contact-info-cell', 'skills-cell'],
      sizes: [20, 20, 60]
    },
    'main-container': {
      direction: 'column',
      childrenIds: ['summary-cell', 'experience-container', 'education-cell'],
      sizes: [15, 65, 20]
    },
    'experience-container': {
      direction: 'column',
      childrenIds: ['experience-cell', 'projects-cell'],
      sizes: [70, 30]
    }
  },
  cells: {
    'personal-info-cell': { contentId: 'personalInfo' },
    'contact-info-cell': { contentId: 'contactInfo' },
    'skills-cell': { contentId: 'skills' },
    'summary-cell': { contentId: 'summary' },
    'experience-cell': { contentId: 'experience' },
    'projects-cell': { contentId: 'projects' },
    'education-cell': { contentId: 'education', }
  }
};

// Layout exemplo 2: Top Header - Layout com cabeçalho superior e duas colunas abaixo
export const topHeaderLayout: ResumeLayout = {
  rootId: 'root-container',
  containers: {
    'root-container': {
      direction: 'column',
      childrenIds: ['header-container', 'content-container'],
      sizes: [20, 80]
    },
    'header-container': {
      direction: 'row',
      childrenIds: ['personal-info-cell', 'contact-info-cell'],
      sizes: [60, 40]
    },
    'content-container': {
      direction: 'row',
      childrenIds: ['left-column', 'right-column'],
      sizes: [50, 50]
    },
    'left-column': {
      direction: 'column',
      childrenIds: ['summary-cell', 'experience-cell'],
      sizes: [30, 70]
    },
    'right-column': {
      direction: 'column',
      childrenIds: ['skills-cell', 'education-cell', 'certifications-cell'],
      sizes: [30, 40, 30]
    }
  },
  cells: {
    'personal-info-cell': { contentId: 'personalInfo' },
    'contact-info-cell': { contentId: 'contactInfo' },
    'summary-cell': { contentId: 'summary' },
    'experience-cell': { contentId: 'experience' },
    'skills-cell': { contentId: 'skills' },
    'education-cell': { contentId: 'education' },
    'certifications-cell': { contentId: 'certifications' }
  }
};

// Layout exemplo 3: Complexo com múltiplos níveis de aninhamento
export const complexLayout: ResumeLayout = {
  rootId: 'root',
  containers: {
    'root': {
      direction: 'column',
      childrenIds: ['header', 'body'],
      sizes: [15, 85]
    },
    'header': {
      direction: 'row',
      childrenIds: ['personal-info', 'summary'],
      sizes: [40, 60]
    },
    'body': {
      direction: 'row',
      childrenIds: ['left-sidebar', 'main-content'],
      sizes: [30, 70]
    },
    'left-sidebar': {
      direction: 'column',
      childrenIds: ['contact-info', 'skills', 'languages'],
      sizes: [20, 50, 30]
    },
    'main-content': {
      direction: 'column',
      childrenIds: ['experience-section', 'bottom-row'],
      sizes: [60, 40]
    },
    'experience-section': {
      direction: 'column',
      childrenIds: ['experience'],
      sizes: [100]
    },
    'bottom-row': {
      direction: 'row',
      childrenIds: ['education', 'right-sidebar'],
      sizes: [60, 40]
    },
    'right-sidebar': {
      direction: 'column',
      childrenIds: ['projects', 'certifications'],
      sizes: [50, 50]
    }
  },
  cells: {
    'personal-info': { contentId: 'personalInfo' },
    'summary': { contentId: 'summary' },
    'contact-info': { contentId: 'contactInfo' },
    'skills': { contentId: 'skills' },
    'languages': { contentId: 'skills' }, // Segundo componente de skills, poderia ser específico para idiomas
    'experience': { contentId: 'experience' },
    'education': { contentId: 'education' },
    'projects': { contentId: 'projects' },
    'certifications': { contentId: 'certifications' }
  }
};

// Exporta os layouts de exemplo
export const simpleLayouts = {
  sidebarLeft: sidebarLeftLayout,
  topHeader: topHeaderLayout,
  complex: complexLayout
};

export default simpleLayouts;
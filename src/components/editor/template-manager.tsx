import React from 'react';
import { ResumeTemplate, availableTemplates } from './initial';

interface TemplateManagerProps {
  onSelectTemplate: (template: ResumeTemplate) => void;
  selectedTemplate: ResumeTemplate;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelectTemplate, selectedTemplate }) => {
  const templateCategories = [
    {
      id: 'simple',
      name: 'Simples',
      templates:availableTemplates
    }
  ];

  const handleTemplateSelect = (template: ResumeTemplate) => {
    onSelectTemplate(template);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          Escolha um Modelo
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Seu conteúdo será adaptado ao novo modelo.
        </p>
      </div>

      <div className="space-y-5 px-4 pb-4">
        {templateCategories.map((category) => (
          <div key={category.id} className="space-y-2.5">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {category.name}
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {category.templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left transition-all duration-150 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${selectedTemplate.id === template.id 
                      ? 'ring-2 ring-blue-500 border-transparent shadow-md' 
                      : 'border border-gray-200 hover:border-gray-300 hover:shadow-lg bg-background'
                    }`}
                >
                  <div className="relative">
                    <div className="aspect-square bg-background p-2 overflow-hidden">
                      <div className={`w-full h-full template-preview ${template.id} border border-gray-100 rounded scale-[95%] origin-top`}>
                        <PreviewContent templateId={template.id} />
                      </div>
                    </div>
                    
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-10 flex items-center justify-center pointer-events-none">
                        <div className="bg-blue-600 rounded-full p-1 shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-gray-800 text-sm truncate">
                        {template.name}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PreviewContent: React.FC<{ templateId: string }> = ({ templateId }) => {
  // Basic structure elements for previews
  const Header = () => <div className="h-3 w-1/2 bg-gray-700 rounded-sm mb-1" />;
  const SubHeader = () => <div className="h-2 w-3/4 bg-gray-400 rounded-sm mb-2" />;
  const SectionTitle = () => <div className="h-2.5 w-1/3 bg-gray-600 rounded-sm mb-1 mt-2" />;
  const Para = ({ lines = 2 }: { lines?: number }) => (
    <div className="space-y-1">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className={`h-1.5 ${i === lines - 1 ? 'w-5/6' : 'w-full'} bg-gray-300 rounded-sm`} />
      ))}
    </div>
  );
  const Bullet = () => (
    <div className="flex items-start space-x-1 pl-1">
      <div className="w-1 h-1 bg-gray-400 rounded-full mt-0.5 flex-shrink-0" />
      <div className="h-1.5 w-full bg-gray-300 rounded-sm" />
    </div>
  );

  switch (templateId) {
    case 'professional-template':
      return (
        <div className="h-full flex p-1">
          <div className="w-1/5 bg-gray-800 mr-1 rounded-l-sm" />
          <div className="flex-1 space-y-1">
            <Header />
            <SubHeader />
            <SectionTitle />
            <Para lines={2} />
            <SectionTitle />
            <Bullet />
          </div>
        </div>
      );
    case 'contemporary-photo-template':
      return (
        <div className="h-full flex flex-col p-1 space-y-1">
          <div className="flex justify-between items-start">
            <div className="w-2/3 space-y-1">
              <Header />
              <SubHeader />
            </div>
            <div className="w-4 h-4 bg-gray-400 rounded-full mt-0.5 flex-shrink-0" title="Photo Placeholder"></div>
          </div>
          <SectionTitle />
          <Para lines={2} />
          <SectionTitle />
          <Bullet />
        </div>
      );
    default: // Basic, Classic, Elegant, Executive
      return (
        <div className="h-full flex flex-col p-1 space-y-1">
          <Header />
          <SubHeader />
          <SectionTitle />
          <Para lines={2} />
          <SectionTitle />
          <Bullet />
          <Bullet />
        </div>
      );
  }
};

export default TemplateManager; 
"use client";

import React from 'react';
import { useFloatingControls } from '../FloatingControlsProvider';
import ControlButton from '../base/ControlButton';
import ControlPanel from '../base/ControlPanel';
import { Plus, Trash2, Eye, EyeOff, Copy, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Section {
  id: string;
  title: string;
  type: string;
  visible: boolean;
}

const SectionControl: React.FC = () => {
  const { controls, toggleControl } = useFloatingControls();
  const control = controls.section;
  const [sections, setSections] = React.useState<Section[]>([
    { id: '1', title: 'Informações Pessoais', type: 'info', visible: true },
    { id: '2', title: 'Educação', type: 'education', visible: true },
    { id: '3', title: 'Experiência', type: 'experience', visible: true },
    { id: '4', title: 'Habilidades', type: 'skills', visible: true }
  ]);
  const [newSectionTitle, setNewSectionTitle] = React.useState('');
  const [newSectionType, setNewSectionType] = React.useState('custom');

  const handleAddSection = () => {
    if (newSectionTitle.trim() !== '') {
      const newSection: Section = {
        id: Date.now().toString(),
        title: newSectionTitle,
        type: newSectionType,
        visible: true
      };
      setSections([...sections, newSection]);
      setNewSectionTitle('');
      setNewSectionType('custom');
    }
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleDuplicateSection = (sectionToDuplicate: Section) => {
    const newSection: Section = {
      ...sectionToDuplicate,
      id: Date.now().toString(),
      title: `${sectionToDuplicate.title} (Cópia)`
    };
    setSections(prevSections => [...prevSections, newSection]);
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, visible: !section.visible } : section
    ));
  };

  return (
    <>
      <ControlButton
        onClick={() => toggleControl('section')}
        isOpen={control.isOpen}
        icon={control.icon}
        label={control.label}
      />
      
      <ControlPanel
        isOpen={control.isOpen}
        onClose={() => toggleControl('section')}
        title="Gerenciar Seções"
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Adicionar Nova Seção</Label>
            <Input
              placeholder="Nome da Seção"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="h-8 text-xs"
            />
            <Select value={newSectionType} onValueChange={setNewSectionType}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Tipo de Seção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="info">Informações</SelectItem>
                <SelectItem value="education">Educação</SelectItem>
                <SelectItem value="experience">Experiência</SelectItem>
                <SelectItem value="skills">Habilidades</SelectItem>
                <SelectItem value="languages">Idiomas</SelectItem>
                <SelectItem value="projects">Projetos</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAddSection} className="w-full h-8 text-xs">
              <Plus size={14} className="mr-1" /> Adicionar Seção
            </Button>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Seções Existentes</Label>
            <ScrollArea className="h-[180px] mt-1 border rounded-md p-2">
              {sections.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma seção adicionada.</p>
              )}
              <div className="space-y-1.5">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-1.5 rounded border text-xs ${
                      section.visible ? 'bg-accent/50' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <GripVertical size={14} className="cursor-grab text-muted-foreground" />
                      <span className="font-medium truncate" title={section.title}>{section.title}</span>
                    </div>
                    <div className="flex items-center shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSectionVisibility(section.id)}
                        className="h-6 w-6"
                        title={section.visible ? "Ocultar" : "Mostrar"}
                      >
                        {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateSection(section)}
                        className="h-6 w-6"
                        title="Duplicar"
                      >
                        <Copy size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSection(section.id)}
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        title="Remover"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </ControlPanel>
    </>
  );
};

export default SectionControl; 
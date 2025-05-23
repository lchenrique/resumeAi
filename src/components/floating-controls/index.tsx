"use client";

import React, { useState } from 'react';
import FloatingControlsProvider from './FloatingControlsProvider';
import StyleControl from './controls/StyleControl';
import LayoutControl from './controls/LayoutControl';
import SectionControl from './controls/SectionControl';
import { Button } from '../ui/button';
import { useEditorContext } from '@/contexts/editor-context';
import { FileDown, Loader2, SaveIcon } from 'lucide-react';
import { ModeToggle } from '../theme-toggle';
import { useExportPDF } from '@/hooks/use-export-pdf';
const FloatingControls: React.FC = () => {
  const { savePdfData, isSaving } = useEditorContext();
  const { handleExportPDF, isExporting } = useExportPDF();
  return (
    // O Provider já está aqui, então os controles filhos terão acesso ao contexto.
    // Os ajustes de posicionamento são feitos dentro de ControlButton e ControlPanel.
    <FloatingControlsProvider>
      <Button size='icon' variant='outline' onClick={() => savePdfData()} className='shadow-lg'>
        {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <SaveIcon className='w-4 h-4' />}
      </Button>
      <Button size='icon' variant='outline' onClick={() => handleExportPDF()} className='shadow-lg'>
        {isExporting ? <Loader2 className='w-4 h-4 animate-spin' /> : <FileDown className="h-4 w-4" />}
      </Button>
      <StyleControl />
      <LayoutControl />
      <SectionControl />
     
      <ModeToggle />
    </FloatingControlsProvider>
  );
};

export default FloatingControls; 
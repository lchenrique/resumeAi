"use client";

import React from 'react';
import FloatingControlsProvider from './FloatingControlsProvider';
import StyleControl from './controls/StyleControl';
import LayoutControl from './controls/LayoutControl';
import SectionControl from './controls/SectionControl';

const FloatingControls: React.FC = () => {
  return (
    // O Provider já está aqui, então os controles filhos terão acesso ao contexto.
    // Os ajustes de posicionamento são feitos dentro de ControlButton e ControlPanel.
    <FloatingControlsProvider>
      <StyleControl />
      <LayoutControl />
      <SectionControl />
    </FloatingControlsProvider>
  );
};

export default FloatingControls; 
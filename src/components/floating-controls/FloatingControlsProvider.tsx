"use client";

import React, { createContext, useContext, useState } from 'react';
import { Layout, Palette, Layers, MoveVertical } from 'lucide-react';
import { Control, ControlsContextType, ControlType } from './types';

// Valores iniciais para os controles
const initialControls: Record<ControlType, Control> = {
  style: {
    id: 'style',
    isOpen: false,
    label: 'Estilo',
    icon: <Palette size={18} />
  },
  layout: {
    id: 'layout',
    isOpen: false,
    label: 'Layout',
    icon: <Layout size={18} />
  },
  section: {
    id: 'section',
    isOpen: false,
    label: 'Seções',
    icon: <Layers size={18} />
  },
  order: {
    id: 'order',
    isOpen: false,
    label: 'Ordem',
    icon: <MoveVertical size={18} />
  }
};

const ControlsContext = createContext<ControlsContextType | undefined>(undefined);

export const useFloatingControls = () => {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error('useFloatingControls deve ser usado dentro de FloatingControlsProvider');
  }
  return context;
};

export const FloatingControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [controls, setControls] = useState<Record<ControlType, Control>>(initialControls);

  const toggleControl = (id: ControlType) => {
    setControls(prev => {
      const newControls = { ...prev };
      Object.keys(newControls).forEach(key => {
        if (key !== id) {
          newControls[key as ControlType].isOpen = false;
        }
      });
      newControls[id].isOpen = !newControls[id].isOpen;
      return newControls;
    });
  };

  const closeAllControls = () => {
    setControls(prev => {
      const newControls = { ...prev };
      Object.keys(newControls).forEach(key => {
        newControls[key as ControlType].isOpen = false;
      });
      return newControls;
    });
  };

  return (
    <ControlsContext.Provider value={{ controls, toggleControl, closeAllControls }}>
      {children}
    </ControlsContext.Provider>
  );
};

export default FloatingControlsProvider; 
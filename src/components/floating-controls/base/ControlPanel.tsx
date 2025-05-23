"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { ControlPanelProps } from '../types';
import { Button } from '@/components/ui/button';

const ControlPanel: React.FC<ControlPanelProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  ;

  return (
    <Card className={`fixed top-32 right-16 z-40 w-72 shadow-xl transition-all duration-300 ease-in-out print:hidden bg-background`}>
      <CardHeader className="py-2 px-3 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
          aria-label="Fechar painel"
        >
          <X size={16} />
        </Button>
      </CardHeader>
      <CardContent className="p-3 max-h-[calc(100vh-240px)] overflow-y-auto">
        {children}
      </CardContent>
    </Card>
  );
};

export default ControlPanel; 
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ControlButtonProps } from '../types';
import { cn } from '@/lib/utils';

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  isOpen,
  icon,
  label,
  className
}) => {
  // Ajuste de classes de posicionamento para evitar sobreposição com o header e navbar
  // O valor de 'top' pode precisar de ajuste fino dependendo da altura combinada do Header e MainNavbar

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant={isOpen ? "default" : "outline"}
            size="icon"
            className={cn(` shadow-lg transition-all duration-300 ${isOpen ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`, className)}
            aria-label={label}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={5} side={'left'}>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ControlButton; 
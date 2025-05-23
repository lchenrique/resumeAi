"use client";

import React, { ComponentRef } from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Highlighter, Eraser } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Highlight as HighlightExtension } from "@tiptap/extension-highlight"; // Para os comandos

interface HighlightButtonProps {
  editor: Editor;
  onOpenChange?: (open: boolean) => void;
  // Adicione uma prop para cores personalizadas se desejar
  // colors?: Array<{ name: string; color: string }>;
}

// Cores de destaque padrão (você pode personalizar)
const DEFAULT_HIGHLIGHT_COLORS = [
  { name: "Amarelo", color: "#FFF3A3" }, // Amarelo claro
  { name: "Verde", color: "#BBF7D0" },   // Verde claro
  { name: "Azul", color: "#BFDBFE" },    // Azul claro
  { name: "Rosa", color: "#FECDD3" },    // Rosa claro
  { name: "Laranja", color: "#FED7AA" }, // Laranja claro
];

export const HighlightButton = React.forwardRef<ComponentRef<typeof PopoverContent>, HighlightButtonProps>(({ editor, onOpenChange }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleColorSelect = (colorValue: string) => {
    editor.chain().focus().setHighlight({ color: colorValue }).run();
    setIsOpen(false);
  };

  const removeHighlight = () => {
    editor.chain().focus().unsetHighlight().run();
    setIsOpen(false);
  };

  const handleCombinedOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  if (!editor || !editor.isEditable || !editor.schema.marks.highlight) {
    return null;
  }

  const isActive = editor.isActive("highlight");

  return (
    <Popover open={isOpen} onOpenChange={handleCombinedOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"} 
          size="icon"
          className={`h-8 w-8 ${isActive ? "bg-primary/70 text-primary-foreground hover:bg-primary/70 hover:text-primary-foreground" : "hover:bg-primary/20"}`}
          aria-label="Destacar Texto"
          title="Destacar Texto"
          disabled={!editor.can().setHighlight() && !editor.can().unsetHighlight()} // Verifica se pode aplicar ou remover destaque
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={ref} className="w-auto p-2 shadow-lg" sideOffset={5}>
        <div className="grid grid-cols-5 gap-1 mb-2">
          {DEFAULT_HIGHLIGHT_COLORS.map(({ name, color }) => (
            <Button
              key={name}
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full border-2"
              style={{ backgroundColor: color, borderColor: editor.isActive('highlight', { color }) ? 'hsl(var(--primary))' : 'transparent' }}
              title={name}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </div>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start text-sm mt-1 p-1.5 h-auto"
          onClick={removeHighlight}
          title="Remover Destaque"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Remover Destaque
        </Button>
      </PopoverContent>
    </Popover>
  );
});

HighlightButton.displayName = "HighlightButton";

export default HighlightButton; 
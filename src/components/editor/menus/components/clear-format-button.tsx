"use client";

import React from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { RemoveFormatting } from "lucide-react"; // Ou qualquer outro ícone que preferir, como Eraser

interface ClearFormatButtonProps {
  editor: Editor;
}

export function ClearFormatButton({ editor }: ClearFormatButtonProps) {
  const handleClick = () => {
    editor.chain().focus().unsetAllMarks().run(); // Remove todas as marcas (bold, italic, color, etc.)
    // Opcionalmente, você também pode querer redefinir o tipo de nó para parágrafo:
    // editor.chain().focus().unsetAllMarks().setParagraph().run();
  };

  if (!editor || !editor.isEditable) {
    return null;
  }

  const canClear = editor.can().unsetAllMarks();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      disabled={!canClear}
      aria-label="Limpar Formatação"
      title="Limpar Formatação"
    >
      <RemoveFormatting className="h-4 w-4" />
    </Button>
  );
}

export default ClearFormatButton; 
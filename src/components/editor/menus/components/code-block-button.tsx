"use client";

import React from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react"; // Ícone para bloco de código

interface CodeBlockButtonProps {
  editor: Editor;
}

export function CodeBlockButton({ editor }: CodeBlockButtonProps) {
  const handleClick = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  if (!editor || !editor.isEditable) {
    return null;
  }

  // Verifica se a extensão CodeBlock está disponível
  const canToggleCodeBlock = editor.schema.nodes.codeBlock && editor.can().toggleCodeBlock();
  const isActiveCodeBlock = editor.isActive("codeBlock");

  return (
    <Button
      variant={isActiveCodeBlock ? "secondary" : "ghost"}
      size="icon"
      className={`h-8 w-8 ${isActiveCodeBlock ? "bg-primary/70 text-primary-foreground hover:bg-primary/70 hover:text-primary-foreground" : "hover:bg-primary/20"}`}
      onClick={handleClick}
      disabled={!canToggleCodeBlock}
      aria-label="Bloco de Código"
      title="Bloco de Código"
    >
      <Code2 className="h-4 w-4" />
    </Button>
  );
}

export default CodeBlockButton; 
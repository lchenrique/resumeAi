"use client";

import React from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";

interface QuoteButtonProps {
  editor: Editor;
}

export function QuoteButton({ editor }: QuoteButtonProps) {
  const handleClick = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Button
      variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      disabled={!editor.can().toggleBlockquote()}
      aria-label="Citação em Bloco"
      title="Citação em Bloco"
    >
      <Quote className="h-4 w-4" />
    </Button>
  );
} 
"use client";

import React from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Redo } from "lucide-react";

interface RedoButtonProps {
  editor: Editor;
}

export function RedoButton({ editor }: RedoButtonProps) {
  const handleClick = () => {
    editor.chain().focus().redo().run();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      disabled={!editor.can().redo()}
      aria-label="Refazer"
      title="Refazer (Ctrl+Y)"
    >
      <Redo className="h-4 w-4" />
    </Button>
  );
} 
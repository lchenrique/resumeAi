"use client";

import React from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";

interface UndoButtonProps {
  editor: Editor;
}

export function UndoButton({ editor }: UndoButtonProps) {
  const handleClick = () => {
    editor.chain().focus().undo().run();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      disabled={!editor.can().undo()}
      aria-label="Desfazer"
      title="Desfazer (Ctrl+Z)"
    >
      <Undo className="h-4 w-4" />
    </Button>
  );
} 
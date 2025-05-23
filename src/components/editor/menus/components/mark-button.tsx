"use client";

import React, { ComponentRef } from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Strikethrough, Code as CodeIcon } from "lucide-react";

export type MarkButtonType = "bold" | "italic" | "underline" | "strike" | "code";

interface MarkButtonProps {
  editor: Editor;
  type: MarkButtonType;
}

const markDetails: Record<
  MarkButtonType,
  {
    icon: React.ElementType;
    tooltip: string;
    command: (editor: Editor) => void;
    isActive: (editor: Editor) => boolean;
    canExecute: (editor: Editor) => boolean;
  }
> = {
  bold: {
    icon: Bold,
    tooltip: "Negrito (Ctrl+B)",
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
    canExecute: (editor) => editor.can().toggleBold(),
  },
  italic: {
    icon: Italic,
    tooltip: "Itálico (Ctrl+I)",
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
    canExecute: (editor) => editor.can().toggleItalic(),
  },
  underline: {
    icon: Underline,
    tooltip: "Sublinhado (Ctrl+U)",
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
    canExecute: (editor) => editor.can().toggleUnderline(),
  },
  strike: {
    icon: Strikethrough,
    tooltip: "Riscado",
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
    canExecute: (editor) => editor.can().toggleStrike(),
  },
  code: {
    icon: CodeIcon,
    tooltip: "Código (inline)",
    command: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive("code"),
    canExecute: (editor) => editor.can().toggleCode(),
  },
};

export const MarkButton = React.forwardRef<ComponentRef<typeof Button>, MarkButtonProps>(({ editor, type }, ref) => {
  const details = markDetails[type];
  if (!details) return null;

  const IconComponent = details.icon;

  const handleClick = () => {
    details.command(editor);
  };

  // Não renderiza o botão se o editor não estiver pronto ou o comando não puder ser executado.
  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Button
      ref={ref}
      variant={details.isActive(editor) ? "secondary" : "ghost"}
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      disabled={!details.canExecute(editor)}
      aria-label={details.tooltip}
      title={details.tooltip}
    >
      <IconComponent className="h-4 w-4" />
    </Button>
  );
});
MarkButton.displayName = "MarkButton";

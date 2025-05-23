"use client";

import React from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

export type TextAlignType = "left" | "center" | "right" | "justify";

interface TextAlignButtonProps {
  editor: Editor;
  align: TextAlignType;
}

const alignDetails: Record<
  TextAlignType,
  {
    icon: React.ElementType;
    tooltip: string;
    command: (editor: Editor) => void;
    isActive: (editor: Editor) => boolean;
    canExecute: (editor: Editor) => boolean;
  }
> = {
  left: {
    icon: AlignLeft,
    tooltip: "Alinhar à Esquerda",
    command: (editor) => editor.chain().focus().setTextAlign("left").run(),
    isActive: (editor) => editor.isActive({ textAlign: "left" }),
    canExecute: (editor) => editor.can().setTextAlign("left"),
  },
  center: {
    icon: AlignCenter,
    tooltip: "Centralizar",
    command: (editor) => editor.chain().focus().setTextAlign("center").run(),
    isActive: (editor) => editor.isActive({ textAlign: "center" }),
    canExecute: (editor) => editor.can().setTextAlign("center"),
  },
  right: {
    icon: AlignRight,
    tooltip: "Alinhar à Direita",
    command: (editor) => editor.chain().focus().setTextAlign("right").run(),
    isActive: (editor) => editor.isActive({ textAlign: "right" }),
    canExecute: (editor) => editor.can().setTextAlign("right"),
  },
  justify: {
    icon: AlignJustify,
    tooltip: "Justificar",
    command: (editor) => editor.chain().focus().setTextAlign("justify").run(),
    isActive: (editor) => editor.isActive({ textAlign: "justify" }),
    canExecute: (editor) => editor.can().setTextAlign("justify"),
  },
};

export function TextAlignButton({ editor, align }: TextAlignButtonProps) {
  const details = alignDetails[align];
  if (!details) return null;

  const IconComponent = details.icon;

  const handleClick = () => {
    details.command(editor);
  };

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Button
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
} 
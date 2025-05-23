"use client";

import React from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { List, ListOrdered } from "lucide-react";

export type ListButtonType = "bulletList" | "orderedList";

interface ListButtonProps {
  editor: Editor;
  type: ListButtonType;
}

const listDetails: Record<
  ListButtonType,
  {
    icon: React.ElementType;
    tooltip: string;
    command: (editor: Editor) => void;
    isActive: (editor: Editor) => boolean;
    canExecute: (editor: Editor) => boolean;
  }
> = {
  bulletList: {
    icon: List,
    tooltip: "Lista com Marcadores",
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
    canExecute: (editor) => editor.can().toggleBulletList(),
  },
  orderedList: {
    icon: ListOrdered,
    tooltip: "Lista Numerada",
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
    canExecute: (editor) => editor.can().toggleOrderedList(),
  },
};

export function ListButton({ editor, type }: ListButtonProps) {
  const details = listDetails[type];
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
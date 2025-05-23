"use client";

import React, { ComponentRef } from "react";
import { Editor } from "@tiptap/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeadingSelectProps {
  editor: Editor;
  onOpenChange?: (open: boolean) => void;
}

interface HeadingLevel {
  value: string; // e.g., 'h1', 'h2', 'p'
  label: string; // e.g., 'Heading 1', 'Paragraph'
  level?: number; // e.g., 1, 2 for headings
}

const headingLevels: HeadingLevel[] = [
  { value: "p", label: "Parágrafo" },
  { value: "h1", label: "Título 1", level: 1 },
  { value: "h2", label: "Título 2", level: 2 },
  { value: "h3", label: "Título 3", level: 3 },
  { value: "h4", label: "Título 4", level: 4 },
  { value: "h5", label: "Título 5", level: 5 },
  { value: "h6", label: "Título 6", level: 6 },
];

export const HeadingSelect = React.forwardRef<ComponentRef<typeof SelectContent>, HeadingSelectProps>(({ editor, onOpenChange }, ref) => {
  const handleValueChange = (value: string) => {
    const selectedLevel = headingLevels.find((h) => h.value === value);
    if (!selectedLevel) return;

    const chain = editor.chain().focus();

    if (selectedLevel.value === "p") {
      chain.setParagraph().run();
    } else if (selectedLevel.level) {
      chain.toggleHeading({ level: selectedLevel.level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  };

  const getCurrentHeadingValue = () => {
    for (const heading of headingLevels) {
      if (heading.value === "p" && editor.isActive("paragraph")) {
        return "p";
      }
      if (heading.level && editor.isActive("heading", { level: heading.level })) {
        return heading.value;
      }
    }
    return "p"; // Default to paragraph if nothing is active or matched
  };

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Select
      value={getCurrentHeadingValue()}
      onValueChange={handleValueChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue placeholder="Estilo do Texto" />
      </SelectTrigger>
      <SelectContent ref={ref}>
        {headingLevels.map((heading) => (
          <SelectItem key={heading.value} value={heading.value} className="text-xs">
            {heading.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
HeadingSelect.displayName = "HeadingSelect";

export default HeadingSelect;
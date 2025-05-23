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
import { TextStyle } from "@tiptap/extension-text-style"; // Necessário para fontSize

interface FontSizeSelectProps {
  editor: Editor;
  onOpenChange?: (open: boolean) => void;
}

// Lista de tamanhos de fonte predefinidos. Você pode ajustar conforme necessário.
const fontSizes = [
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px (Padrão)" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
  { value: "20px", label: "20px" },
  { value: "24px", label: "24px" },
  { value: "30px", label: "30px" },
  { value: "36px", label: "36px" },
  { value: "48px", label: "48px" },
];

const DEFAULT_FONT_SIZE = "14px"; // Defina seu tamanho de fonte padrão

export const FontSizeSelect = React.forwardRef<ComponentRef<typeof SelectContent>, FontSizeSelectProps>(({ editor, onOpenChange }, ref) => {
  const handleValueChange = (fontSize: string) => {
    if (fontSize === DEFAULT_FONT_SIZE) { // Ou uma lógica para "remover" o estilo se você tiver um item "Padrão"
      // Para remover o estilo de tamanho da fonte, precisamos aplicar undefined ou null
      // Contudo, a API setTextStyle não suporta diretamente a remoção de um único atributo dessa forma.
      // A melhor abordagem é aplicar o tamanho padrão ou redefinir o textStyle se necessário.
      // Por simplicidade, vamos apenas aplicar o tamanho.
      // Se você quiser "remover" para herdar, seria preciso limpar todos os atributos de textStyle ou o específico.
      editor.chain().focus().setMark("textStyle", { fontSize }).run();
    } else {
      editor.chain().focus().setMark("textStyle", { fontSize }).run();
    }
  };

  const getCurrentFontSize = () => {
    const activeSize = editor.getAttributes("textStyle").fontSize;
    if (activeSize && fontSizes.some(fs => fs.value === activeSize)) {
      return activeSize;
    }
    return DEFAULT_FONT_SIZE; // Retorna o tamanho padrão
  };

  if (!editor || !editor.isEditable || !editor.schema.marks.textStyle) {
    return null;
  }

  return (
    <Select
      value={getCurrentFontSize()}
      onValueChange={handleValueChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger className="w-[90px] h-8 text-xs">
        <SelectValue placeholder="Tamanho" />
      </SelectTrigger>
      <SelectContent ref={ref}>
        {fontSizes.map((size) => (
          <SelectItem
            key={size.value}
            value={size.value}
            className="text-xs"
            // style={{ fontSize: size.value }} // Aplicar o estilo aqui pode ser um pouco demais visualmente
          >
            {size.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

FontSizeSelect.displayName = "FontSizeSelect";

export default FontSizeSelect; 
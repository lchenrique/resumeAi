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
import { FontFamily } from "@tiptap/extension-font-family"; // Necessário para editor.isActive("fontFamily")
import { TextStyle } from "@tiptap/extension-text-style"; // Necessário para setFontFamily

interface FontFamilySelectProps {
  editor: Editor;
  onOpenChange?: (open: boolean) => void;
}

const fontFamilies = [
  { value: "Arial", label: "Arial" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Inter", label: "Inter (Padrão)" }, // Exemplo de fonte padrão
  // Adicione outras fontes conforme necessário
];

export const FontFamilySelect = React.forwardRef<ComponentRef<typeof SelectContent>, FontFamilySelectProps>(({ editor, onOpenChange }, ref) => {
  const handleValueChange = (fontFamily: string) => {
    if (fontFamily === "Inter") { // Supondo que 'Inter' seja o padrão e signifique remover a família de fontes
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
  };

  const getCurrentFontFamily = () => {
    for (const family of fontFamilies) {
      if (editor.isActive("textStyle", { fontFamily: family.value })) {
        return family.value;
      }
    }
    // Tenta obter a família de fontes diretamente se nenhuma das predefinidas estiver ativa
    // Pode ser útil se uma fonte for definida externamente ou por uma configuração padrão não listada
    const activeFont = editor.getAttributes("textStyle").fontFamily;
    if (activeFont && fontFamilies.some(f => f.value === activeFont)) {
        return activeFont;
    }
    return "Inter"; // Retorna o valor da fonte padrão
  };

  if (!editor || !editor.isEditable || !editor.schema.marks.textStyle) {
    // Verifica se a extensão TextStyle (que gerencia fontFamily) está ativa
    return null;
  }

  return (
    <Select
      value={getCurrentFontFamily()}
      onValueChange={handleValueChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger className="w-[150px] h-8 text-xs">
        <SelectValue placeholder="Fonte" />
      </SelectTrigger>
      <SelectContent>
        {fontFamilies.map((font) => (
          <SelectItem
            key={font.value}
            value={font.value}
            className="text-xs"
            style={{ fontFamily: font.value }} // Aplica a fonte ao item para visualização
          >
            {font.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

FontFamilySelect.displayName = "FontFamilySelect";

export default FontFamilySelect; 
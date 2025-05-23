"use client";

import React, { useState, useCallback, useEffect, ComponentRef } from "react";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link as LinkIconLucide, ExternalLink, Trash2, CornerDownLeft } from "lucide-react";

interface LinkButtonProps {
  editor: Editor;
  onOpenChange?: (open: boolean) => void;
}

export const LinkButton = React.forwardRef<ComponentRef<typeof PopoverContent>, LinkButtonProps>(({ editor, onOpenChange }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (isOpen && editor && editor.isActive("link")) {
      setUrl(editor.getAttributes("link").href || "");
    } else if (isOpen && editor && !editor.isActive("link")) {
      // Se abrindo e não há link ativo, limpa a URL
      setUrl(""); 
    }
  }, [isOpen, editor]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const saveLink = useCallback(() => {
    if (!editor) return;
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      // Se a URL for explicitamente limpa e salva, remove o link
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    handleOpenChange(false);
  }, [editor, url]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setUrl(""); // Limpa a URL no estado também
    handleOpenChange(false);
  }, [editor]);

  const openLinkInNewTab = useCallback(() => {
    if (url) {
      window.open(url, "_blank", "noopener noreferrer");
    }
  }, [url]);

  if (!editor || !editor.isEditable) {
    return null;
  }

  const canSetLink = editor.schema.marks.link && editor.can().toggleMark("link");
  const isActiveLink = editor.isActive("link");

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={ "ghost" }
          size="icon"
          className={`h-8 w-8 ${isActiveLink ? "bg-primary/70 text-primary-foreground hover:bg-primary/70 hover:text-primary-foreground" : "hover:bg-primary/20"}`}
          disabled={!canSetLink && !isActiveLink}
          aria-label={isActiveLink ? "Editar Link" : "Adicionar Link"}
          title={isActiveLink ? "Editar Link" : "Adicionar Link"}
        >
          <LinkIconLucide className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={ref} className="w-auto p-1.5 shadow-lg bg-background" sideOffset={5}>
        <div className="flex items-center space-x-1.5">
          <Input
            type="url"
            placeholder={isActiveLink && url ? url : "Cole um link..."}
            value={url} // O valor do input é sempre o estado 'url'
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveLink();
              }
            }}
            className="h-8 text-sm flex-grow bg-transparent focus:ring-0 border-0 focus:border-0 focus:outline-none px-2"
          />
          <Button variant="ghost" size="icon" onClick={saveLink} title="Aplicar" className="h-7 w-7 flex-shrink-0" disabled={!url && !isActiveLink}>
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        
            <Button disabled={!isActiveLink} variant="ghost" size="icon" onClick={openLinkInNewTab} title="Abrir link" className="h-7 w-7 flex-shrink-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button disabled={!isActiveLink} variant="ghost" size="icon" onClick={removeLink} title="Remover link" className="h-7 w-7 flex-shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

LinkButton.displayName = "LinkButton";

export default LinkButton;
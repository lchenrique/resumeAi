import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css"
import { 
  CreateLinkButton, 
  UnnestBlockButton, 
  FileCaptionButton, 
  BlockTypeSelect, 
  FormattingToolbar, 
  BlockNoteContext,
  FormattingToolbarController, 
  useCreateBlockNote, 
  FileReplaceButton, 
  NestBlockButton, 
  TextAlignButton, 
  BasicTextStyleButton,
  blockTypeSelectItems,
  BlockTypeSelectItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Color as ColorStyleSpec, TextColorButton } from "./menus/text-color";
import { pt } from "@blocknote/core/locales";
import { useTheme } from "next-themes";
import { BlockNoteDocument } from "./type";
import { defaultBlockSpecs, defaultStyleSpecs, filterSuggestionItems, insertOrUpdateBlock, BlockNoteSchema } from "@blocknote/core";
import { Alert } from "./blocks/bullet-list";
import { Info, List } from "lucide-react";
import { CustomBulletListItem } from "./blocks/list-bullet-item";
import { SwapyNestedLayout } from "../resume/renderer/layouts/SwapyNestedLayout";
import { LayoutContainer } from "../resume/renderer/layouts/SwapyNestedLayout";
import "@blocknote/mantine/style.css";
import { useEffect, useRef, useState } from "react";

export const masterSchema = BlockNoteSchema.create({
  styleSpecs: {
    ...defaultStyleSpecs,
    color: ColorStyleSpec,
  },
  
  blockSpecs: {
    ...defaultBlockSpecs,
    alert: Alert,
    bulletListItem: CustomBulletListItem,
  }
});

const insertAlert = (editor: typeof masterSchema.BlockNoteEditor) => ({
  title: "Alert",
  subtext: "Alert for emphasizing text",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "alert",
    }),
  aliases: [
    "alert",
    "notification",
    "emphasize",
    "warning",
    "error",
    "info",
    "success",
  ],
  group: "Blocos básicos",
  icon: <Info size={18} />,
});
const insertListBulletItem = (editor: typeof masterSchema.BlockNoteEditor) => ({
  title: "Item da lista",
  subtext: "Item da lista para enfatizar texto",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "bulletListItem",
    }),
  aliases: [
    "bulletListItem",
  ],
  group:"Blocos básicos",
  icon: <List size={18} />,
});

const locale = pt;
export const Editor = ({ initialContent }: { initialContent?: BlockNoteDocument | null }) => {
  const {theme} = useTheme();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  const editor = useCreateBlockNote({ 
    sideMenuDetection: "editor",
    
    // Desabilita a criação automática de blocos vazios quando não necessário
    trailingBlock: false,
    
    // dictionary:{
    //   ...locale,
    // },
    // initialContent: initialContent as any
  });

  editor.onChange(() => {
    const blocks = editor.document;
    
    // Filtra blocos que têm conteúdo válido (children ou content)
    const filteredBlocks = blocks.filter(block => {
      const hasChildren = block.children && block.children.length > 0;
      const hasContent = block.content && block.content.length > 0;
      return hasChildren || hasContent;
    });

    // Se houver blocos vazios, remove-os
    if (filteredBlocks.length !== blocks.length) {
      setTimeout(() => {
        editor.replaceBlocks([], filteredBlocks);
      }, 1000);
    }
  });

  // Adiciona um evento para corrigir problemas de drag and drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      // Obtém a posição Y do cursor
      const y = e.clientY;
      
      // Obtém todos os elementos .bn-block dentro do editor
      const editorElem = editorContainerRef.current;
      if (!editorElem) return;
      
      // Adiciona uma propriedade de dados para impedir indentação automática
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };
    
    const handleDrop = () => {
      // Depois que o drop acontecer, verifica se há blocos indentados incorretamente
      setTimeout(() => {
        // Na versão atual do BlockNote, não temos uma maneira simples de identificar 
        // blocos indentados incorretamente, mas você pode adicionar um botão na UI 
        // para remover indentações manualmente, se necessário
      }, 50);
    };
    
    const editorElem = editorContainerRef.current;
    if (editorElem) {
      editorElem.addEventListener('dragover', handleDragOver as EventListener);
      editorElem.addEventListener('drop', handleDrop);
      
      return () => {
        editorElem.removeEventListener('dragover', handleDragOver as EventListener);
        editorElem.removeEventListener('drop', handleDrop);
      };
    }
  }, [editor]);
  
  // Adiciona CSS personalizado para ajudar a prevenir indentação durante drag and drop
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .bn-container .ProseMirror-selectednode {
        outline: 2px solid #3742FA !important;
      }
      
      /* Ajusta o comportamento do cursor durante drag and drop */
      .bn-container [draggable=true] {
        cursor: move !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div ref={editorContainerRef} className="bn-editor-container">
      <BlockNoteView editor={editor} />
    </div>
  );
}


import { BlockCommand } from "@/contexts/editor-context";
import { faker } from "@faker-js/faker";
import { Editor } from "@tiptap/react";
import { FileCode, ImageIcon, Heading2, List, ListOrdered, Quote, Badge } from "lucide-react";
import { Heading1 } from "lucide-react";
import { Type } from "lucide-react";

export const BLOCK_COMMANDS: BlockCommand[] = [
    {
      title: 'Texto',
      description: 'Bloco de texto simples',
      icon: <Type size={20} />,
      command: (editor: Editor) => editor.chain().focus().setNode('paragraph').run(),
    },
    {
      title: 'Título 1',
      description: 'Título grande',
      icon: <Heading1 size={20} />,
      command: (editor: Editor) => editor.chain().focus().setNode('heading', { level: 1 }).run(),
    },
    {
      title: 'Título 2',
      description: 'Título médio',
      icon: <Heading2 size={20} />,
      command: (editor: Editor) => editor.chain().focus().setNode('heading', { level: 2 }).run(),
    },
    {
      title: 'Lista com marcadores',
      description: 'Lista de itens com marcadores',
      icon: <List size={20} />,
      command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Lista numerada',
      description: 'Lista de itens numerados',
      icon: <ListOrdered size={20} />,
      command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'Bloco de badges',
      description: 'Bloco de badges',
      icon: <Badge size={20} />,
      command: (editor: Editor) => editor.chain().focus().setBadge('badge', faker.color.rgb()).run(),
    },
    {
      title: 'Bloco de código',
      description: 'Bloco para código formatado',
      icon: <FileCode size={20} />,
      command: (editor: Editor) => editor.chain().focus().setNode('codeBlock').run(),
    },
    {
      title: 'Citação',
      description: 'Bloco de citação',
      icon: <Quote size={20} />,
      command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: 'Imagem',
      description: 'Inserir uma imagem',
      icon: <ImageIcon size={20} />,
      command: (editor: Editor) => {
        const url = window.prompt('URL da imagem:');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
  ];
  
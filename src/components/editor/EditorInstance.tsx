"use client";

import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEditorContext } from '@/contexts/editor-context';
import { createPortal } from 'react-dom';
import { slashNavigation } from './events/slash-navigation';
import { getExtensions } from './extensions/get-extensions';
import { BLOCK_COMMANDS } from './menus/commands';
import { SlashMenu } from './menus/slash-menu';
import { TextEditor } from './menus/toolbar';

interface TiptapEditorProps {
  id: string;
  content: JSONContent;
  onUpdate: (id: string, content: any) => void;
}


export const EditorInstance = ({ id, content, onUpdate }: TiptapEditorProps) => {
  const { draggedBlock, setDraggedBlock } = useEditorContext();

  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Estado para o slash menu
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estado para o menu de adição de blocos
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [currentNodePos, setCurrentNodePos] = useState<number | null>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  const [showBlockMenuState, setShowBlockMenuState] = useState(false);

  // Função específica desta instância para mostrar o menu de adição
  const instanceShowAddBlockMenu = useCallback((event: MouseEvent, pos: number) => {
    const editorContainer = editorContainerRef.current;
    if (!editorContainer) return;
    const rect = editorContainer.getBoundingClientRect();
    setBlockMenuPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setCurrentNodePos(pos);
    setShowBlockMenuState(true);
  }, [id, editorContainerRef, setBlockMenuPosition, setCurrentNodePos, setShowBlockMenuState]);

  // Filtrar comandos com base no termo de pesquisa
  const filteredCommands = searchTerm
    ? BLOCK_COMMANDS.filter(cmd =>
      cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : BLOCK_COMMANDS;


  // Criar instância do editor Tiptap
  const editor = useEditor({
    extensions: getExtensions({ instanceId: id, showAddBlockMenu: instanceShowAddBlockMenu }),
    content: content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none',
        spellcheck: 'false',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          if (editor) {
            // Verificar se estamos lidando com o slash menu
            if (slashMenuOpen || event.key === '/') {
              const handled = slashNavigation({
                event,
                editor,
                editorContainerRef,
                slashMenuOpen,
                callback: (commandIndex, isSlashOpen) => {
                  setSelectedCommandIndex(commandIndex);
                  setSlashMenuOpen(isSlashOpen || false);
                },
                setSlashMenuPosition: (position) => {
                  setSlashMenuPosition(position);
                }
              });
              
              // Retornar true apenas se o evento foi tratado pelo slashNavigation
              if (handled) return true;
            }
          }
          return false; // Permitir que o Tiptap processe o evento normalmente
        },
        click: () => {
          // Fechar o slash menu ao clicar
          if (slashMenuOpen) {
            setSlashMenuOpen(false);
          }
          return false;
        },
        drop: (view, event) => {
          event.preventDefault();

          if (draggedBlock && draggedBlock.sourceId !== id) {
            const { content: draggedContentFromAnotherInstance, sourceId: anoterSourceId, sourcePos: anotherSourcePos, nodeSize: anotherNodeSize } = draggedBlock;
            // NÃO limpar o bloco do contexto aqui. Marcar como solto.
            setDraggedBlock({
              sourceId: anoterSourceId, // Manter sourceId original
              content: draggedContentFromAnotherInstance, // Manter content original
              sourcePos: anotherSourcePos, // Manter sourcePos original
              nodeSize: anotherNodeSize, // Manter nodeSize original
              dropped: true // Indicar que o drop foi bem-sucedido
            });

            const dropCoords = { left: event.clientX, top: event.clientY };
            const dropPosData = view.posAtCoords(dropCoords);

            if (!dropPosData) {
              return false;
            }
            let targetDropPos = dropPosData.pos;

            // Inserir o conteúdo da outra instância
            const { tr } = view.state;
            tr.insert(targetDropPos, view.state.schema.nodeFromJSON(draggedContentFromAnotherInstance));
            view.dispatch(tr);
            return true; // Manipulado com sucesso
          }

          // Se não for D&D entre instâncias, tentar D&D INTERNO (lógica existente)
          const draggedPosString = event.dataTransfer?.getData('application/tiptap-block-pos');
          const draggedBlockId = event.dataTransfer?.getData('application/tiptap-block-id');

          if (!draggedPosString || !draggedBlockId?.startsWith(id + '-')) {
            return false;
          }

          const draggedNodeOriginalPos = parseInt(draggedPosString, 10);

          if (isNaN(draggedNodeOriginalPos)) {
            return false;
          }

          const dropCoords = { left: event.clientX, top: event.clientY };
          const dropPosData = view.posAtCoords(dropCoords);

          if (!dropPosData) {
            return false;
          }
          let targetDropPos = dropPosData.pos;

          const { state } = view;
          const { tr } = state;

          // Tentar encontrar o nó na posição original
          // É mais seguro usar a posição original guardada, assumindo que o estado não mudou drasticamente
          const draggedNode = state.doc.nodeAt(draggedNodeOriginalPos);

          if (!draggedNode) {
            console.error('handleDrop: Nó arrastado não encontrado na posição original:', draggedNodeOriginalPos);
            // Pode ser que o estado tenha mudado. Poderíamos tentar analisar a transação ou recriar o nó, mas é complexo.
            return false;
          }

          // Remover o nó da posição antiga
          tr.delete(draggedNodeOriginalPos, draggedNodeOriginalPos + draggedNode.nodeSize);

          // Ajustar a posição de destino (targetDropPos) por causa da remoção
          // Se removemos um nó que estava antes de onde queremos soltar, a posição de soltar precisa ser deslocada para trás
          let adjustedTargetDropPos = tr.mapping.map(targetDropPos); // Mapeia a posição de soltura para o novo estado do documento após a deleção

          // Garantir que a posição de inserção seja válida
          adjustedTargetDropPos = Math.max(0, Math.min(adjustedTargetDropPos, tr.doc.content.size));

          // Inserir o nó na nova posição ajustada
          tr.insert(adjustedTargetDropPos, draggedNode);

          view.dispatch(tr);

          return true; // Sinaliza que o evento drop foi manipulado com sucesso
        },
      }
    },
    
    onUpdate: ({ editor }) => {
      // Atualizar o contexto quando o conteúdo do editor mudar
      onUpdate(id, editor.getJSON());

      if (slashMenuOpen && editor) {
        try {
          const { state } = editor.view;
          const { selection } = state;
          const { $from, $to } = selection;

          if ($from.pos !== $to.pos) {
            // Com seleção, não é um slash command
            setSlashMenuOpen(false);
            return;
          }

          // Obter o texto até o cursor
          const textBeforeCursor = $from.doc.textBetween(
            $from.start(),
            $from.pos,
            '\n'
          );

          // Verificar se ainda estamos em um slash command
          const lastSlashPos = textBeforeCursor.lastIndexOf('/');

          if (lastSlashPos === -1) {
            // Não há / antes do cursor, fechar o menu
            setSlashMenuOpen(false);
          } else {
            // Extrair o texto após o último /
            const searchText = textBeforeCursor.substring(lastSlashPos + 1);
            setSearchTerm(searchText);
          }
        } catch (err) {
          console.error("Erro ao atualizar slash menu:", err);
        }
      }
    },
    onBlur: () => {
      // Fechar o slash menu quando o editor perder o foco
      setTimeout(() => {
        // Pequeno delay para verificar se o clique foi no próprio menu
        if (slashMenuOpen && !menuRef.current?.contains(document.activeElement)) {
          setSlashMenuOpen(false);
        }
      }, 100);
    },
  });

  

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
        setShowBlockMenuState(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  

  return (
    <div
      ref={editorContainerRef}
      className="editor-container group relative rounded-md"
    >
      {editor && (
        createPortal(
          <div className="fixed flex items-center justify-center top-28 right-0    w-[calc(100%-287px)] z-50">
            <TextEditor editor={editor} />
          </div>,
          document.body
        )
      )}

      <div ref={editorRef} className="">
        <EditorContent editor={editor} className=" min-h-[20px]" />
      </div>

    
      {editor && slashMenuOpen && (
        <SlashMenu
          menuRef={menuRef}
          slashMenuPosition={slashMenuPosition}
          editor={editor}
          commands={BLOCK_COMMANDS}
          searchTerm={searchTerm}
          onOpenChange={setSlashMenuOpen}
        />
      )}

    </div>
  );
};

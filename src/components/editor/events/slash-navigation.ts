import { BlockCommand } from "@/contexts/editor-context";
import { Editor } from "@tiptap/react";

type SlashNavigationProps = {
    event: KeyboardEvent;
    editor: Editor;
    editorContainerRef: React.RefObject<HTMLDivElement>;
    slashMenuOpen: boolean;
    callback: (commandIndex: number, isSlashOpen?: boolean, ) => void;
    setSlashMenuPosition: (position: { x: number, y: number }) => void;
}

export const slashNavigation = ({
    event,
    editor,
    editorContainerRef,
    slashMenuOpen,
    callback,
    setSlashMenuPosition,
}: SlashNavigationProps) => {

    
    if (event.key === '/' && !slashMenuOpen) {
        setTimeout(() => {
          try {
            if (editor && editor.view) {
              const { state, view } = editor;
              const { selection } = state;
      
              const editorContainer = editorContainerRef.current;
              if (!editorContainer) return;
      
              const pos = selection.from;
              const $pos = state.doc.resolve(pos);
              const startOfLine = $pos.start();
      
              const textBefore = state.doc.textBetween(startOfLine, pos, '\n', '\0');
      
              // Verifica se o '/' foi o primeiro caractere da linha
              if (textBefore === '/') {
                // Remove o '/'
                editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).run();
      
                // Obter coordenadas do cursor para posicionar o menu
                const coords = view.coordsAtPos(pos);
      
                const rect = editorContainer.getBoundingClientRect();
      
                setSlashMenuPosition({
                  x: coords.left - rect.left,
                  y: coords.bottom - rect.top + 5,
                });
      
                callback(0, true);
              }
            }
          } catch (error) {
            console.error("Erro ao mostrar slash menu:", error);
          }
        }, 0);
      }

    return false;
}

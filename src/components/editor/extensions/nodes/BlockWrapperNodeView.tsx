import React, { useState, useContext } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { GripVertical, Plus } from 'lucide-react'; // Importar ícones
import { useEditorContext } from '@/contexts/editor-context';

// Definir as props adicionais que nosso NodeView precisará
interface BlockWrapperNodeViewProps extends NodeViewProps {
  instanceId: string;
  showAddBlockMenu: (event: MouseEvent, pos: number) => void;
}

export const BlockWrapperNodeView: React.FC<BlockWrapperNodeViewProps> = ({ 
  node, 
  editor, 
  getPos, 
  instanceId,         // Prop recebida
  showAddBlockMenu    // Prop recebida
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { draggedBlock, setDraggedBlock } = useEditorContext(); // Obter apenas o necessário do contexto

  let tagName: keyof JSX.IntrinsicElements = 'div'; 
  if (node.type.name === 'paragraph') {
    tagName = 'p';
  } else if (node.type.name === 'heading') {
    tagName = `h${node.attrs.level || 1}` as keyof JSX.IntrinsicElements;
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (editor) {
      const currentPos = getPos();
      event.dataTransfer.setData('application/tiptap-block-pos', String(currentPos));
      event.dataTransfer.setData('application/tiptap-block-id', instanceId + '-' + currentPos);
      event.dataTransfer.effectAllowed = "move";

      const nodeJson = node?.toJSON();
      if (nodeJson && node) {
        setDraggedBlock({
          sourceId: instanceId,
          content: nodeJson,
          sourcePos: currentPos,
          nodeSize: node.nodeSize,
          dropped: false
        });
      }
      
      const ghostElement = document.createElement('div');
      ghostElement.innerHTML = `<div style="padding: 8px; background: #f3f4f6; border-radius: 4px; opacity: 0.7;">⠿</div>`;
      ghostElement.style.position = 'absolute';
      ghostElement.style.left = '-9999px';
      document.body.appendChild(ghostElement);
      event.dataTransfer.setDragImage(ghostElement, 10, 10);
      setTimeout(() => {
        if (document.body.contains(ghostElement)) {
          document.body.removeChild(ghostElement);
        }
      }, 0);
    }
  };

  const handleDragEnd = () => {
    if (editor && draggedBlock && draggedBlock.sourceId === instanceId && draggedBlock.dropped) {
      const { sourcePos, nodeSize } = draggedBlock;
      editor.chain().focus().deleteRange({ from: sourcePos, to: sourcePos + nodeSize }).run();
    }
    setDraggedBlock(null);
  };

  const handleAddClick = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log('handleAddClick');
    const currentPos = getPos();
    // Chamar a função da prop
    showAddBlockMenu(event.nativeEvent, currentPos);
  };

  const createBadge = (event: React.MouseEvent<HTMLDivElement>) => {
    const currentPos = getPos();
    // Chamar a função da prop
  };

  return (
    <NodeViewWrapper 
      as={tagName} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      { isHovered && (
        <div 
          className="handle-overlay  absolute flex  pr-6 items-center gap-0.5 rounded-md"
          style={{ left: '-3rem', top: `0.25rem`, zIndex: 9999999 }}
          contentEditable={false}
        >
          
          <div 
            className="cursor-pointer  text-gray-400 hover:text-gray-600 rounded transition-colors"
            onClick={handleAddClick} // Conectado à prop
          >
            <Plus size={16} />
          </div>
          <div 
            className=" cursor-grab  text-gray-400 hover:text-gray-600 rounded transition-colors"
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <GripVertical size={16} />
          </div>
        </div>
      )}
      <div className="block-content">
        <NodeViewContent  onChange={handleAddClick}/>
      </div>
    </NodeViewWrapper>
  );
};

export default BlockWrapperNodeView; 
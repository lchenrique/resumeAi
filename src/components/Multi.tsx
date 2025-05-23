import React, { useRef } from 'react';
import YooptaEditor from '@yoopta/editor';

function MultiEditor() {
  const editorRef1 = useRef(null);
  const editorRef2 = useRef(null);

  const handleDrop = (event, targetEditorRef) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    if (data) {
      const block = JSON.parse(data);
      // Adicione o bloco ao editor de destino
      targetEditorRef.current?.addBlock(block);
    }
  };

  const handleDragStart = (event, block) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(block));
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div
        onDrop={(e) => handleDrop(e, editorRef1)}
        onDragOver={(e) => e.preventDefault()}
        style={{ border: '1px solid #ccc', padding: '10px', width: '45%' }}
      >
        <YooptaEditor
          ref={editorRef1}
          onBlockRender={(block) => (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
            >
              {block.content}
            </div>
          )}
        />
      </div>
      <div
        onDrop={(e) => handleDrop(e, editorRef2)}
        onDragOver={(e) => e.preventDefault()}
        style={{ border: '1px solid #ccc', padding: '10px', width: '45%' }}
      >
        <YooptaEditor
          ref={editorRef2}
          onBlockRender={(block) => (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
            >
              {block.content}
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default MultiEditor;

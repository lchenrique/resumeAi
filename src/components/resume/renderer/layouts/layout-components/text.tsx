// ResizablePanel.tsx
import React, { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { createSwapy, @ } from 'swapy';

// Tipos para as props dos componentes
interface ResizablePanelProps {
  children: ReactNode | ReactNode[];
  direction?: 'horizontal' | 'vertical';
  defaultSizes?: number[];
  minSizes?: number[];
  className?: string;
}

interface NestedPanelProps {
  children: ReactNode | ReactNode[];
  layout?: 'horizontal' | 'vertical';
  defaultSizes?: number[];
  minSizes?: number[];
  className?: string;
}

// Handle para gaps arrastáveis
export const DragHandle: React.FC<{
  direction?: 'horizontal' | 'vertical';
  onDrag?: (delta: number) => void;
}> = ({ direction = 'vertical', onDrag }) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = direction === 'vertical' ? e.clientY : e.clientX;
    document.body.style.cursor = direction === 'vertical' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentPos = direction === 'vertical' ? e.clientY : e.clientX;
    const delta = currentPos - startPosRef.current;
    
    if (onDrag) {
      onDrag(delta);
    }
    
    startPosRef.current = currentPos;
  }, [isDragging, direction, onDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={handleRef}
      className={`drag-handle ${direction === 'vertical' ? 'vertical' : 'horizontal'}`}
      onMouseDown={handleMouseDown}
      style={{
        background: '#ddd',
        cursor: direction === 'vertical' ? 'row-resize' : 'col-resize',
        ...(direction === 'vertical' 
          ? { height: '10px', margin: '10px 0', borderRadius: '4px' }
          : { width: '10px', margin: '0 10px', borderRadius: '4px' }),
        transition: 'background 0.2s',
        zIndex: 10
      }}
    />
  );
};

// Componente principal para painéis redimensionáveis
export const ResizablePanel: React.FC<ResizablePanelProps> = ({ 
  children, 
  direction = 'horizontal', 
  defaultSizes = [],
  minSizes = [], 
  className = ''
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeSeparator, setActiveSeparator] = useState<number | null>(null);
  const separatorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const childCount = React.Children.count(children);

  // Ajusta os tamanhos iniciais se não forem fornecidos
  useEffect(() => {
    if (sizes.length === 0 && childCount > 0) {
      const equalSize = 100 / childCount;
      setSizes(Array(childCount).fill(equalSize));
    }
  }, [children, sizes, childCount]);

  // Manipula o início do arrasto
  const handleDragStart = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveSeparator(index);
    
    // Adiciona classes e estilos para melhorar a experiência de arrasto
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction]);

  // Manipula o movimento do arrasto
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || activeSeparator === null || !panelRef.current) return;
    
    const containerRect = panelRef.current.getBoundingClientRect();
    const newSizes = [...sizes];
    
    // Cálculo da posição e tamanho
    if (direction === 'horizontal') {
      const containerWidth = containerRect.width;
      const offsetX = e.clientX - containerRect.left;
      const positionPercent = (offsetX / containerWidth) * 100;
      
      // Limitando o tamanho mínimo
      const minSizeLeft = minSizes[activeSeparator] || 10;
      const minSizeRight = minSizes[activeSeparator + 1] || 10;
      
      // Calculando os limites para assegurar tamanhos mínimos
      const sumPrevious = newSizes.slice(0, activeSeparator).reduce((acc, size) => acc + size, 0);
      const maxPercent = 100 - minSizeRight - sumPrevious;
      
      // Tamanho ajustado pelo movimento
      let delta = positionPercent - (sumPrevious + newSizes[activeSeparator]);
      
      // Ajustando os tamanhos conforme o movimento
      newSizes[activeSeparator] = Math.min(Math.max(newSizes[activeSeparator] + delta, minSizeLeft), maxPercent);
      newSizes[activeSeparator + 1] -= delta;
    } else {
      const containerHeight = containerRect.height;
      const offsetY = e.clientY - containerRect.top;
      const positionPercent = (offsetY / containerHeight) * 100;
      
      // Mesma lógica para vertical
      const minSizeTop = minSizes[activeSeparator] || 10;
      const minSizeBottom = minSizes[activeSeparator + 1] || 10;
      
      const sumPrevious = newSizes.slice(0, activeSeparator).reduce((acc, size) => acc + size, 0);
      const maxPercent = 100 - minSizeBottom - sumPrevious;
      
      let delta = positionPercent - (sumPrevious + newSizes[activeSeparator]);
      
      newSizes[activeSeparator] = Math.min(Math.max(newSizes[activeSeparator] + delta, minSizeTop), maxPercent);
      newSizes[activeSeparator + 1] -= delta;
    }
    
    // Atualizando os tamanhos
    setSizes(newSizes);
  }, [isDragging, activeSeparator, sizes, direction, minSizes]);

  // Manipula o fim do arrasto
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setActiveSeparator(null);
    
    // Restaura o cursor e os estilos
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Define os eventos para o arrasto
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  // Estilo para o container principal
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    width: '21cm',
    height: '29.7cm',
    overflow: 'auto'
  };

  // Renderiza os painéis e separadores
  const renderPanels = () => {
    return React.Children.map(children, (child, index) => {
      if (!child) return null;
      
      const size = sizes[index] || 0;
      const panelStyle: React.CSSProperties = {
        flex: `${size} 0 0`,
        padding: '8px',
        overflow: 'auto'
      };
      
      const output: React.ReactNode[] = [
        <div key={`panel-${index}`} style={panelStyle} className="resizable-panel">
          {child}
        </div>
      ];
      
      // Adiciona separadores entre os painéis
      if (index < childCount - 1) {
        const separatorStyle: React.CSSProperties = {
          background: '#ddd',
          cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
          ...(direction === 'horizontal' 
            ? { width: '6px', margin: '0 -3px', zIndex: 1, position: 'relative' }
            : { height: '6px', margin: '-3px 0', zIndex: 1, position: 'relative' })
        };
        
        output.push(
          <div
            key={`separator-${index}`}
            ref={el => {
              if (separatorRefs.current) {
                separatorRefs.current[index] = el;
              }
            }}
            style={separatorStyle}
            className="resizable-separator"
            onMouseDown={(e) => handleDragStart(index, e)}
          />
        );
      }
      
      return output;
    });
  };

  return (
    <div 
      ref={panelRef} 
      style={containerStyle} 
      className={`resizable-container ${className}`}
    >
      {renderPanels()}
    </div>
  );
};

// Componente para painéis aninhados
export const NestedPanel: React.FC<NestedPanelProps> = ({ 
  children, 
  layout = 'horizontal', 
  defaultSizes = [], 
  minSizes = [], 
  className = '' 
}) => {
  return (
    <ResizablePanel
      direction={layout}
      defaultSizes={defaultSizes}
      minSizes={minSizes}
      className={className}
    >
      {children}
    </ResizablePanel>
  );
};

// Componente Swapy simples
export const SwapyContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        if (swapyRef.current) {
          swapyRef.current.destroy();
        }
        
        swapyRef.current = createSwapy(containerRef.current, {
          animation: 'dynamic',
          swapMode: 'drop',
          autoScrollOnDrag: true,
          enabled: true
        });
        
        console.log('Swapy inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar Swapy:', error);
      }
    }
    
    return () => {
      try {
        if (swapyRef.current) {
          swapyRef.current.destroy();
        }
      } catch (error) {
        console.error('Erro ao destruir Swapy:', error);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="swapy-container">
      {children}
    </div>
  );
};

// Versão minimalista com controle de tamanho após swap
export const MinimalSwapExample: React.FC = () => {
  // Estado para as dimensões
  const [dimensions, setDimensions] = useState({
    topHeight: 100,
    middleHeight: 200,
    bottomHeight: 100,
    leftWidth: 40, // em percentual
  });
  
  // Estado para controlar qual item está em qual slot após swaps
  const [itemSlotMap, setItemSlotMap] = useState({
    'a': 'top',
    'b': 'middle-left',
    'c': 'middle-right',
    'd': 'bottom'
  });
  
  // Referências para os elementos
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<any>(null);
  
  // Divisores
  const [dragging, setDragging] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // Inicializa o Swapy e configura event handlers
  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
      
      swapyRef.current = createSwapy(containerRef.current, {
        animation: 'dynamic',
        swapMode: 'drop',
        autoScrollOnDrag: true,
        enabled: true
      });
      
      // Captura o evento de swap para atualizar o mapeamento
      swapyRef.current.onSwapEnd((event) => {
        console.log('Swap realizado:', event);
        
        // Atualiza o mapeamento com base no resultado do swap
        const newMap = {...itemSlotMap};
        
        // Percorre o mapa de slots para itens após o swap
        if (event.slotItemMap && event.slotItemMap.asArray) {
          event.slotItemMap.asArray.forEach(([slot, item]) => {
            // Remove o prefixo 'item-' e 'slot-' se existirem
            const slotId = slot.replace('slot-', '');
            const itemId = item.replace('item-', '');
            
            // Encontra a chave correspondente ao slot
            Object.keys(itemSlotMap).forEach(key => {
              if (itemSlotMap[key] === slotId) {
                // Atualiza para o novo item neste slot
                newMap[itemId] = slotId;
              }
            });
          });
          
          setItemSlotMap(newMap);
          console.log('Novo mapeamento após swap:', newMap);
        }
      });
      
    } catch (error) {
      console.error('Erro ao inicializar Swapy:', error);
    }
    
    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
    };
  }, [itemSlotMap]);
  
  // Handler para iniciar o arrasto dos divisores
  const startDrag = (type, e) => {
    e.preventDefault();
    setDragging(type);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = type === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };
  
  // Handler para o movimento durante o arrasto
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      
      const { x: startX, y: startY } = dragStartPos.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setDimensions(prev => {
        if (dragging === 'top') {
          return { ...prev, topHeight: Math.max(50, prev.topHeight + deltaY) };
        } else if (dragging === 'middle') {
          return { ...prev, middleHeight: Math.max(50, prev.middleHeight + deltaY) };
        } else if (dragging === 'horizontal') {
          // Calculamos a largura do container para converter o delta de pixels para percentagem
          const containerWidth = containerRef.current?.querySelector('.middle-container')?.clientWidth || 500;
          const deltaPercent = (deltaX / containerWidth) * 100;
          return { 
            ...prev, 
            leftWidth: Math.min(Math.max(20, prev.leftWidth + deltaPercent), 80) 
          };
        }
        return prev;
      });
      
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      setDragging(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);
  
  // Estilos CSS inline para o exemplo
  const css = `
    .minimal-swapy-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .slot {
      background: #f5f5f5;
      border: 1px dashed #ccc;
      padding: 10px;
      box-sizing: border-box;
      position: relative;
    }
    
    .item {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: grab;
      color: white;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .item-a { background-color: #10b981; }
    .item-b { background-color: #be123c; }
    .item-c { background-color: #4338ca; }
    .item-d { background-color: #7e22ce; }
    
    .middle-container {
      display: flex;
    }
    
    .divider {
      background: #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      user-select: none;
    }
    
    .divider:hover {
      background: #bbb;
    }
    
    .divider::before {
      content: '';
      background: #999;
      border-radius: 2px;
      transition: background 0.2s;
    }
    
    .horizontal-divider {
      width: 10px;
      cursor: col-resize;
    }
    
    .horizontal-divider::before {
      width: 4px;
      height: 30px;
    }
    
    .vertical-divider {
      height: 10px;
      cursor: row-resize;
    }
    
    .vertical-divider::before {
      width: 30px;
      height: 4px;
    }
    
    .handle {
      width: 20px;
      height: 20px;
      background: rgba(0,0,0,0.3);
      position: absolute;
      top: 8px;
      left: 8px;
      border-radius: 3px;
    }
    
    [data-swapy-highlighted] {
      background: rgba(0, 120, 255, 0.1) !important;
    }
  `;
  
  // Adiciona os estilos ao DOM
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
  
  // Mapeia o item para o slot correto e retorna a cor correspondente
  const getItemClass = (itemId) => {
    return `item-${itemId}`;
  };
  
  return (
    <div className="minimal-swapy-container" ref={containerRef}>
      {/* Painel Superior */}
      <div 
        className="slot" 
        data-swapy-slot="top"
        style={{ height: `${dimensions.topHeight}px` }}
      >
        <div 
          className={`item ${getItemClass('a')}`} 
          data-swapy-item="a"
        >
          A
        </div>
      </div>
      
      {/* Divisor superior */}
      <div 
        className="divider vertical-divider" 
        onMouseDown={(e) => startDrag('top', e)}
      />
      
      {/* Container do meio */}
      <div 
        className="middle-container"
        style={{ height: `${dimensions.middleHeight}px` }}
      >
        {/* Painel Esquerdo */}
        <div 
          className="slot" 
          data-swapy-slot="middle-left"
          style={{ width: `${dimensions.leftWidth}%` }}
        >
          <div 
            className={`item ${getItemClass('b')}`} 
            data-swapy-item="b"
          >
            <div className="handle" data-swapy-handle />
            B
          </div>
        </div>
        
        {/* Divisor horizontal */}
        <div 
          className="divider horizontal-divider" 
          onMouseDown={(e) => startDrag('horizontal', e)}
        />
        
        {/* Painel Direito */}
        <div 
          className="slot" 
          data-swapy-slot="middle-right"
          style={{ width: `${100 - dimensions.leftWidth}%` }}
        >
          <div 
            className={`item ${getItemClass('c')}`} 
            data-swapy-item="c"
          >
            C
          </div>
        </div>
      </div>
      
      {/* Divisor inferior */}
      <div 
        className="divider vertical-divider" 
        onMouseDown={(e) => startDrag('middle', e)}
      />
      
      {/* Painel Inferior */}
      <div 
        className="slot" 
        data-swapy-slot="bottom"
        style={{ height: `${dimensions.bottomHeight}px` }}
      >
        <div 
          className={`item ${getItemClass('d')}`} 
          data-swapy-item="d"
        >
          D
        </div>
      </div>
    </div>
  );
};

// Componente de exemplo básico do Swapy
export const BasicSwapyExample: React.FC = () => {
  // CSS para o exemplo
  useEffect(() => {
    const css = `
      .swapy-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .slot {
        padding: 10px;
        border: 1px dashed #ccc;
        border-radius: 4px;
        min-height: 60px;
      }
      
      .slot.top {
        height: 100px;
      }
      
      .middle {
        display: flex;
        gap: 10px;
        min-height: 200px;
      }
      
      .slot.middle-left, .slot.middle-right {
        flex: 1;
      }
      
      .slot.bottom {
        height: 100px;
      }
      
      .item {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: move;
        color: white;
      }
      
      .item-a { background-color: #10b981; }
      .item-b { background-color: #be123c; }
      .item-c { background-color: #4338ca; }
      .item-d { background-color: #7e22ce; }
      
      .handle {
        width: 20px;
        height: 20px;
        background-color: #000;
        opacity: 0.5;
        position: absolute;
        top: 5px;
        left: 5px;
        border-radius: 2px;
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <SwapyContainer>
      <div className="slot top" data-swapy-slot="a">
        <div className="item item-a" data-swapy-item="a">
          <div>A</div>
        </div>
      </div>
      
      <div className="middle">
        <div className="slot middle-left" data-swapy-slot="b">
          <div className="item item-b" data-swapy-item="b">
            <div className="handle" data-swapy-handle></div>
            <div>B</div>
          </div>
        </div>
        
        <div className="slot middle-right" data-swapy-slot="c">
          <div className="item item-c" data-swapy-item="c">
            <div>C</div>
          </div>
        </div>
      </div>
      
      <div className="slot bottom" data-swapy-slot="d">
        <div className="item item-d" data-swapy-item="d">
          <div>D</div>
        </div>
      </div>
    </SwapyContainer>
  );
};

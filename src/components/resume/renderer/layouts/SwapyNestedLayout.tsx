import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { createSwapy } from 'swapy';

// Tipos de layout e direções
type LayoutDirection = 'row' | 'column';
type LayoutItemId = string;

// Interfaces para as props
interface DragHandleProps {
  direction: LayoutDirection;
  onResize: (delta: number) => void;
}

interface LayoutItemProps {
  id: LayoutItemId;
  children: ReactNode;
  className?: string;
}

interface LayoutContainerProps {
  direction: LayoutDirection;
  children: ReactNode[];
  defaultSizes?: number[];
  minSizes?: number[];
  className?: string;
}

// Componente para o divisor arrastável
const DragHandle: React.FC<DragHandleProps> = ({ direction, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = direction === 'row' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const delta = direction === 'row' 
        ? e.clientX - startPosRef.current.x 
        : e.clientY - startPosRef.current.y;
      
      onResize(delta);
      startPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, onResize]);

  return (
    <div
      className={`drag-handle ${direction === 'row' ? 'horizontal' : 'vertical'}`}
      onMouseDown={handleMouseDown}
      style={{
        background: '#ddd',
        cursor: direction === 'row' ? 'col-resize' : 'row-resize',
        ...(direction === 'row'
          ? { 
              width: '2px', 
              margin: '0 -5px', 
              zIndex: 1, 
              position: 'relative'
            }
          : { 
              height: '2px', 
              margin: '-5px 0', 
              zIndex: 1, 
              position: 'relative'
            }),
      }}
    >
      <div className="drag-handle-indicator" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#aaa',
        ...(direction === 'row'
          ? { width: '4px', height: '30px', borderRadius: '2px' }
          : { width: '30px', height: '4px', borderRadius: '2px' }),
      }} />
    </div>
  );
};

// Componente para conteúdo swapável - sem estilização adicional
const SwapableItem: React.FC<LayoutItemProps> = ({ id, children, className = '' }) => {
  return (
    <div 
      className={`swapable-item ${className}`} 
      data-swapy-item={id}
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto', // Permite crescer e encolher
        boxSizing: 'border-box',
      }}
    >
      <div className="handle" data-swapy-handle style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        width: '20px',
        height: '20px',
        borderRadius: '3px',
        background: 'rgba(0,0,0,0.2)',
        cursor: 'move'
      }}/>
      <div className="content-wrapper" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}>
        {children}
      </div>
    </div>
  );
};

// Componente para uma célula do layout - sem estilização adicional
const LayoutCell: React.FC<{ 
  id: string; 
  children: ReactNode;
  minHeight?: string | number;
  minWidth?: string | number;
}> = ({ id, children, minHeight = 100, minWidth = 100 }) => {
  return (
    <div 
      className="layout-cell" 
      data-swapy-slot={id}
      style={{
        minHeight,
        minWidth,
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {children}
    </div>
  );
};

// Componente para o container de layout
const LayoutContainer: React.FC<LayoutContainerProps> = ({
  direction,
  children,
  defaultSizes = [],
  minSizes = [],
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const childCount = React.Children.count(children);
  const [lastRecalc, setLastRecalc] = useState<number>(Date.now());
  
  // Inicializa os tamanhos como porcentagens que sempre somam 100%
  const [sizes, setSizes] = useState<number[]>(() => {
    if (defaultSizes.length === childCount) {
      // Se temos tamanhos definidos, normaliza para somarem 100%
      const sum = defaultSizes.reduce((acc, size) => acc + size, 0);
      return defaultSizes.map(size => (size / sum) * 100);
    }
    // Caso contrário, divide igualmente
    return Array(childCount).fill(100 / childCount);
  });
  
  // Função para redimensionar
  const handleResize = (index: number, delta: number) => {
    if (!containerRef.current) return;
    
    const containerSize = direction === 'row'
      ? containerRef.current.clientWidth
      : containerRef.current.clientHeight;
    
    // Converter o delta em percentagem
    const deltaPercent = (delta / containerSize) * 100;
    
    // Atualizar os tamanhos
    setSizes(prevSizes => {
      const newSizes = [...prevSizes];
      const minSize = minSizes[index] || 5; // Diminuído para 5% para permitir mais flexibilidade
      const minSizeNext = minSizes[index + 1] || 5;
      
      // Aplicar limite mínimo
      const newSizeThis = Math.max(minSize, newSizes[index] + deltaPercent);
      const sizeChange = newSizeThis - newSizes[index];
      
      // Ajustar o próximo item na mesma proporção
      newSizes[index] = newSizeThis;
      newSizes[index + 1] = Math.max(minSizeNext, newSizes[index + 1] - sizeChange);
      
      // Normalizar para garantir que a soma seja sempre 100%
      const sum = newSizes.reduce((acc, size) => acc + size, 0);
      return newSizes.map(size => (size / sum) * 100);
    });
    
    // Marca o timestamp da última recalculação
    setLastRecalc(Date.now());
  };
  
  // Ouvir eventos de resize global para recalcular tamanhos
  useEffect(() => {
    const handleResize = () => {
      // Se passaram menos de 100ms da última recalculação manual, ignore
      if (Date.now() - lastRecalc < 100) return;
      
      // Verifica se o contêiner tem filhos diferentes ou swaps ocorreram
      if (containerRef.current && React.Children.count(children) === childCount) {
        // Força recalculo dos tamanhos para garantir proporções corretas
        setSizes(prevSizes => {
          // Simplesmente normaliza os tamanhos para garantir que somem 100%
          const sum = prevSizes.reduce((acc, size) => acc + size, 0);
          return prevSizes.map(size => (size / sum) * 100);
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Também chamamos uma vez quando o componente monta
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [childCount, children, lastRecalc]);
  
  // Renderiza os itens e os divisores
  return (
    <div
      ref={containerRef}
      className={`layout-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: direction === 'row' ? 'row' : 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        gap: '4px',
      }}
    >
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        
        // Estilo específico baseado na direção
        const flexBasis = `${sizes[index]}%`;
        const itemStyle: React.CSSProperties = {
          // Use flex para o layout
          // Define explicitamente largura/altura baseado na direção
          width: direction === 'row' ? flexBasis : '100%',
          height: direction === 'column' ? flexBasis : '100%',
          
          // Mínimos tamanhos
          minHeight: direction === 'column' ? `${minSizes[index] || 5}%` : '100%',
          minWidth: direction === 'row' ? `${minSizes[index] || 5}%` : '100%',
          
          // Layout e overflow
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        };
        
        // Elemento do item
        const itemElement = (
          <div
            key={`item-${index}`}
            data-item-id={`item-${index}`}
            className="layout-item"
            style={itemStyle}
          >
            {child}
          </div>
        );
        
        // Adicionar o divisor após cada item (exceto o último)
        if (index < childCount - 1) {
          return [
            itemElement,
            <DragHandle
              key={`divider-${index}`}
              direction={direction}
              onResize={(delta) => handleResize(index, delta)}
            />
          ];
        }
        
        return itemElement;
      })}
    </div>
  );
};

// Componente principal de layout aninhado com Swapy
const SwapyNestedLayout: React.FC<{ 
  children: ReactNode;
  className?: string; 
}> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<any>(null);
  const [swapCount, setSwapCount] = useState(0); // Para forçar recálculo após swap
  
  // Inicializar o Swapy com configurações padrão
  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
      
      swapyRef.current = createSwapy(containerRef.current, {});
      
      // Adicionar handler para recalcular tamanhos após swap
      swapyRef.current.onSwapEnd(() => {
        console.log('Swap realizado, recalculando tamanhos...');
        
        // Incrementa o contador para forçar recálculo dos componentes
        setSwapCount(prev => prev + 1);
        
        // Força recálculo em todos os containers
        const recalcContainers = setTimeout(() => {
          // Encontra todos os containers
          const containers = containerRef.current?.querySelectorAll('.layout-container');
          if (containers) {
            // Dispara um evento de redimensionamento para forçar recálculo
            window.dispatchEvent(new Event('resize'));
          }
        }, 50);
        
        return () => clearTimeout(recalcContainers);
      });
      
      console.log('Swapy inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Swapy:', error);
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
  
  // Estilos CSS para garantir altura completa em todos os elementos
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .swapy-nested-layout,
      .layout-container,
      .layout-item,
      .layout-cell,
      .swapable-item,
      .content-wrapper {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
      }
      
      .swapy-nested-layout {
        width: 100%;
        height: 100%;
      }
      
      .drag-handle:hover {
        background: #bbb;
      }
      
      .drag-handle-indicator {
        transition: background 0.2s;
      }
      
      .drag-handle:hover .drag-handle-indicator {
        background: #777;
      }
      
      /* Garantir que todos os conteúdos ocupem 100% de altura */
      .swapable-item > div {
        flex: 1 1 auto;
        height: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`swapy-nested-layout ${className}`}
      data-swap-count={swapCount} // Ajuda no rastreamento de swaps
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </div>
  );
};

// Exemplo de uso com layout recursivo aninhado
export const NestedLayoutExample: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '29.7cm', margin: '0 auto' }}>
      <SwapyNestedLayout>
        {/* Layout principal em coluna */}
        <LayoutContainer direction="column" defaultSizes={[30, 50, 20]}>
          {/* Primeiro container */}
          <LayoutCell id="top" minHeight={120}>
            <SwapableItem id="item1">
              <div style={{ 
                background: '#10b981', 
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto'
              }}>
                <h3 style={{ margin: 0, marginBottom: '10px' }}>Conteúdo Superior</h3>
                <p style={{ margin: 0, flex: '1 1 auto' }}>Este conteúdo acompanha o redimensionamento e preserva seu tamanho durante o swap.</p>
              </div>
            </SwapableItem>
          </LayoutCell>
          
          {/* Segundo container (layout aninhado em linha) */}
          <LayoutContainer direction="row" defaultSizes={[40, 60]}>
            <LayoutCell id="middle-left" minWidth={150}>
              <SwapableItem id="item2">
                <div style={{ 
                  background: '#be123c', 
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto'
                }}>
                  <h3 style={{ margin: 0, marginBottom: '10px' }}>Meio Esquerdo</h3>
                  <p style={{ margin: 0, flex: '1 1 auto' }}>Este painel pode ser redimensionado horizontalmente e trocado com outros painéis.</p>
                </div>
              </SwapableItem>
            </LayoutCell>
            
            {/* Layout aninhado recursivo */}
            <LayoutContainer direction="column" defaultSizes={[50, 50]}>
              <LayoutCell id="middle-right-top" minHeight={100}>
                <SwapableItem id="item3">
                  <div style={{ 
                    background: '#4338ca', 
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto'
                  }}>
                    <h3 style={{ margin: 0, marginBottom: '10px' }}>Meio Direito Superior</h3>
                    <p style={{ margin: 0, flex: '1 1 auto' }}>Este é um painel aninhado que pode ser redimensionado verticalmente.</p>
                  </div>
                </SwapableItem>
              </LayoutCell>
              
              <LayoutCell id="middle-right-bottom" minHeight={100}>
                <SwapableItem id="item4">
                  <div style={{ 
                    background: '#7e22ce', 
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto'
                  }}>
                    <h3 style={{ margin: 0, marginBottom: '10px' }}>Meio Direito Inferior</h3>
                    <p style={{ margin: 0, flex: '1 1 auto' }}>Experimente arrastar os divisores para redimensionar os painéis.</p>
                  </div>
                </SwapableItem>
              </LayoutCell>
            </LayoutContainer>
          </LayoutContainer>
          
          {/* Terceiro container */}
          <LayoutCell id="bottom" minHeight={100}>
            <SwapableItem id="item5">
              <div style={{ 
                background: '#0891b2', 
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto'
              }}>
                <h3 style={{ margin: 0, marginBottom: '10px' }}>Conteúdo Inferior</h3>
                <p style={{ margin: 0, flex: '1 1 auto' }}>Arraste o manipulador no canto superior esquerdo para trocar este painel com outros.</p>
              </div>
            </SwapableItem>
          </LayoutCell>
        </LayoutContainer>
      </SwapyNestedLayout>
    </div>
  );
};

// Exportar todos os componentes para uso externo
export {
  LayoutContainer,
  LayoutCell,
  SwapableItem,
  DragHandle,
  SwapyNestedLayout
};

export default SwapyNestedLayout; 
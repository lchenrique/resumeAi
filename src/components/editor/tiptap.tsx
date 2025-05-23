import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, createContext, useContext } from 'react';
import { Editor, EditorContent, useEditor, NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, NodeViewProps } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BaseParagraph from '@tiptap/extension-paragraph';
import { Node as ProseMirrorNode, Fragment, Slice, DOMParser as ProseMirrorDOMParser, DOMSerializer } from '@tiptap/pm/model';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { createSwapy } from 'swapy';

// --- Contexto para Instance ID ---
const InstanceIdContext = createContext<string | null>(null);

// --- Helper Functions ---
const generateNodeId = () => `node-${Math.random().toString(36).substr(2, 9)}`;

// Função para extrair IDs existentes do documento (revisada)
const getNodeIdsFromDoc = (doc: ProseMirrorNode): string[] => {
    const ids: string[] = [];
    // Usar descendants para percorrer todos os nós e garantir que pegamos os de tipo 'paragraph'
    doc.descendants(node => {
        if (node.type.name === 'paragraph' && node.attrs.id) {
            ids.push(node.attrs.id);
        }
        // Não precisamos retornar false aqui, pois queremos percorrer todos os parágrafos
        return true; 
    });
    return ids;
};

// --- Custom Draggable Node Component (NodeView) ---
const DraggableNodeComponent: React.FC<NodeViewProps> = ({ node, editor, getPos, selected }) => {
    const instanceId = useContext(InstanceIdContext); // Obter instanceId do contexto
    const nodeId = node.attrs.id || generateNodeId(); // Garantir que sempre existe um ID

    const style: React.CSSProperties = {
        position: 'relative',
        marginLeft: '1.5rem', // Manter o espaço para o handle
    };

    const wrapperClass = `draggable-item group relative ${selected ? 'is-selected' : ''}`;

    return (
        <NodeViewWrapper 
            style={style} 
            className={wrapperClass} 
            data-node-id={nodeId} 
            data-swapy-slot={nodeId}
        >
            {/* Draggable Item Container */}
            <div 
                data-swapy-item={nodeId} 
                className="flex items-start w-full"
            >
                {/* Drag Handle */}
                <div
                    contentEditable={false}
                    draggable={false}
                    data-swapy-handle
                    className="absolute -left-6 top-0.5 cursor-grab p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                    style={{ userSelect: 'none' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                    </svg>
                </div>
                {/* Conteúdo editável */}
                <NodeViewContent className="node-content flex-grow" />
            </div>
        </NodeViewWrapper>
    );
};

// --- Tiptap Extension Definition (ESTÁTICA) ---
// Renomear para Paragraph e estender BaseParagraph
const Paragraph = BaseParagraph.extend({
    // Manter o nome 'paragraph' para compatibilidade de schema
    name: 'paragraph',

    // Adicionar nossas customizações (ID e NodeView)
    draggable: false,
    isolating: true,

    addAttributes() {
        return {
            ...(this.parent?.() || {}), 
            id: {
                default: () => generateNodeId(), // Gerar ID por default para qualquer parágrafo novo
                parseHTML: (element: HTMLElement) => element.getAttribute('data-id') || generateNodeId(),
                renderHTML: (attributes: Record<string, any>) => {
                    // Garantir que sempre haverá um ID
                    const id = attributes.id || generateNodeId();
                    return { 'data-id': id };
                },
                keepOnSplit: false,
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(DraggableNodeComponent);
    },
});

// Conteúdo inicial usando <p> tags normais
const initialContent = `
<p data-id="${generateNodeId()}">Bloco Inicial 1. Arraste-me!</p>
<p data-id="${generateNodeId()}">Bloco Inicial 2. Edite-me!</p>
<p data-id="${generateNodeId()}">Bloco 3.</p>
`;

// --- Tiptap Editor Component ---
export default function TiptapNotionEditor() {
    const [nodeIds, setNodeIds] = useState<string[]>([]);
    const editorRef = useRef<Editor | null>(null);
    const editorContentRef = useRef<HTMLDivElement>(null); // Ref para o container do EditorContent
    const swapyContainerRef = useRef<HTMLElement | null>(null); // Ref para o container do Swapy
    const swapyInstanceRef = useRef<any>(null); // Ref para a instância do swapy

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // NÃO desabilitar mais o parágrafo, pois o nosso o substitui
                 paragraph: undefined, // ou simplesmente remover a linha
                // Outras configurações do StarterKit podem permanecer
            }),
            // Nossa extensão Paragraph estendida (que tem o NodeView)
            // substituirá a padrão do StarterKit devido à ordem ou configuração interna
             Paragraph, 
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
            },
            handleKeyDown: (view, event) => {
                const { state, dispatch } = view;
                let { tr } = state; // Pegar tr mutável do estado
                const { selection } = state;
                const { $head } = selection;
                const nodeType = state.schema.nodes.paragraph;

                // --- Enter Key Logic ---
                if (event.key === 'Enter' && !event.shiftKey) {
                    if ($head.parent.type === nodeType && $head.parentOffset === $head.parent.content.size) {
                        event.preventDefault();
                        const newNodeId = generateNodeId();
                        const newNode = nodeType.create({ id: newNodeId }); // newNode.nodeSize é conhecido aqui (ex: 2 para <p></p>)

                        const originalInsertPos = $head.after(); // Posição no doc ANTES da inserção
                        tr = tr.insert(originalInsertPos, newNode);

                        // Posição no tr.doc que corresponde à originalInsertPos.
                        // Como inserimos em originalInsertPos, esta posição mapeada agora está DEPOIS do newNode.
                        const posAfterNewNodeInTrDoc = tr.mapping.map(originalInsertPos);
                        
                        // Calcular onde o newNode efetivamente começou no tr.doc
                        const startOfNewNodeInTrDoc = posAfterNewNodeInTrDoc - newNode.nodeSize;

                        // Posição do cursor é +1 para dentro do novo nó (após sua tag de abertura)
                        const cursorPosInNewNode = startOfNewNodeInTrDoc + 1;
                        
                        // Garantir que a posição do cursor seja válida
                        if (cursorPosInNewNode >= 0 && cursorPosInNewNode <= tr.doc.content.size) {
                            tr = tr.setSelection(TextSelection.create(tr.doc, cursorPosInNewNode));
                        } else {
                            // Fallback se o cálculo falhar (improvável com esta lógica, mas seguro)
                            console.warn("Cálculo da posição do cursor resultou em valor inválido:", cursorPosInNewNode, "Tamanho do doc:", tr.doc.content.size );
                            // Tentar focar no final do nó inserido como fallback
                             const fallbackPos = Math.min(startOfNewNodeInTrDoc + newNode.content.size, tr.doc.content.size);
                             tr = tr.setSelection(TextSelection.create(tr.doc, fallbackPos));
                        }
                        
                        dispatch(tr);
                        return true;
                    }
                }
                // --- Backspace Logic ---
                if (event.key === 'Backspace') {
                    if (selection.empty && $head.parentOffset === 0 && $head.depth > 1 && $head.parent.type === nodeType && $head.parent.content.size === 0) {
                        if(state.doc.childCount > 1){ 
                            event.preventDefault();
                            const backspaceTr = state.tr.delete($head.before(), $head.after());
                            dispatch(backspaceTr);
                            return true;
                        }
                    }
                }
                return false;
            },
        },
        onCreate: ({ editor }) => {
            editorRef.current = editor;
            const initialIds = getNodeIdsFromDoc(editor.state.doc);
            setNodeIds(initialIds);
            console.log("Editor criado, IDs iniciais:", initialIds);
        },
        onUpdate: ({ editor }) => {
             editorRef.current = editor;
            const currentIds = getNodeIdsFromDoc(editor.state.doc);
            
            // Verificar se os IDs dos blocos mudaram
            const idsChanged = JSON.stringify(currentIds) !== JSON.stringify(nodeIds);
            
            if (idsChanged) {
                console.log("Estrutura de blocos alterada:", {
                    antigos: nodeIds,
                    novos: currentIds
                });
                
                // Atualizar os IDs no estado
                setNodeIds(currentIds);
                
                // Forçar atualização do Swapy na próxima renderização
                // (o useEffect com dependência em nodeIds vai cuidar disso)
            }
        },
    });

    // Recriar findNodePosById (adaptar tipo do ID se necessário)
    const findNodePosById = (doc: ProseMirrorNode, id: string): number | null => {
        let foundPos: number | null = null;
        doc.descendants((node, pos) => {
            // Acessar attrs pode precisar de checagem, mas id deve existir
            if (node.type.name === 'paragraph' && node.attrs.id === id) { 
                foundPos = pos;
                return false; // Parar busca
            }
            return true; // Continuar busca
        });
        return foundPos;
    };

    // Inicializar Swapy
    useEffect(() => {
        // Se não tivermos o editor ou o container, não podemos inicializar
        if (!editor || !swapyContainerRef.current) {
            console.log("Swapy: Editor ou container não disponível, pulando inicialização", {
                hasEditor: !!editor,
                hasSwapyContainer: !!swapyContainerRef.current
            });
            return;
        }
        
        // Limpar instância anterior se existir
        if (swapyInstanceRef.current) {
            try {
                swapyInstanceRef.current.destroy();
                console.log('Swapy: Instância anterior destruída');
            } catch(e) { 
                console.error("Erro ao destruir swapy", e); 
            }
            swapyInstanceRef.current = null;
        }
        
        console.log("Swapy: Inicializando no container:", swapyContainerRef.current);
        console.log("Swapy: Verificando itens e handles:");
        swapyContainerRef.current.querySelectorAll('[data-swapy-item]').forEach(item => 
            console.log("   Encontrado data-swapy-item:", item)
        );
        swapyContainerRef.current.querySelectorAll('[data-swapy-handle]').forEach(handle => 
            console.log("   Encontrado data-swapy-handle:", handle)
        );

        try {
            swapyInstanceRef.current = createSwapy(swapyContainerRef.current, {
                // Configurações do Swapy
            });
            console.log("Swapy: Instância criada com sucesso");

            // Registrar os event handlers
            swapyInstanceRef.current.onSwapStart((event: any) => {
                console.log("--- Swapy 'onSwapStart' Event Ocorreu ---", event);
            });
            swapyInstanceRef.current.onSwap((event: any) => {
                console.log("--- Swapy 'onSwap' Event Ocorreu ---", event);
                handleSwapyEvent(event); // Chamar nosso handler principal
            });
            swapyInstanceRef.current.onSwapEnd((event: any) => {
                console.log("--- Swapy 'onSwapEnd' Event Ocorreu ---", event);
            });
            console.log("Swapy: Listeners onSwapStart, onSwap, onSwapEnd registrados.");
            
        } catch (error) {
            console.error("Swapy: Erro durante a inicialização:", error);
        }

        // Handler para o evento de swap
        const handleSwapyEvent = (event: any) => { 
            console.log("--- Processando evento Swapy ---", event); 
            const draggedElement = event.itemElement; 
            const targetElement = event.overItemElement; 
            
            if (!draggedElement || !editorRef.current) {
                 console.warn("Swapy event: draggedElement ou editorRef não encontrado.");
                 return;
            }

            const draggedId = draggedElement.dataset.swapyItem; 
            const targetId = targetElement?.dataset.swapyItem;
            
            if (!draggedId) {
                console.error("Swapy: ID não encontrado no elemento arrastado", draggedElement);
                return;
            }

            const editor = editorRef.current;
            const { state, view } = editor;
            let { tr } = state;

            const oldPos = findNodePosById(state.doc, draggedId);

            if (oldPos === null) {
                console.error("Swapy: Posição do nó arrastado não encontrada", draggedId);
                return;
            }

            const draggedNode = state.doc.nodeAt(oldPos);
            if (!draggedNode) {
                 console.error("Swapy: Nó não encontrado em oldPos", oldPos);
                 return;
            }

            tr = tr.delete(oldPos, oldPos + draggedNode.nodeSize);

            let insertPos: number;

            if (targetId) {
                 const targetPosInOriginalDoc = findNodePosById(state.doc, targetId);
                 if (targetPosInOriginalDoc === null) {
                    console.error("Swapy: Posição do nó alvo não encontrada no documento original", targetId);
                    insertPos = tr.doc.content.size;
                 } else {
                    const targetPosMapped = tr.mapping.map(targetPosInOriginalDoc); 
                    const targetNodeAtMappedPos = tr.doc.nodeAt(targetPosMapped);
                    
                    if (targetNodeAtMappedPos) { 
                         if (oldPos > targetPosInOriginalDoc) {
                            insertPos = targetPosMapped;
                         } else {
                            insertPos = targetPosMapped + targetNodeAtMappedPos.nodeSize;
                         }
                    } else {
                        console.warn("Swapy: Nó alvo não encontrado após mapeamento, inserindo no final da deleção");
                        insertPos = tr.doc.content.size;
                    }
                 }
            } else {
                insertPos = tr.doc.content.size;
            }

            tr = tr.insert(insertPos, draggedNode);
            view.dispatch(tr);
            setNodeIds(getNodeIdsFromDoc(editor.state.doc)); 
        };

        return () => {
            if (swapyInstanceRef.current) {
                try {
                    swapyInstanceRef.current.destroy();
                    console.log('Swapy destruído na limpeza');
                } catch(e) { 
                    console.error("Erro ao destruir swapy", e); 
                }
                swapyInstanceRef.current = null;
            }
        };
    }, [editor, swapyContainerRef.current, nodeIds]); // Adicionar nodeIds como dependência

    // Atualizar o swapyContainerRef sempre que o editor mudar
    useLayoutEffect(() => {
        if (!editorContentRef.current || !editor) return;
        
        // Atualizar a ref do container do Swapy após toda renderização
        const tiptapRootElement = editorContentRef.current;
        const prosemirrorViewDom = tiptapRootElement.querySelector<HTMLElement>('.ProseMirror');
        
        if (prosemirrorViewDom) {
            const previousContainer = swapyContainerRef.current;
            swapyContainerRef.current = prosemirrorViewDom;
            
            // Verificar se o DOM mudou significativamente
            const currentItemsCount = prosemirrorViewDom.querySelectorAll('[data-swapy-item]').length;
            const currentHandlesCount = prosemirrorViewDom.querySelectorAll('[data-swapy-handle]').length;
            
            console.log("swapyContainerRef atualizado:", {
                container: prosemirrorViewDom,
                itemsCount: currentItemsCount,
                handlesCount: currentHandlesCount
            });
        }
    }, [editor, nodeIds]); // Re-executar quando o editor ou os IDs dos nós mudarem

    // --- Render ---
    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    if (!editor) {
        return <div>Carregando Editor...</div>;
    }

    return (
        // Adicionar ref ao container
        <div ref={editorContentRef} className="max-w-3xl mx-auto p-4 my-8">
            <EditorContent editor={editor} className="p-2 border rounded-lg shadow-sm bg-white" />
        </div>
    );
}

import { Node, mergeAttributes, Editor, RawCommands } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import React from 'react'
import { LayoutContainer, LayoutCell, SwapableItem, SwapyNestedLayout } from '@/components/resume/renderer/layouts/SwapyNestedLayout'

// Componente recursivo para células
const RecursiveColumn = ({ 
    node, 
    updateAttributes, 
    editor,
    id,
    direction = 'row'
}: { 
    node: any, 
    updateAttributes: (attrs: Record<string, any>) => void, 
    editor: Editor,
    id: string,
    direction?: 'row' | 'column'
}) => {
    // Verifica se o nó atual é uma coluna com duas subcolunas
    const hasTwoColumns = node.content?.content?.length === 2 && 
                         node.content.content[0].type.name === 'column' && 
                         node.content.content[1].type.name === 'column';

    // Alterna a direção para o próximo nível
    const nextDirection = direction === 'row' ? 'column' : 'row';

    if (hasTwoColumns) {
        // Se tem duas subcolunas, renderiza um layout aninhado
        return (
            <LayoutContainer direction={direction} defaultSizes={node.attrs.sizes || [50, 50]}>
                <LayoutCell id={`${id}-1`} minWidth={direction === 'row' ? 100 : undefined} minHeight={direction === 'column' ? 100 : undefined}>
                    <SwapableItem id={`${id}-item1`}>
                        <RecursiveColumn 
                            node={node.content.content[0]} 
                            updateAttributes={updateAttributes} 
                            editor={editor}
                            id={`${id}-1`}
                            direction={nextDirection}
                        />
                    </SwapableItem>
                </LayoutCell>
                <LayoutCell id={`${id}-2`} minWidth={direction === 'row' ? 100 : undefined} minHeight={direction === 'column' ? 100 : undefined}>
                    <SwapableItem id={`${id}-item2`}>
                        <RecursiveColumn 
                            node={node.content.content[1]} 
                            updateAttributes={updateAttributes} 
                            editor={editor}
                            id={`${id}-2`}
                            direction={nextDirection}
                        />
                    </SwapableItem>
                </LayoutCell>
            </LayoutContainer>
        );
    }

    // Se não tem subcolunas, renderiza o conteúdo normal
    return (
        <NodeViewContent className="column-content" data-type={`column-${id}`} />
    );
};

// Componente para o NodeView das Duas Colunas
const TwoColumnsNodeViewComponent = ({ node, updateAttributes, editor }: { node: any, updateAttributes: (attrs: Record<string, any>) => void, editor: Editor }) => {
    return (
        <NodeViewWrapper className="two-columns-nodeview">
            <SwapyNestedLayout direction="column">
                <RecursiveColumn 
                    node={node} 
                    updateAttributes={updateAttributes} 
                    editor={editor}
                    id="root"
                    direction="row" // Começa com direção horizontal
                />
            </SwapyNestedLayout>
        </NodeViewWrapper>
    );
}

export const TwoColumns = Node.create({
    name: 'twoColumns',
    group: 'block',
    content: 'column column',

    addAttributes() {
        return {
            sizes: {
                default: [50, 50],
                parseHTML: element => {
                    const sizesAttr = element.getAttribute('data-sizes');
                    return sizesAttr ? sizesAttr.split(',').map(parseFloat) : [50, 50];
                },
                renderHTML: attributes => {
                    return {
                        'data-sizes': attributes.sizes ? attributes.sizes.join(',') : '50,50',
                    };
                },
            },
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-id'),
                renderHTML: attributes => ({ 'data-id': attributes.id }),
            }
        };
    },

    parseHTML() {
        return [{ tag: 'div.two-columns' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'two-columns' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TwoColumnsNodeViewComponent);
    },

    addCommands() {
        return {
            insertTwoColumns: () => ({ state, dispatch }) => {
                const { selection } = state;
                const position = selection.$head ? selection.$head.pos : selection.$from.pos;

                const node = this.type.create(
                    { sizes: [50, 50], id: `twocol-${Math.random().toString(36).substr(2, 9)}` },
                    [
                        state.schema.nodes.column.create(null, state.schema.nodes.paragraph.create()),
                        state.schema.nodes.column.create(null, state.schema.nodes.paragraph.create()),
                    ]
                );

                if (dispatch) {
                    const tr = state.tr.insert(position, node);
                    dispatch(tr);
                }
                return true;
            },
        } as Partial<RawCommands>;
    },
});

export const Column = Node.create({
    name: 'column',
    content: 'block+',
    defining: true,
    selectable: false,
    draggable: false,

    parseHTML() {
        return [{ tag: 'div.column-content' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'column-content' }), 0];
    },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertTwoColumns: {
      insertTwoColumns: () => ReturnType
    }
  }
}
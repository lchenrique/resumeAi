import { Editor } from "@tiptap/core"
import { Heading1, Heading2, List, Trash, Type } from "lucide-react"
export interface BlockMenuProps {
    blockMenuRef: React.RefObject<HTMLDivElement>
    blockMenuPosition: { x: number, y: number }
    editor: Editor
    currentNodePos: number | null
    setShowBlockMenuState: (show: boolean) => void
}
export function BlockMenu({ blockMenuRef, blockMenuPosition, editor, currentNodePos, setShowBlockMenuState }: BlockMenuProps) {
    return (
        <div
            ref={blockMenuRef}
            className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 w-48 max-h-80 overflow-auto"
            style={{ left: `${blockMenuPosition.x}px`, top: `${blockMenuPosition.y}px` }}
        >
            <div className="py-1">
                <button
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100"
                    onClick={() => {
                        if (editor && currentNodePos !== null) {
                            editor.chain().focus().insertContentAt(currentNodePos, {
                                type: 'paragraph',
                                content: [{ type: 'text', text: '' }]
                            }).run();
                            setShowBlockMenuState(false);
                        }
                    }}
                >
                    <Type size={16} className="text-gray-500" />
                    <div className="font-medium">Parágrafo</div>
                </button>
                <button
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100"
                    onClick={() => {
                        if (editor && currentNodePos !== null) {
                            editor.chain().focus().insertContentAt(currentNodePos, {
                                type: 'heading',
                                attrs: { level: 1 },
                                content: [{ type: 'text', text: '' }]
                            }).run();
                            setShowBlockMenuState(false);
                        }
                    }}
                >
                    <Heading1 size={16} className="text-gray-500" />
                    <div className="font-medium">Título 1</div>
                </button>
                <button
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100"
                    onClick={() => {
                        if (editor && currentNodePos !== null) {
                            editor.chain().focus().insertContentAt(currentNodePos, {
                                type: 'heading',
                                attrs: { level: 2 },
                                content: [{ type: 'text', text: '' }]
                            }).run();
                            setShowBlockMenuState(false);
                        }
                    }}
                >
                    <Heading2 size={16} className="text-gray-500" />
                    <div className="font-medium">Título 2</div>
                </button>
                <button
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100"
                    onClick={() => {
                        if (editor && currentNodePos !== null) {
                            editor.chain().focus().insertContentAt(currentNodePos, {
                                type: 'bulletList',
                                content: [{
                                    type: 'listItem',
                                    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
                                }]
                            }).run();
                            setShowBlockMenuState(false);
                        }
                    }}
                >
                    <List size={16} className="text-gray-500" />
                    <div className="font-medium">Lista</div>
                </button>
                <button
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 text-red-600"
                    onClick={() => {
                        if (editor && currentNodePos !== null) {
                            // Encontrar o tipo do nó na posição atual
                            const { doc, schema } = editor.view.state;
                            const $pos = doc.resolve(currentNodePos);
                            const nodeType = $pos.parent.type;

                            // Usar o tipo de nó correto para deletar
                            editor.chain().focus().deleteNode(nodeType).run();
                            setShowBlockMenuState(false);
                        }
                    }}
                >
                    <Trash size={16} />
                    <div className="font-medium">Remover</div>
                </button>
            </div>
        </div>
    )
}

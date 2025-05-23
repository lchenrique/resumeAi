'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Layout } from 'react-grid-layout';
import { useSearchParams } from 'next/navigation';
import { Editor, JSONContent } from '@tiptap/react';
export type EditorItem = {
    id: string;
    content: JSONContent; // Pode ser string ou JSON se preferir
    layout: Layout;
};

type FormValues = {
    editors: EditorItem[];
};

interface DragData {
    sourceId: string;
    content: JSONContent;
    sourcePos: number;
    nodeSize: number;
    dropped: boolean;
  }
  
  // Interface para os comandos de bloco
  export interface BlockCommand {
    title: string;
    description: string;
    icon: React.ReactNode;
    command: (editor: Editor) => boolean | void;
  }
  

const EditorContext = createContext<null | {
    control: ReturnType<typeof useForm<FormValues>>['control'];
    setValue: ReturnType<typeof useForm<FormValues>>['setValue'];
    editorValues: EditorItem[];
    updateEditorContent: (id: string, content: JSONContent) => void;
    updateLayout: (layout: Layout[]) => void;
    form: ReturnType<typeof useForm<FormValues>>;
    draggedBlock: DragData | null;
    setDraggedBlock: (draggedBlock: DragData | null) => void;
}>(null);

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
    const [draggedBlock, setDraggedBlock] = useState<DragData | null>(null);
   

    const query = useSearchParams()
    const contents = query?.get('contents')
    const form = useForm<FormValues>({
        defaultValues: {
            editors: contents ? JSON.parse(contents) : [
                {
                    id: '1',
                    content: {
                        type: 'paragraph',
                        content: [{
                            type: 'text',
                            text: ''
                        }]
                    },
                    layout: { i: '1', x: 0, y: 0, w: 24, h: 4 },
                }
            ],
        },
    });

    const editorValues = useWatch({ control: form.control, name: 'editors' }) ?? [];


    const updateEditorContent = (id: string, content: JSONContent) => {
        const current = form.getValues('editors');
        form.setValue(
            'editors',
            current.map(e => (e.id === id ? { ...e, content: content } : e)),
        );
    };

    const updateLayout = (layout: Layout[]) => {
        const current = form.getValues('editors');
        const updated = current.map(editor => {
            const newLayout = layout.find(l => l.i === editor.id);
            return newLayout ? { ...editor, layout: newLayout } : editor;
        });
        form.setValue('editors', updated);
    };


    return (
        <FormProvider {...form}>
            <EditorContext.Provider
                value={{
                    control: form.control,
                    setValue: form.setValue,
                    editorValues,
                    updateEditorContent,
                    updateLayout,
                    form,
                    draggedBlock,
                    setDraggedBlock
                }}
            >
                {children}
            </EditorContext.Provider>
        </FormProvider>
    );
};

export const useEditorContext = () => {
    const ctx = useContext(EditorContext);
    if (!ctx) throw new Error('useEditorContext deve estar dentro do EditorProvider');
    return ctx;
};

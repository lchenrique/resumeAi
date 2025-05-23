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
  
  function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
    useEffect(() => {
      const handler = setTimeout(() => effect(), delay);
      return () => clearTimeout(handler);
    }, [...deps, delay]);
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
    id?: string;
    savePdfData: () =>  Promise<void>;
    isSaving: boolean;  
}>(null);

export const EditorProvider = ({ children, initialData, id:dataId }: { children: React.ReactNode, initialData: EditorItem[], id: string }) => {
    const [draggedBlock, setDraggedBlock] = useState<DragData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    
    const savePdfData =  useCallback(async () => {
        setIsSaving(true);
        const res = await fetch('/api/pdf/save-pdf-data', {
            method: 'POST',
            body: JSON.stringify({ data: editorValues, id: dataId }),
            headers: { 'Content-Type': 'application/json' },
          });
          const { id } = await res.json();
          console.log('ID salvo:', id);
          setIsSaving(false);
    }, []);
   

    const query = useSearchParams()
    const contents = query?.get('contents')
    console.log(contents)
    const form = useForm<FormValues>({
        defaultValues: {
            editors:  initialData?.length > 0 ? initialData : [
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

  // Salva o conteúdo 1000ms após parar de digitar
  useDebouncedEffect(() => {
    if (editorValues && editorValues.length > 0) {
      console.log('⏳ Conteúdo salvo:', editorValues);
      savePdfData(); // Aqui você salva tudo no Supabase ou outro backend
    }
  }, [editorValues], 1000);



  

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
                    setDraggedBlock,
                    id: dataId,
                    savePdfData,
                    isSaving
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

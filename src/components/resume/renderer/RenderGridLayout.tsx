import React, { useEffect, useMemo, useState } from 'react';
import GridLayout from "react-grid-layout";
import { Layout as RGLLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ResumeTemplate, ResumeLayout as LayoutConfiguration, CellType, ContainerType, Options } from './types';
import { EditorInstance } from '@/components/editor/EditorInstance';
import { cn } from '@/lib/utils';
import { GripIcon, GripVertical, Loader2 } from 'lucide-react';
import { getSectionContent, sectionMap } from '../sections/section-map';
import { JSONContent } from '@tiptap/react';
import { EditorItem, useEditorContext } from '@/contexts/editor-context';
import { useFormContext } from 'react-hook-form';
import { ResumeSectionKey } from '@/types/resume-data';
import { HandlesDrag } from './HandlesDrag';
import { useSearchParams } from 'next/navigation';
import { ResumeSkeleton } from '../resume-skeleton';


const A4_WIDTH_PX = 794;
const GRID_ROW_HEIGHT_PX = 25.5; // Isso dá A4_HEIGHT_PX / GRID_ROW_HEIGHT_PX = 112.3 linhas

interface RenderGridLayoutProps {
    template: ResumeTemplate;
}



const mapLayoutConfigToGridLayout = (
    layoutConfig: LayoutConfiguration,
): EditorItem[] => {
    const TOTAL_COLUMNS = 24;

    const mappedItems = layoutConfig.containers.reduce((acc, container) => {
        let x = 0;
        let y = 0;

        const lastItem = acc[acc.length - 1]?.layout;

        if (lastItem) {
            const nextX = lastItem.x + lastItem.w;

            if (nextX + container.cols <= TOTAL_COLUMNS) {
                x = nextX;
                y = lastItem.y;
            } else {
                x = 0;
                y = lastItem.y + lastItem.h;
            }
        }

        acc.push({
            id: container.id,
            content: getSectionContent(container.id as keyof typeof sectionMap),
            layout: {
                i: container.id,
                x,
                y,
                w: container.cols,
                h: container.rows,
            },
        });

        return acc;
    }, [] as any[]);

    return mappedItems;
};


const RenderGridLayout: React.FC<RenderGridLayoutProps> = ({ template }) => {
    const { editorValues, updateEditorContent, updateLayout, form, id } = useEditorContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            if (!form) {
                return;
            }
            if (!template || !template.layoutConfig) {
                return;
            }
            const items = mapLayoutConfigToGridLayout(
                template.layoutConfig,
            );
            setTimeout(() => {
                form.setValue('editors', items);
            }, 100);
        }
        setIsLoading(false);

    }, [template]);

    const onResizeStop = (layout: RGLLayout[], oldItem: RGLLayout, newItem: RGLLayout) => {
        const newLayouts = { lg: [...editorValues.map(e => e.layout)] };
        newLayouts.lg[oldItem.i as any] = newItem;
        updateLayout(newLayouts.lg);
    };

    const onLayoutChange = (layout: RGLLayout[]) => {
        console.log('layout', layout);
        updateLayout(layout);
    };

    if (isLoading) return <ResumeSkeleton />


    return (

        <GridLayout
            layout={editorValues.map(e => e.layout)}
            rowHeight={GRID_ROW_HEIGHT_PX}
            cols={24}
            width={A4_WIDTH_PX} // Largura total para o ResponsiveGridLayout
            preventCollision={false} // Para testar se colisões estão causando problemas
            // isBounded={true} // Adicionado para manter itens dentro da grade
            margin={[2, 2]} // Sem margens entre os itens da grade
            containerPadding={[20, 20]} // Sem padding no container da grade
            onResizeStop={onResizeStop}
            onLayoutChange={onLayoutChange}
            draggableHandle='.handle-drag'
            resizeHandles={["e", "w", "s", "se", "sw"]}
        >
            {editorValues?.map((editor, i) => {
                // const options = editor?.options;
                return (
                    <div
                        key={editor.id}
                        className="grid-item relative group/grid-item  h-[inherit]  text-xs"
                        data-grid={editor.layout} // Importante para react-grid-layout
                        style={{
                            // backgroundColor: options?.bgColor || 'transparent',
                            // borderRadius: options?.borderRadius ? `${options?.borderRadius?.topLeft}px ${options?.borderRadius?.topRight}px ${options?.borderRadius?.bottomRight}px ${options?.borderRadius?.bottomLeft}px` : '0px',
                        }}
                    >
                        <div className='handle-drag'>
                            <GripIcon size={16} className='text-gray-400 hover:text-gray-600 rounded transition-colors' />
                        </div>

                        <div
                            className={cn("block-item group/grid-item   w-full h-[inherit] z-[100]")}
                        >

                            <EditorInstance
                                id={editor.id}
                                content={editor.content}
                                onUpdate={(id, newContent) => {
                                    updateEditorContent(editor.id, newContent);
                                }}
                            />
                        </div>

                        <HandlesDrag />

                        {/* <div className='handle-drag-detect-s  absolute bottom-0 left-0 w-full h-24 ' />
                        <div className='react-resizable-handle react-resizable-handle-s' />

                        <div className='handle-drag-detect-e  absolute right-0 bottom-0 w-24 h-full ' />
                        <div className='react-resizable-handle react-resizable-handle-e' />

                        <div className='handle-drag-detect-w  absolute left-0 bottom-0 w-24 h-full ' />
                        <div className='react-resizable-handle react-resizable-handle-w' /> */}

                    </div>
                )
            })}
        </GridLayout>
    );
};

export default RenderGridLayout;

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller, Form } from 'react-hook-form';
import { CustomResumeData, ResumeSectionKey } from '@/types/resume-data';
import { Options, SectionSpecificStyles, TemplateLayoutConfig } from '@/components/editor/initial';
import { Editor } from '@/components/editor/DynamicEditor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ColumnContoller } from './controllers/ColumnContoller';
import { ChevronRight, Minus, Plus, Settings, X, RotateCcw } from 'lucide-react';
import { cn, convertToBlock } from '@/lib/utils';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { v4 as uuidv4 } from 'uuid';
import { createPortal } from 'react-dom';
import { createSwapy, Swapy } from 'swapy'

// Tipos de Caminho para identificar elementos no layout aninhado
type PathComponent = { colIndex: number; rowIndex: number };
type ElementPath = PathComponent[];

// Aliases de tipo locais para clareza, derivados de TemplateLayoutConfig
type LayoutColumn = NonNullable<TemplateLayoutConfig['columns']>[number];
type LayoutRow = NonNullable<LayoutColumn['rows']>[number];

interface TranformedLayoutProps {
    layoutConfig: TemplateLayoutConfig;
    resumeData: CustomResumeData;
    isEditable: boolean;
    onSectionContentChange: (sectionKey: ResumeSectionKey, newContent: string) => void;
}

export const TranformedLayout: React.FC<TranformedLayoutProps> = ({
    layoutConfig,
    resumeData,
    isEditable,
    onSectionContentChange,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState<{ [key: string]: boolean }>({});
    const [layoutColumns, setLayoutColumns] = useState<LayoutColumn[] | undefined>(
        JSON.parse(JSON.stringify(layoutConfig.columns || []))
    );

    useEffect(() => {
        if (layoutConfig.columns && layoutConfig.columns.length > 0) {
            setLayoutColumns(JSON.parse(JSON.stringify(layoutConfig.columns)));
        }
    }, [layoutConfig.columns]);


    const swapyRef = useRef<Swapy | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (containerRef.current) {
            swapyRef.current = createSwapy(containerRef.current, {
                // animation: 'dynamic'
                // swapMode: 'drop',
                // autoScrollOnDrag: true,
                // enabled: true,
                // dragAxis: 'x',
                // dragOnHold: true
            })

            // swapyRef.current.enable(false)
            // swapyRef.current.destroy()
            // console.log(swapyRef.current.slotItemMap())

            swapyRef.current.onBeforeSwap((event) => {
                console.log('beforeSwap', event)
                // This is for dynamically enabling and disabling swapping.
                // Return true to allow swapping, and return false to prevent swapping.
                return true
            })

            swapyRef.current.onSwapStart((event) => {
                console.log('start', event);
            })
            swapyRef.current.onSwap((event) => {
                console.log('swap', event);
            })
            swapyRef.current.onSwapEnd((event) => {
                console.log('end', event);
            })
        }
        return () => {
            swapyRef.current?.destroy()
        }
    }, [])


    const resetLayout = () => {
        if (layoutConfig.columns) {
            setLayoutColumns(JSON.parse(JSON.stringify(layoutConfig.columns)));
        }
    };

    const createDefaultColumn = (): LayoutColumn => {
        return {
            rows: [createDefaultRow()]
        };
    };

    const createDefaultRow = (): LayoutRow => {
        return {
            id: uuidv4(),
            sections: undefined
        };
    };


    const addColumnToTransformRow = (path: ElementPath) => {
        setLayoutColumns(prevLayoutColumns => {
            if (!prevLayoutColumns) return [];
            let newLayoutColumns = JSON.parse(JSON.stringify(prevLayoutColumns)) as LayoutColumn[] | undefined;
            if (!newLayoutColumns) return [];

            let currentLevelCols: LayoutColumn[] | undefined = newLayoutColumns;
            let targetRow: LayoutRow | null = null;

            for (let i = 0; i < path.length; i++) {
                const { colIndex, rowIndex } = path[i];
                const currentColList = (i === 0) ? newLayoutColumns : currentLevelCols;

                if (!currentColList || !currentColList[colIndex] || !currentColList[colIndex].rows || !currentColList[colIndex].rows[rowIndex]) {
                    return prevLayoutColumns;
                }

                if (i === path.length - 1) {
                    targetRow = currentColList[colIndex].rows[rowIndex] as LayoutRow;
                } else {
                    const containerRow = currentColList[colIndex].rows[rowIndex] as LayoutRow;
                    if (!containerRow.columns) return prevLayoutColumns;
                    currentLevelCols = containerRow.columns as LayoutColumn[] | undefined;
                }
            }

            if (targetRow) {
                const originalSections = targetRow.sections || [];
                targetRow.sections = undefined;
                targetRow.columns = [
                    { rows: [{ id: uuidv4(), sections: originalSections }] },
                    createDefaultColumn()
                ] as LayoutColumn[];
            } else {
                return prevLayoutColumns;
            }
            return newLayoutColumns;
        });
    };

    const addRowAdjacentTo = (path: ElementPath) => {
        setLayoutColumns(prevLayoutColumns => {
            if (!prevLayoutColumns) return [];
            let newLayoutColumns = JSON.parse(JSON.stringify(prevLayoutColumns)) as LayoutColumn[] | undefined;
            if (!newLayoutColumns) return [];

            let parentColumnOfTargetRow: LayoutColumn | null = null;
            let targetRowIndexInParentColumn: number = -1;
            let currentLevelOrParentCols: LayoutColumn[] | undefined = newLayoutColumns;

            for (let i = 0; i < path.length; i++) {
                const { colIndex, rowIndex } = path[i];
                if (!currentLevelOrParentCols || !currentLevelOrParentCols[colIndex] || !currentLevelOrParentCols[colIndex].rows) {
                    return prevLayoutColumns;
                }

                if (i === path.length - 1) {
                    parentColumnOfTargetRow = currentLevelOrParentCols[colIndex] as LayoutColumn;
                    targetRowIndexInParentColumn = rowIndex;
                } else {
                    const containerRow = currentLevelOrParentCols[colIndex].rows[rowIndex] as LayoutRow;
                    if (!containerRow.columns) return prevLayoutColumns;
                    currentLevelOrParentCols = containerRow.columns as LayoutColumn[] | undefined;
                }
            }

            if (parentColumnOfTargetRow && parentColumnOfTargetRow.rows && targetRowIndexInParentColumn !== -1) {
                parentColumnOfTargetRow.rows.splice(targetRowIndexInParentColumn + 1, 0, createDefaultRow());
            } else {
                return prevLayoutColumns;
            }
            return newLayoutColumns;
        });
    };

    const activateRow = (path: ElementPath) => {
        console.log("Ativando linha em:", path);
        if (!path || path.length === 0) return;

        setLayoutColumns(prevLayoutColumns => {
            if (!prevLayoutColumns) return [];
            let newLayoutColumns = JSON.parse(JSON.stringify(prevLayoutColumns)) as LayoutColumn[] | undefined;
            if (!newLayoutColumns) return [];

            let currentLevelOrParentCols: LayoutColumn[] | undefined = newLayoutColumns;
            let targetRow: LayoutRow | null = null;

            for (let i = 0; i < path.length; i++) {
                const { colIndex, rowIndex } = path[i];
                if (!currentLevelOrParentCols || !currentLevelOrParentCols[colIndex] || !currentLevelOrParentCols[colIndex].rows) {
                    console.error("Caminho inválido durante a travessia para activateRow", path, i);
                    return prevLayoutColumns; // Retorna estado anterior
                }

                if (i === path.length - 1) {
                    targetRow = currentLevelOrParentCols[colIndex].rows[rowIndex] as LayoutRow;
                } else {
                    const containerRow = currentLevelOrParentCols[colIndex].rows[rowIndex] as LayoutRow;
                    if (!containerRow.columns) {
                        console.error("Caminho inválido para activateRow (estrutura aninhada)", path, i);
                        return prevLayoutColumns;
                    }
                    currentLevelOrParentCols = containerRow.columns as LayoutColumn[] | undefined;
                }
            }

            if (targetRow && targetRow.sections === undefined) { // Só ativa se for undefined
                targetRow.sections = []; // Ativa a linha definindo sections como array vazio
                console.log("Linha ativada com sucesso:", targetRow);
            } else {
                console.warn("Linha alvo não encontrada ou já ativa para activateRow", path, targetRow);
                return prevLayoutColumns; // Retorna estado anterior se não encontrada ou já ativa
            }

            return newLayoutColumns;
        });
    };

    const deactivateRow = (path: ElementPath) => {
        console.log("Desativando linha (removendo conteúdo) em:", path);
        if (!path || path.length === 0) return;

        setLayoutColumns(prevLayoutColumns => {
            if (!prevLayoutColumns) return [];
            let newLayoutColumns = JSON.parse(JSON.stringify(prevLayoutColumns)) as LayoutColumn[] | undefined;
            if (!newLayoutColumns) return [];

            let currentLevelOrParentCols: LayoutColumn[] | undefined = newLayoutColumns;
            let targetRow: LayoutRow | null = null;

            for (let i = 0; i < path.length; i++) {
                const { colIndex, rowIndex } = path[i];
                if (!currentLevelOrParentCols || !currentLevelOrParentCols[colIndex] || !currentLevelOrParentCols[colIndex].rows) {
                    return prevLayoutColumns;
                }

                if (i === path.length - 1) {
                    targetRow = currentLevelOrParentCols[colIndex].rows[rowIndex] as LayoutRow;
                } else {
                    const containerRow = currentLevelOrParentCols[colIndex].rows[rowIndex] as LayoutRow;
                    if (!containerRow.columns) return prevLayoutColumns;
                    currentLevelOrParentCols = containerRow.columns as LayoutColumn[] | undefined;
                }
            }

            if (targetRow && targetRow.sections !== undefined) { // Só desativa se estiver ativa
                targetRow.sections = undefined; // Desativa a linha
                console.log("Linha desativada com sucesso:", targetRow);
            } else {
                console.warn("Linha alvo não encontrada ou já inativa para deactivateRow", path, targetRow);
                return prevLayoutColumns;
            }

            return newLayoutColumns;
        });
    };

    const removeRowAtPath = (path: ElementPath) => {
        setLayoutColumns(prevLayoutColumns => {
            if (!prevLayoutColumns) return [];
            let newLayoutColumns = JSON.parse(JSON.stringify(prevLayoutColumns)) as LayoutColumn[] | undefined;
            if (!newLayoutColumns) return [];

            const recursivelyModifyAndClean = (currentCols: LayoutColumn[] | undefined, currentPathSegmentIndex: number): boolean => {
                if (!currentCols || currentPathSegmentIndex >= path.length) return false;

                const { colIndex, rowIndex } = path[currentPathSegmentIndex];
                if (!currentCols[colIndex] || !currentCols[colIndex].rows || !currentCols[colIndex].rows[rowIndex]) {
                    return false;
                }

                const isLastSegment = currentPathSegmentIndex === path.length - 1;
                const targetColumn = currentCols[colIndex] as LayoutColumn;

                if (isLastSegment) {
                    targetColumn.rows.splice(rowIndex, 1);
                    if (targetColumn.rows.length === 0) {
                        currentCols.splice(colIndex, 1);
                    }
                    return true;
                } else {
                    const nextLevelContainerRow = targetColumn.rows[rowIndex] as LayoutRow;
                    if (!nextLevelContainerRow.columns) return false;

                    const modifiedDeeper = recursivelyModifyAndClean(nextLevelContainerRow.columns, currentPathSegmentIndex + 1);
                    if (modifiedDeeper && nextLevelContainerRow.columns && nextLevelContainerRow.columns.length === 0) {
                        nextLevelContainerRow.sections = [];
                        delete nextLevelContainerRow.columns;
                    }
                    return modifiedDeeper;
                }
            };

            recursivelyModifyAndClean(newLayoutColumns, 0);

            if (newLayoutColumns.length === 0) return [createDefaultColumn()];
            newLayoutColumns.forEach((col: LayoutColumn | undefined) => {
                if (col && col.rows && col.rows.length === 0) {
                    col.rows.push(createDefaultRow());
                }
            });
            return newLayoutColumns;
        });
    };

    const removeParentColumnOfRow = (path: ElementPath) => {
        setLayoutColumns(prevLayoutColumns => {
            if (!prevLayoutColumns) return [];
            let newLayoutColumns = JSON.parse(JSON.stringify(prevLayoutColumns)) as LayoutColumn[] | undefined;
            if (!newLayoutColumns) return [];

            const recursivelyFindAndRemoveColumn = (currentContainerElements: LayoutColumn[] | undefined, currentPathSegmentIndex: number): boolean => {
                if (!currentContainerElements || currentPathSegmentIndex >= path.length) return false;

                const { colIndex: targetColIndexToRemove } = path[currentPathSegmentIndex];
                let actualColumnsList = currentContainerElements;

                if (currentPathSegmentIndex < path.length - 1) {
                    const { colIndex: nextColIdx, rowIndex: nextRowIdx } = path[currentPathSegmentIndex];
                    const containerRow = actualColumnsList[nextColIdx]?.rows?.[nextRowIdx] as LayoutRow | undefined;
                    if (containerRow && containerRow.columns) {
                        const modified = recursivelyFindAndRemoveColumn(containerRow.columns, currentPathSegmentIndex + 1);
                        if (modified) {
                            if (containerRow.columns && containerRow.columns.length === 1) {
                                const lastRemainingCol = containerRow.columns[0] as LayoutColumn;
                                containerRow.sections = lastRemainingCol.rows?.[0]?.sections || [];
                                delete containerRow.columns;
                            } else if (containerRow.columns && containerRow.columns.length === 0) {
                                containerRow.sections = [];
                                delete containerRow.columns;
                            }
                        }
                        return modified;
                    } else { return false; }
                }

                if (actualColumnsList[targetColIndexToRemove]) {
                    actualColumnsList.splice(targetColIndexToRemove, 1);
                    return true;
                } else { return false; }
            };

            recursivelyFindAndRemoveColumn(newLayoutColumns, 0);

            if (newLayoutColumns.length === 0) return [createDefaultColumn()];

            for (let i = 0; i < newLayoutColumns.length; i++) {
                const col = newLayoutColumns[i] as LayoutColumn | undefined;
                if (!col) continue;
                if (col.rows && col.rows.length === 0) {
                    col.rows.push(createDefaultRow());
                } else if (col.rows) {
                    for (let j = 0; j < col.rows.length; j++) {
                        const row = col.rows[j] as LayoutRow | undefined;
                        if (!row || !row.columns || row.columns.length !== 0) continue;
                        row.sections = [];
                        delete row.columns;
                    }
                }
            }

            if (path.length > 1) {
                let parentRowContainerLevel: LayoutColumn[] | undefined = newLayoutColumns;
                let targetParentRowContainer: LayoutRow | null = null;

                for (let i = 0; i < path.length - 1; i++) {
                    const { colIndex, rowIndex } = path[i];
                    const currentLevel = (i === 0) ? newLayoutColumns : parentRowContainerLevel;
                    if (!currentLevel || !currentLevel[colIndex] || !currentLevel[colIndex].rows || !currentLevel[colIndex].rows[rowIndex]) {
                        targetParentRowContainer = null; break;
                    }
                    if (i === path.length - 2) {
                        targetParentRowContainer = currentLevel[colIndex].rows[rowIndex] as LayoutRow;
                    } else {
                        const nextContainer = currentLevel[colIndex].rows[rowIndex] as LayoutRow;
                        if (!nextContainer.columns) { targetParentRowContainer = null; break; }
                        parentRowContainerLevel = nextContainer.columns as LayoutColumn[] | undefined;
                    }
                }
                if (targetParentRowContainer?.columns?.length === 1) {
                    const lastCol = targetParentRowContainer.columns[0] as LayoutColumn;
                    targetParentRowContainer.sections = lastCol.rows?.[0]?.sections || [];
                    delete targetParentRowContainer.columns;
                }
            }
            return newLayoutColumns;
        });
    };

    const renderColumns = (
        columnsToRender: LayoutColumn[] | undefined,
        pathPrefixForContainedColumns: ElementPath,
        depth: number = 0,
        sectionStyles: TemplateLayoutConfig["sectionStyles"]
    ) => {
        if (!columnsToRender) return null;
        return columnsToRender.map((columnData, colIndex) => {
            const column = columnData as LayoutColumn | undefined;
            if (!column) return null;
            const columnKey = `col-${depth}-${colIndex}-${pathPrefixForContainedColumns.map(p => `${p.colIndex}-${p.rowIndex}`).join('_') || 'root'}`;
            return (
                <React.Fragment key={columnKey}>
                    {colIndex > 0 && <CustomHandle direction='vertical' />}
                    <ResizablePanel data-swapy-slot={`col-${colIndex}`} className='panel-line' key={colIndex} order={colIndex} minSize={1} maxSize={100} defaultSize={40}  >
                        <div className="item item-b" data-swapy-item={`col-${colIndex}`}>
                            <div className="handle" data-swapy-handle>OI</div>
                            <ResizablePanelGroup direction="vertical" >
                                {column.rows?.map((rowData, rowIndex) => {
                                    const row = rowData as LayoutRow;
                                    if (!row) return null;
                                    const currentRowPath: ElementPath = [...pathPrefixForContainedColumns, { colIndex, rowIndex }];
                                    const rowKey = `row-${depth}-${colIndex}-${rowIndex}-${currentRowPath.map(p => `${p.colIndex}-${p.rowIndex}`).join('_')}`;

                                    if (row.columns) {
                                        return (
                                            <React.Fragment key={rowKey}>
                                                {rowIndex > 0 && <CustomHandle direction='horizontal' />}
                                                <ResizablePanel data-swapy-slot={`row-${rowIndex}`} className='panel-line' key={rowIndex} order={rowIndex} minSize={0} maxSize={100} defaultSize={40}>
                                                    <div className="item item-b" data-swapy-item={`row-${rowIndex}`}>
                                                        <div className="handle" data-swapy-handle>OI</div>
                                                        <ResizablePanelGroup direction="horizontal">
                                                            {renderColumns(row.columns, currentRowPath, depth + 1, sectionStyles)}
                                                        </ResizablePanelGroup>
                                                    </div>
                                                </ResizablePanel>
                                            </React.Fragment>
                                        );
                                    }

                                    const sectionId = row.id;
                                    return (
                                        <React.Fragment key={rowKey}>
                                            {rowIndex > 0 && <CustomHandle direction='horizontal' />}
                                            <div className="item item-b" data-swapy-item={`row-${rowIndex}`}>
                                                <div className="handle" data-swapy-handle>OI</div>
                                                <ColumnPanel
                                                    data-swapy-slot={`row-${rowIndex}`}
                                                    key={`panel-${rowKey}`}
                                                    order={rowIndex}
                                                    elementPath={currentRowPath}
                                                    rowSections={row.sections}
                                                    activateRowAtPath={activateRow}
                                                    deactivateRowAtPath={deactivateRow}
                                                    isOpen={isMenuOpen[sectionId]}
                                                    onOpenChange={(value) => setIsMenuOpen({ [sectionId]: value })}
                                                    onAddRowAtPath={addRowAdjacentTo}
                                                    onRemoveRowAtPath={removeRowAtPath}
                                                    onAddColumnToRowAtPath={addColumnToTransformRow}
                                                    onRemoveColumnContainingRowPath={removeParentColumnOfRow}
                                                    onResetLayout={resetLayout}
                                                    initialStyle={row.options}
                                                    resumeData={resumeData}
                                                    sectionStyles={sectionStyles}
                                                />
                                            </div>
                                        </React.Fragment>
                                    );
                                })}

                            </ResizablePanelGroup>
                        </div>
                    </ResizablePanel>
                </React.Fragment>
            );
        });
    }


    if (!layoutConfig) {
        return <div>Erro de configuração de layout.</div>;
    }



    return (
        <div className="flex flex-1 w-full p-[10mm] h-[297mm] box-border">
            <div className="container" ref={containerRef}>
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
                    </div>
                </div>
                <div className="slot bottom" data-swapy-slot="d">
                    <div className="item item-d" data-swapy-item="d">
                        <div>D</div>
                    </div>
                </div>
            </div>
            <div ref={containerRef}>

            <ResizablePanelGroup direction="horizontal" className='w-full container' >
                {renderColumns(layoutColumns, [], 0, layoutConfig.sectionStyles)}
            </ResizablePanelGroup>
            </div>

        </div>
    );
};

const FloatingMenu = ({ watchedValues, handleControllerChange, onOpenChange, isMenuOpen }: { watchedValues: Options, handleControllerChange: (values: Options) => void, onOpenChange: (isOpen: boolean) => void, isMenuOpen: boolean }) => {


    return (
        <div>
            <div
                onClick={() => onOpenChange(!isMenuOpen)}
                className='w-12 h-12 z-50 rounded-full flex items-center justify-center translate-y-1/2 absolute bottom-1/2 -left-10 bg-background/95 backdrop-blur-sm border border-border/40  shadow-lg transition-all  duration-200 ease-in-out'>
                {isMenuOpen && <X size={18} />}
            </div>
            <div className={cn(isMenuOpen ? "animate-fade-left  animate-ease-out block animate-duration-200" : "hidden", " bg-background p-5 shadow-lg rounded-lg h-[684px] w-[400px] max-w-[400px]", " ")}>

                <ColumnContoller
                    value={watchedValues}
                    onChange={(values) => {
                        handleControllerChange(values);
                    }}
                />
            </div>
        </div>
    )
}

const CustomHandle = ({ direction = 'horizontal' }: { direction?: 'horizontal' | 'vertical' }) => {
    return (
        <ResizableHandle className={`custom-handle  rounded-full ${direction === 'horizontal' ? 'w-full min-h-[1px] ' : 'min-w-[1px] max-w-[1px] h-full'}`} />
    )
}

const ColumnPanel = ({
    isOpen,
    onOpenChange,
    order,
    elementPath,
    rowSections,
    resumeData,
    activateRowAtPath,
    deactivateRowAtPath,
    onAddRowAtPath,
    onRemoveRowAtPath,
    onAddColumnToRowAtPath,
    onRemoveColumnContainingRowPath,
    onResetLayout,
    initialStyle,
    sectionStyles
}: {
    isOpen: boolean,
    onOpenChange: (isOpen: boolean) => void,
    order: number,
    elementPath: ElementPath,
    rowSections: ResumeSectionKey[] | undefined,
    activateRowAtPath: (path: ElementPath) => void,
    deactivateRowAtPath: (path: ElementPath) => void,
    onAddRowAtPath: (path: ElementPath) => void,
    onRemoveRowAtPath: (path: ElementPath) => void,
    onAddColumnToRowAtPath: (path: ElementPath) => void,
    onRemoveColumnContainingRowPath: (path: ElementPath) => void,
    onResetLayout: () => void,
    resumeData: CustomResumeData,
    initialStyle?: Options,
    sectionStyles?: TemplateLayoutConfig["sectionStyles"]
}) => {




    const ensureStringPosition = (position: any): string => {
        if (position === undefined || position === null) return "center center";
        return String(position);
    };

    const form = useForm<Options>({
        defaultValues: {
            bgColor: initialStyle?.bgColor || "transparent",
            bgImage: initialStyle?.bgImage || "",
            imagePosition: initialStyle?.imagePosition || "center center",
            borderRadius: {
                topLeft: initialStyle?.borderRadius?.topLeft || 0,
                topRight: initialStyle?.borderRadius?.topRight || 0,
                bottomLeft: initialStyle?.borderRadius?.bottomLeft || 0,
                bottomRight: initialStyle?.borderRadius?.bottomRight || 0
            },
            // Adicionando os defaults para as propriedades que não estavam sendo aplicadas
            padding: initialStyle?.padding || "",
            margin: initialStyle?.margin || "",
            borderWidth: {
                top: initialStyle?.borderWidth?.top || 0,
                right: initialStyle?.borderWidth?.right || 0,
                bottom: initialStyle?.borderWidth?.bottom || 0,
                left: initialStyle?.borderWidth?.left || 0
            },
            borderColor: initialStyle?.borderColor || "#e5e7eb", // Um padrão para cor da borda
            shadow: initialStyle?.shadow || "",
        }
    });


    const watchedValues = form.watch();

    const handleControllerChange = (values: Options) => {
        console.log("ColumnPanel: handleControllerChange recebeu: ", values);
        form.setValue('gap', values.gap);
        form.setValue('bgColor', values.bgColor);
        form.setValue('bgImage', values.bgImage);
        form.setValue('imagePosition', values.imagePosition);
        form.setValue('borderRadius', values.borderRadius);

        // Garantindo que todas as propriedades do controller atualizem o form
        form.setValue('padding', values.padding);
        form.setValue('margin', values.margin);
        form.setValue('borderWidth', values.borderWidth);
        form.setValue('borderColor', values.borderColor);
        form.setValue('shadow', values.shadow);
    }


    const renderEditorContent = (sectionKeys: ResumeSectionKey[], values: CustomResumeData, style: TemplateLayoutConfig["sectionStyles"]) => {
        if (sectionKeys.length === 0) return <Editor initialContent={convertToBlock("personalInfo", values, style)} />;
        return sectionKeys.map((sectionKey) => (
            <div key={sectionKey}><Editor initialContent={convertToBlock(sectionKey, values, style)} /></div>
        ));
    };

    const isInactiveRow = rowSections === undefined;

    useEffect(() => {
        const panelLines = document.querySelectorAll('.panel-line');

        panelLines.forEach(panelLine => {
            const previous = panelLine.previousElementSibling;
            const next = panelLine.nextElementSibling;

            const handles: HTMLElement[] = [];

            if (previous?.classList.contains('custom-handle')) {
                handles.push(previous);
            }

            if (next?.classList.contains('custom-handle')) {
                handles.push(next);
            }

            // Inicializa os estados
            handles.forEach(handle => {
                if (handle.getAttribute('data-resize-handle-state') !== 'drag') {
                    handle.setAttribute('data-resize-handle-state', 'inactive');
                }
            });

            panelLine.addEventListener('mouseenter', () => {
                handles.forEach(handle => {
                    if (handle.getAttribute('data-resize-handle-state') !== 'drag') {
                        handle.setAttribute('data-resize-handle-state', 'hover');
                    }
                });
            });

            panelLine.addEventListener('mouseleave', () => {
                handles.forEach(handle => {
                    const isDragging = handle.getAttribute('data-resize-handle-state') === 'drag';
                    const isHovered = handle.matches(':hover');

                    if (!isDragging && !isHovered) {
                        handle.setAttribute('data-resize-handle-state', 'inactive');
                    }
                });
            });
        });
    }, []);



    return (
        <>
            {isOpen &&
                createPortal(
                    <Form {...form} className='absolute top-[calc(50%+56px)] right-10 transform -translate-y-1/2'>
                        <FloatingMenu
                            watchedValues={watchedValues}
                            handleControllerChange={handleControllerChange}
                            onOpenChange={onOpenChange} isMenuOpen={isOpen} />
                    </Form>
                    ,
                    document.body
                )
            }
            <ContextMenu>
                <ContextMenuTrigger asChild className="h-auto w-auto text-sm accent-custom" // Adicionada classe accent-custom
                    style={{
                        backgroundColor: form.getValues().bgColor || "transparent",
                        borderTopLeftRadius: form.getValues().borderRadius?.topLeft ? `${form.getValues()?.borderRadius?.topLeft}px` : '0px',
                        borderTopRightRadius: form.getValues().borderRadius?.topRight ? `${form.getValues()?.borderRadius?.topRight}px` : '0px',
                        borderBottomLeftRadius: form.getValues().borderRadius?.bottomLeft ? `${form.getValues()?.borderRadius?.bottomLeft}px` : '0px',
                        borderBottomRightRadius: form.getValues().borderRadius?.bottomRight ? `${form.getValues()?.borderRadius?.bottomRight}px` : '0px',

                        borderTopWidth: form.getValues().borderWidth?.top ? `${form.getValues()?.borderWidth?.top}px` : '0px',
                        borderRightWidth: form.getValues().borderWidth?.right ? `${form.getValues()?.borderWidth?.right}px` : '0px',
                        borderBottomWidth: form.getValues().borderWidth?.bottom ? `${form.getValues()?.borderWidth?.bottom}px` : '0px',
                        borderLeftWidth: form.getValues().borderWidth?.left ? `${form.getValues()?.borderWidth?.left}px` : '0px',

                        backgroundImage: form.getValues().bgImage ? `url("${form.getValues().bgImage}")` : 'none',
                        backgroundPosition: ensureStringPosition(form.getValues().imagePosition) || 'center',

                        // Aplicando os valores do formulário para os estilos
                        padding: form.getValues().padding || undefined, // Usar undefined para permitir que o CSS do template funcione se vazio
                        margin: form.getValues().margin || undefined,

                        borderColor: form.getValues().borderColor || "hsla(0, 0%, 0%, 0.1)",
                        borderStyle: "solid",
                        boxShadow: form.getValues().shadow || undefined,



                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundBlendMode: 'multiply',
                    } as React.CSSProperties}
                >
                    <ResizablePanel // Conteúdo da linha
                        order={order}
                        minSize={0}
                        maxSize={100}
                        defaultSize={isInactiveRow ? 2 : 10}
                        className={cn("panel-line",
                            'border border-transparent hover:border-primary/20', // Borda de hover do ResizablePanel
                            isInactiveRow && 'bg-muted/30 hover:bg-muted/50'
                        )}
                    >
                        {rowSections !== undefined
                            ? renderEditorContent(rowSections, resumeData, sectionStyles || {})
                            : <div className="flex items-center justify-center h-full text-muted-foreground text-xs italic">Linha Vazia</div>
                        }
                    </ResizablePanel>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    {/* ... itens do menu de contexto ... */}
                    {isInactiveRow ? (
                        <ContextMenuItem onClick={() => activateRowAtPath(elementPath)}>
                            <Plus size={18} className='mr-2' />Adicionar Texto
                        </ContextMenuItem>
                    ) : (
                        <ContextMenuItem onClick={() => deactivateRowAtPath(elementPath)}>
                            <X size={18} className='mr-2 text-destructive' />Remover Conteúdo
                        </ContextMenuItem>
                    )}

                    <ContextMenuItem onClick={() => onAddRowAtPath(elementPath)}><Plus size={18} className='mr-2' />Adicionar Linha Abaixo</ContextMenuItem>
                    <ContextMenuItem onClick={() => onAddColumnToRowAtPath(elementPath)}><Plus size={18} className='mr-2' />Adicionar Coluna (Transformar)</ContextMenuItem>
                    <ContextMenuItem onClick={() => onRemoveRowAtPath(elementPath)}><Minus size={18} className='mr-2' />Remover Esta Linha</ContextMenuItem>
                    <ContextMenuItem onClick={() => onRemoveColumnContainingRowPath(elementPath)}><Minus size={18} className='mr-2' />Remover Coluna Pai</ContextMenuItem>

                    <ContextMenuItem onClick={() => onOpenChange(!isOpen)}><Settings size={18} className='mr-2' />Configurações</ContextMenuItem>
                    <ContextMenuItem onClick={onResetLayout}><RotateCcw size={18} className='mr-2' />Resetar Layout</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    )
}

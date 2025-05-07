import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller, Form } from 'react-hook-form';
import { CustomResumeData, ResumeSectionKey } from '@/types/resume-data';
import { TemplateLayoutConfig } from '@/components/editor/initial';
import { Editor } from '@/components/editor/DynamicEditor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ColumnContoller, IValues, IValues as ProfileFeatureValues } from './controllers/ColumnContoller';
import { ChevronRight, Minus, Plus, Settings, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { v4 as uuidv4 } from 'uuid';

// Tipos de Caminho para identificar elementos no layout aninhado
type PathComponent = { colIndex: number; rowIndex: number };
type ElementPath = PathComponent[];

// Aliases de tipo locais para clareza, derivados de TemplateLayoutConfig
type LayoutColumn = NonNullable<TemplateLayoutConfig['columns']>[number];
type LayoutRow = NonNullable<LayoutColumn['rows']>[number];

interface ProfileFeatureLayoutProps {
    layoutConfig: TemplateLayoutConfig;
    resumeData: CustomResumeData;
    isEditable: boolean;
    onSectionContentChange: (sectionKey: ResumeSectionKey, newContent: string) => void;
}

export const ProfileFeatureLayout: React.FC<ProfileFeatureLayoutProps> = ({
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
            sections: []
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

    const removeRowAtPath = (path: ElementPath) => {
        setLayoutColumns(prevLayoutColumns => {
            if (!prevLayoutColumns) return [];
            let newLayoutColumns = JSON.parse(JSON.stringify(prevLayoutColumns)) as LayoutColumn[] | undefined;
            if (!newLayoutColumns) return [];

            const recursivelyModifyAndClean = (currentCols: LayoutColumn[] | undefined, currentPathSegmentIndex: number): boolean => {
                if (!currentCols || currentPathSegmentIndex >= path.length ) return false; 

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

                if (currentPathSegmentIndex < path.length -1) {
                    const {colIndex: nextColIdx, rowIndex: nextRowIdx} = path[currentPathSegmentIndex];
                    const containerRow = actualColumnsList[nextColIdx]?.rows?.[nextRowIdx] as LayoutRow | undefined;
                    if(containerRow && containerRow.columns) { 
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
        depth: number = 0 
    ) => {
        if (!columnsToRender) return null;
        return columnsToRender.map((columnData, colIndex) => {
            const column = columnData as LayoutColumn | undefined;
            if (!column) return null;
            const columnKey = `col-${depth}-${colIndex}-${pathPrefixForContainedColumns.map(p => `${p.colIndex}-${p.rowIndex}`).join('_') || 'root'}`;
            return (
                <React.Fragment key={columnKey}>
                    {colIndex > 0 && <CustomHandle direction='vertical' />}
                    <ResizablePanel key={colIndex} order={colIndex} minSize={1} maxSize={100} defaultSize={40} >
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
                                            <ContextMenu>
                                                <ContextMenuTrigger asChild>
                                                    <ResizablePanel key={rowIndex} order={rowIndex} minSize={0} maxSize={100} defaultSize={40}>
                                                        <ResizablePanelGroup direction="horizontal">
                                                            {renderColumns(row.columns, currentRowPath, depth + 1)}
                                                        </ResizablePanelGroup>
                                                    </ResizablePanel>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent>
                                                    <ContextMenuItem onClick={() => { 
                                                        console.log("Ação: Adicionar coluna à linha-container em:", currentRowPath); 
                                                        // TODO: Implementar addColumnToRowContainer(currentRowPath);
                                                    }}>
                                                        <Plus size={18} className='mr-2' />Adicionar Coluna (nesta linha)
                                                    </ContextMenuItem>
                                                    <ContextMenuItem onClick={() => { 
                                                        console.log("Ação: Remover linha-container (e seu conteúdo) em:", currentRowPath); 
                                                        // TODO: Implementar removeRowContainer(currentRowPath);
                                                    }}>
                                                        <Minus size={18} className='mr-2' />Remover Linha (e conteúdo)
                                                    </ContextMenuItem>
                                                    <ContextMenuItem onClick={resetLayout}>
                                                        <RotateCcw size={18} className='mr-2' />Resetar Layout
                                                    </ContextMenuItem>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        </React.Fragment>
                                    );
                                }
                                
                                const sectionId = row.id;
                                return (
                                    <React.Fragment key={rowKey}>
                                        {rowIndex > 0 && <CustomHandle direction='horizontal' />}
                                        <ColumnPanel 
                                            key={`panel-${rowKey}`}
                                            order={rowIndex} 
                                            elementPath={currentRowPath} 
                                            isOpen={isMenuOpen[sectionId]} 
                                            onOpenChange={(value) => setIsMenuOpen({ [sectionId]: value })}
                                            onAddRowAtPath={addRowAdjacentTo}
                                            onRemoveRowAtPath={removeRowAtPath}
                                            onAddColumnToRowAtPath={addColumnToTransformRow}
                                            onRemoveColumnContainingRowPath={removeParentColumnOfRow}
                                            onResetLayout={resetLayout}
                                        >
                                            {renderSections(row.sections || [])}
                                        </ColumnPanel>
                                    </React.Fragment>
                                );
                            })}
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </React.Fragment>
            );
        });
    }


    if (layoutConfig.type !== 'profileFeatureLayout') {
        return <div>Erro de configuração de layout.</div>;
    }

    const renderSections = (sectionKeys: ResumeSectionKey[] | undefined) => {
        if (!sectionKeys || sectionKeys.length === 0) return <Editor />;
        return sectionKeys.map((sectionKey) => (
            <div key={sectionKey}><Editor /></div>
        ));
    };

    return (
        <div className="flex flex-1 w-full p-[10mm] h-[297mm] box-border">
            <ResizablePanelGroup direction="horizontal" className='w-full'>
                {renderColumns(layoutColumns, [])}
            </ResizablePanelGroup>
        </div>
    );
};

const FloatingMenu = ({ watchedValues, handleControllerChange, onOpenChange, isMenuOpen }: { watchedValues: ProfileFeatureValues, handleControllerChange: (values: ProfileFeatureValues) => void, onOpenChange: (isOpen: boolean) => void, isMenuOpen: boolean }) => {
    console.log("FloatingMenu renderizado com watchedValues:", {
        completo: watchedValues,
        bgImage: watchedValues.bgImage,
        definido: watchedValues.bgImage !== undefined
    });

    return (
        <div className='fixed top-[calc(50%+56px)] right-10 transform -translate-y-1/2 z-50'>
            <div
                onClick={() => onOpenChange(!isMenuOpen)}
                className='w-12 h-12 z-50 rounded-full flex items-center justify-center translate-y-1/2 absolute bottom-1/2 -left-10 bg-background/95 backdrop-blur-sm border border-border/40  shadow-lg transition-all  duration-200 ease-in-out'>
                {isMenuOpen && <X size={18} />}
            </div>
            <div className={cn(isMenuOpen ? "animate-fade-left  animate-ease-out block animate-duration-200" : "hidden", " bg-background p-5 shadow-lg rounded-lg h-[684px] w-[400px] max-w-[400px]", " ")}>
                <ColumnContoller
                    value={watchedValues}
                    onChange={(values) => {
                        console.log("FloatingMenu recebeu values do ColumnContoller:", {
                            completo: values,
                            bgImage: values.bgImage,
                            definido: values.bgImage !== undefined
                        });
                        handleControllerChange(values);
                    }}
                />
            </div>
        </div>
    )
}

const CustomHandle = ({ direction = 'horizontal' }: { direction?: 'horizontal' | 'vertical' }) => {
    return (
        <ResizableHandle className={` bg-border/50 opacity-20 active:opacity-100 hover:opacity-100 active:bg-border/60 hover:bg-border/60 rounded-full ${direction === 'horizontal' ? 'w-full min-h-[4px] ' : 'min-w-[4px] max-w-[4px] h-full'}`} />
    )
}

const ColumnPanel = ({ 
    children, 
    isOpen, 
    onOpenChange, 
    order,
    elementPath,
    onAddRowAtPath,
    onRemoveRowAtPath,
    onAddColumnToRowAtPath,
    onRemoveColumnContainingRowPath,
    onResetLayout
}: { 
    children: React.ReactNode, 
    isOpen: boolean, 
    onOpenChange: (isOpen: boolean) => void, 
    order: number,
    elementPath: ElementPath,
    onAddRowAtPath: (path: ElementPath) => void,
    onRemoveRowAtPath: (path: ElementPath) => void,
    onAddColumnToRowAtPath: (path: ElementPath) => void,
    onRemoveColumnContainingRowPath: (path: ElementPath) => void,
    onResetLayout: () => void
}) => {

    const form = useForm<ProfileFeatureValues>({
        defaultValues: {
            gap: 10,
            borderRadius: {
                topLeft: 0,
                topRight: 0,
                bottomLeft: 0,
                bottomRight: 0
            },
            bgImage: "",
            barColor: "transparent",
            bgPosition: "center center"
        }
    });

    console.log("ColumnPanel - Valores iniciais:", form.getValues());

    const watchedValues = form.watch();

    const handleControllerChange = (values: ProfileFeatureValues) => {
        form.setValue('gap', values.gap);
        form.setValue('borderRadius', values.borderRadius);
        form.setValue('bgImage', values.bgImage);
        form.setValue('barColor', values.barColor);
        form.setValue('bgPosition', values.bgPosition);
    }

    useEffect(() => {
        console.log("ColumnPanel montado com valores:", form.getValues());
    }, []);

    return (
        <>
            {isOpen && <Form {...form}><FloatingMenu watchedValues={watchedValues} handleControllerChange={handleControllerChange} onOpenChange={onOpenChange} isMenuOpen={isOpen} /> </Form>}

            <ContextMenu>
                <ContextMenuTrigger asChild className="h-auto w-auto text-sm"
                    style={{
                        backgroundColor: form.getValues().barColor || "transparent",
                        borderEndEndRadius: form.getValues().borderRadius?.bottomRight ? `${form.getValues().borderRadius.bottomRight}px` : '0px',
                        borderEndStartRadius: form.getValues().borderRadius?.bottomLeft ? `${form.getValues().borderRadius.bottomLeft}px` : '0px',
                        borderStartEndRadius: form.getValues().borderRadius?.topRight ? `${form.getValues().borderRadius.topRight}px` : '0px',
                        borderStartStartRadius: form.getValues().borderRadius?.topLeft ? `${form.getValues().borderRadius.topLeft}px` : '0px',
                        backgroundImage: form.getValues().bgImage ? `url("${form.getValues().bgImage}")` : 'none',
                        backgroundPosition: form.getValues().bgPosition || 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundBlendMode: 'multiply',
                    }}
                >
                    <ResizablePanel
                        order={order}
                        minSize={0}
                        maxSize={100}
                        defaultSize={4}
                        className='border border-transparent hover:border-primary/20'
                    >
                        {children}
                    </ResizablePanel>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => onAddRowAtPath(elementPath)}><Plus size={18} className='mr-2' />Adicionar Linha</ContextMenuItem>
                    <ContextMenuItem onClick={() => onRemoveRowAtPath(elementPath)}><Minus size={18} className='mr-2' />Remover Linha</ContextMenuItem>
                    <ContextMenuItem onClick={() => onAddColumnToRowAtPath(elementPath)}><Plus size={18} className='mr-2' />Adicionar Coluna</ContextMenuItem>
                    <ContextMenuItem onClick={() => onRemoveColumnContainingRowPath(elementPath)}><Minus size={18} className='mr-2' />Remover Coluna</ContextMenuItem>
                    <ContextMenuItem onClick={() => onOpenChange(!isOpen)}><Settings size={18} className='mr-2' />Configurações da coluna</ContextMenuItem>
                    <ContextMenuItem onClick={onResetLayout}><RotateCcw size={18} className='mr-2' />Resetar Layout</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

        </>
    )
}

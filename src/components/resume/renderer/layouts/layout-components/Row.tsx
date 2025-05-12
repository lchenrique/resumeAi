import { cn } from "@/lib/utils";
import Split, { SplitProps } from '@uiw/react-split';

export const Row = ({
    children,
    mode = 'horizontal',
    visible = true,
    className,
    onDragging,
    width,
    height,
}: {
    children?: React.ReactNode
    mode?: SplitProps['mode']
    visible?: boolean
    className?: string
    onDragging?: (preSize: number, nextSize: number, paneNumber: number) => void
    width?: string
    height?: string
}) => {
    return (
        <Split mode={mode}
            visible={visible}
            onDragging={onDragging}
            onDragEnd={onDragging}
            style={{ height: height || '100%' }}
            renderBar={({ onMouseDown, ...props }) => {
                return (
                    <div {...props} style={{ boxShadow: 'none', background: 'transparent' }}>
                        <div onMouseDown={onMouseDown} className="bg-primary/20 opacity-10 hover:opacity-100 duration-300" style={{ boxShadow: 'none' }} />
                    </div>
                );
            }}
            className={cn("flex  w-full bg-red-400  gap-1", className)}>
            {children}
        </Split >
    )
}

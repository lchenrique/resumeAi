import Split from "@uiw/react-split"

export const LayoutContainer = ({
    children,
    containerRef,
}: {
    children: React.ReactNode
    containerRef: React.RefObject<HTMLDivElement>
}) => {
    return <div className="flex flex-col gap-1 h-[29.7cm] w-full"  ref={containerRef}>
        <Split
         renderBar={({ onMouseDown, ...props }) => {
            return (
                <div {...props} style={{ boxShadow: 'none', background: 'transparent' }}>
                    <div onMouseDown={onMouseDown} className="bg-primary/20 opacity-10 hover:opacity-100 duration-300" style={{ boxShadow: 'none' }} />
                </div>
            );
        }}
        
        style={{ borderRadius: 3,}}  className="w-full gap-0" >
            {children}
        </Split>
    </div>
}

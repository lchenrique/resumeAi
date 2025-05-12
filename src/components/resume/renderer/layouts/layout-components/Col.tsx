import Split from "@uiw/react-split"

export const Col = ({
    children,
    slot,
    item,
    handle,
    height,
    width,
}: {
    children: React.ReactNode
    slot: string
    item: string
    handle: string
    height?: string
    width?: string
}) => {
    return  <div 
    className={`slot ${slot} h-full  w-full bg-blue-500`} 
    style={{
        height: height || '100%',
        width: width || '100%',
    }}
    data-swapy-slot={slot}>
            <div className={`item ${item}`} data-swapy-item={item}>
                <div className={`handle ${handle}`} data-swapy-handle></div>
                {children}
            </div>
        </div>
}


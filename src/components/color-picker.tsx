import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const ColorPicker = ({ 
    onSelectColor, 
    onCloseCallback, 
    className 
}: { 
    onSelectColor: (color: string) => void,
    onCloseCallback?: () => void, 
    className?: string 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [color, setColor] = useState("#000000");

    const handleOpenChange = (open: boolean) => {
        // setIsOpen(open);
        if (!open && onCloseCallback) {
            onCloseCallback();
        }
    };

    useEffect(() => {
        onSelectColor(color)
    }, [color])

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild onClick={() => setIsOpen(true)}>
                <Button variant="outline"  className={cn("size-[30px] px-2 py-0 mr-0.5", className)}>
                    <Palette size={16}  />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit" side="bottom" align="center">
                <HexColorPicker color={color} onChange={setColor} onMouseUp={() => {
                    onSelectColor(color)
                }} />
            </PopoverContent>
        </Popover>
    );
};

export { ColorPicker };
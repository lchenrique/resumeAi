import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const ColorPicker = ({ color, setColor, className }: { color: string, setColor: (color: string) => void , className?: string }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline"  className={cn("size-[30px] px-2 py-0 mr-0.5", className)}>
                    <Palette size={16}  />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit" side="bottom" align="center">
                <HexColorPicker color={color} onChange={setColor} />
            </PopoverContent>
        </Popover>
    );
};

export { ColorPicker };
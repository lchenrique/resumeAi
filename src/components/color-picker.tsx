import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Palette } from "lucide-react";

const ColorPicker = ({ color, setColor }: { color: string, setColor: (color: string) => void }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline"  className="size-[30px] px-2 py-0 mr-.5">
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
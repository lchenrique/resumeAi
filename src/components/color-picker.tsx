import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Palette } from "lucide-react";
const ColorPicker = ({ color, setColor }: { color: string, setColor: (color: string) => void }) => {
    return <Popover>
        <PopoverTrigger>
            <Button variant="ghost">
                <Palette />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit " side="bottom" align="end">
            <HexColorPicker color={color} onChange={setColor} />
        </PopoverContent>
    </Popover>
};

export { ColorPicker };
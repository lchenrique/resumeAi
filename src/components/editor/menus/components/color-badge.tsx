"use client";

import React, { ComponentRef, useEffect } from "react";
import { Editor } from "@tiptap/core";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

interface ColorButtonProps {
    editor: Editor;
    onOpenChange?: (open: boolean) => void;
}

const DEFAULT_COLOR = "#000000";

export const ColorBadge = React.forwardRef<ComponentRef<typeof PopoverContent>, ColorButtonProps>(({ editor, onOpenChange }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedColor, setSelectedColor] = React.useState(editor.getAttributes('textStyle').color || DEFAULT_COLOR);

    useEffect(() => {
        if (isOpen) {
            const currentEditorColor = editor.getAttributes('textStyle').color || DEFAULT_COLOR;
            setSelectedColor(currentEditorColor);
        }
    }, [isOpen, editor, editor.state.selection]);

    const applyColorAndClose = () => {
        editor.chain().focus().updateBadgeColor(selectedColor).run();
        handleCombinedOpenChange(false);
    };

    const handleCombinedOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (onOpenChange) {
            onOpenChange(open);
        }
    };

    const title = "Cor do Badge";

    const canSetColor = editor.schema.marks.textStyle && editor.can().setColor?.(DEFAULT_COLOR);

    if (!editor || !editor.isEditable || !canSetColor) {
        return null;
    }

    return (
        <Popover open={isOpen} onOpenChange={handleCombinedOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title={title}>
                    <Palette className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent ref={ref} className="w-auto p-2 space-y-2" sideOffset={5}>
                <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                <Button variant="outline" onClick={applyColorAndClose} size="sm" className="w-full">
                    Aplicar
                </Button>
            </PopoverContent>
        </Popover>
    );
});

ColorBadge.displayName = "ColorBadge";

export default ColorBadge; 
"use client"
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, Unlock, AlignStartHorizontal, AlignStartVertical, AlignEndHorizontal, AlignEndVertical } from "lucide-react";
import { BorderSideValues } from "@/components/editor/initial";
import { ColorPicker } from "@/components/color-picker";

export type BorderSide = 'top' | 'right' | 'bottom' | 'left';



export interface BorderControllerProps {
    value: BorderSideValues;
    onChange: (value: BorderSideValues) => void;

}

export const BorderController = forwardRef<HTMLDivElement, BorderControllerProps>(({
    value,
    onChange,
}, ref) => {
    const [locked, setLocked] = useState(false);



    const borderSideControls: { side: BorderSide; label: string; icon: React.ReactNode }[] = [
        { side: 'top', label: "Superior", icon: <BorderSideTop /> },
        { side: 'right', label: "Direita", icon: <BorderSideRight /> },
        { side: 'bottom', label: "Inferior", icon: <BorderSideBottom /> },
        { side: 'left', label: "Esquerda", icon: <BorderSideLeft /> },
    ];

    const handleChange = (side: BorderSide, inputValue: number) => {
        if (locked) {
            const newBorderRadius: BorderSideValues = {
                top: inputValue,
                right: inputValue,
                bottom: inputValue,
                left: inputValue,
            };
            onChange(newBorderRadius);
        } else {
            const newBorderRadius = {
                ...value,
                [side]: inputValue,
            };
            onChange(newBorderRadius);
        }

    }

    const handleLock = () => {
        setLocked(!locked);
    }

    return (
        <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
            <div ref={ref} className="h-full w-full overflow-y-auto p-1">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-medium text-muted-foreground"> Borda</h3>
                    <Button variant="ghost" size="icon" className="w-7 h-7" title={locked ? "Desbloquear cantos" : "Bloquear cantos"} onClick={handleLock}>
                        {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center justify-items-center">
                    {borderSideControls.map((control, index) => (
                        <div key={control.side} className="flex  items-center gap-2">
                            {index % 2 === 1 && <Input
                                disabled={locked}
                                value={String(value[control.side])}
                                onChange={(e) => handleChange(control.side, Number(e.target.value))}
                                type="number"
                                min={0}
                                max={100} className="w-14 h-7 text-xs" />}
                            <div className="w-6 h-6 border border-border rounded-md flex items-center justify-center">
                                {control.icon}
                            </div>
                            {index % 2 === 0 && <Input
                                disabled={(index > 0 && locked)}
                                onChange={(e) => handleChange(control.side, Number(e.target.value))}
                                type="number"
                                min={0}
                                max={100}
                                className="w-14 h-7 text-xs"
                                value={String(value[control.side])}
                            />}
                        </div>
                    ))}
                   
                </div>
            </div>
        </div>

    );
});

BorderController.displayName = "BorderController";



const BorderSideIcon = ({ className }: { className?: string }) => (<div className={`w-3 h-3 border-muted-foreground ${className}`}></div>);
const BorderSideTop = () => <BorderSideIcon className={`border-t `} />;
const BorderSideRight = () => <BorderSideIcon className={`border-r`} />;
const BorderSideBottom = () => <BorderSideIcon className={`border-b`} />;
const BorderSideLeft = () => <BorderSideIcon className={`border-l`} />;

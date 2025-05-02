import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Lock, Unlock } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";

interface RadiusProps {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  setTopLeft: (value: number) => void;
  setTopRight: (value: number) => void;
  setBottomLeft: (value: number) => void;
  setBottomRight: (value: number) => void;
  lockValue: number | null;
  setLockValue: (value: number | null) => void;
}

const CornerIcon = ({ className }: { className?: string }) => (
  <div className={`w-4 h-4 ${className}`}></div>
);

const CornerTopLeft = ({ className }: { className?: string }) => (
  <CornerIcon className={`border-t-2 rounded-tl-lg border-l-2`} />
);

const CornerTopRight = ({ className }: { className?: string }) => (
  <CornerIcon className={`border-t-2 rounded-tr-lg border-r-2`} />
);

const CornerBottomLeft = ({ className }: { className?: string }) => (
  <CornerIcon className={`border-b-2 rounded-bl-lg border-l-2`} />
);

const CornerBottomRight = ({ className }: { className?: string }) => (
  <CornerIcon className={`border-b-2 rounded-br-lg border-r-2`} />
);

const Radius = ({ 
  topLeft, 
  topRight, 
  bottomLeft, 
  bottomRight,
  setTopLeft,
  setTopRight,
  setBottomLeft,
  setBottomRight,
  lockValue,
  setLockValue
}: RadiusProps) => {
  const [isLocked, setIsLocked] = useState(false);

  const handleInputChange = (value: number) => {
    if (isLocked) {
      setLockValue(value);
    }
  };

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      setTopRight(topLeft);
      setBottomLeft(topLeft);
      setBottomRight(topLeft);
      return
    }
    setLockValue(null)
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost">
          <CornerTopLeft className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit flex flex-col gap-2 p-4" side="bottom" align="end">
        <div className="flex justify-end absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLockToggle}
            title={isLocked ? "Desbloquear todos os cantos" : "Bloquear todos os cantos"}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CornerTopLeft className="h-4 w-4" />
              <Input 
                type="number" 
                value={topLeft} 
                min={0}
                max={100}
                className="w-16"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (isLocked) handleInputChange(value) 
                  else setTopLeft(value);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                value={topRight} 
                className="w-16"
                min={0}
                max={100}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (isLocked) return;
                  setTopRight(value);
                }}
              />
              <CornerTopRight className="h-4 w-4" />

            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CornerBottomLeft className="h-4 w-4" />
              <Input 
                type="number" 
                value={bottomLeft} 
                className="w-16"
                min={0}
                max={100}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (isLocked) return;
                  setBottomLeft(value);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                value={bottomRight} 
                className="w-16"
                min={0}
                max={100}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (isLocked) return;
                  setBottomRight(value);
                }}
              />
              <CornerBottomRight className="h-4 w-4" />

            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { Radius };
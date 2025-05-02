"use client"
import useTemplate from "@/hooks/use-template";
import { ArrowLeftRight, Image, ImageOff, PanelRightOpen } from "lucide-react";
import { Button } from "../ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ColorPicker } from "../color-picker";
import { useEffect, useState } from "react";
import { Radius } from "../radius";

export const EditorWrapper = ({ children }: { children: React.ReactNode }) => {
  const { selectedTemplate } = useTemplate();
  const [color, setColor] = useState('#000000');
  const [isOpen, setIsOpen] = useState(true);
  const [sidebarSize, setSidebarSize] = useState(20);
  const [borderRadius, setBorderRadius] = useState<{
    topLeft: number | null;
    topRight: number | null;
    bottomLeft: number | null;
    bottomRight: number | null;
  }>({
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0
  });
  

  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('left');
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);

  const editarClass = selectedTemplate.className;

  useEffect(() => {
    setColor(selectedTemplate.bgColor || '#000000');
    setBgImage(selectedTemplate.bgImage || undefined);
    setBorderRadius(selectedTemplate.borderRadius || {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    });
    setSidebarSize(selectedTemplate.sidebarSize || 20);
  }, [selectedTemplate]);

  const templateType: Record<string, (children: React.ReactNode, color: string, isOpen: boolean, bgImage?: string, sidebarSize?: number) => React.ReactNode> = {
    "basic-template": (children) => { return children },
    "modern-sidebar-template": (children, color, isOpen, bgImage, sidebarSize) => {
      return generateLateralBar({
        children: children,
        position: sidebarPosition,
        color: color,
        isOpen: isOpen,
        bgImage: bgImage,
        sidebarSize: sidebarSize || 20,
        borderRadius:{
          topLeft: borderRadius.topLeft || 0,
          topRight: borderRadius.topRight || 0,
          bottomLeft: borderRadius.bottomLeft || 0,
          bottomRight: borderRadius.bottomRight || 0
        }
      }) }
  }
  return (
    <div className={`editor-container w-full mx-auto ${editarClass}`}>
      <div className="flex flex-col">
        <TemplateController
          template={selectedTemplate.id}
          color={color}
          onChangeColor={setColor}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          swapSidebar={setSidebarPosition}
          sidebarPosition={sidebarPosition}
          setBgImage={setBgImage}
          borderRadius={borderRadius}
          setBorderRadius={setBorderRadius}
           />
      </div>
      {templateType[selectedTemplate.id] ? templateType[selectedTemplate.id](children, color, isOpen, bgImage,selectedTemplate.sidebarSize || sidebarSize) : null}
    </div>
  );
};

const generateLateralBar = ({ children, position, color, isOpen, bgImage, borderRadius, sidebarSize }: { children: React.ReactNode, position: 'left' | 'right', color: string, isOpen: boolean, bgImage?: string, borderRadius: {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}, sidebarSize: number }) => {
  console.log(borderRadius)
  return (
    <ResizablePanelGroup direction="horizontal">
      {isOpen &&
        <ResizablePanel
          className="h-[100vh] bg-gray-200"
          id="left-panel"
          defaultSize={sidebarSize}
          order={1}
          minSize={1}
          maxSize={40}
          style={{
            backgroundColor: color || 'red',
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: "cover",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundBlendMode: 'overlay',
            display: (position === 'left' && isOpen) ? "block" : "none",
            borderTopRightRadius: position === 'left' ? `${borderRadius.topRight}px` : '0',
            borderBottomRightRadius: position === 'left' ? `${borderRadius.bottomRight}px` : '0',
            borderTopLeftRadius: position === 'left' ? `${borderRadius.topLeft}px` : '0',
            borderBottomLeftRadius: position === 'left' ? `${borderRadius.bottomLeft}px` : '0'
          }} />
      }
      <ResizableHandle   withHandle  id="left-panel" className="w-2 opacity-0 active:opacity-100 hover:opacity-100 bg-gray-200 hover:bg-gray-300 transition-colors" 
      style={{
        display: (position === 'left' && isOpen) ? "block" : "none"
      }}
        />
    
      <ResizablePanel order={2}  className="h-[100vh] bg-gray-200" style={{ backgroundColor: color || 'red' }}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle   id="right-panel" className="w-1 opacity-0 active:opacity-100 hover:opacity-100 bg-gray-200 hover:bg-gray-300 transition-colors" 
      style={{
        display: (position === 'right' && isOpen) ? "block" : "none"
      }}
      />
      {isOpen &&
        <ResizablePanel
          order={3}
          id="right-panel"
          defaultSize={sidebarSize}
          minSize={1}
          maxSize={40}
          className="h-[100vh] bg-gray-200"
          style={{
            backgroundColor: color || 'red',
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: "cover",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundBlendMode: 'overlay',
            display: (position === 'right' && isOpen) ? "block" : "none",
            borderTopRightRadius: position === 'right' ? `${borderRadius.topRight}px` : '0',
            borderBottomRightRadius: position === 'right' ? `${borderRadius.bottomRight}px` : '0',
            borderTopLeftRadius: position === 'right' ? `${borderRadius.topLeft}px` : '0',
            borderBottomLeftRadius: position === 'right' ? `${borderRadius.bottomLeft}px` : '0'
          }} />
      }
    </ResizablePanelGroup>
  );
};

interface TemplateControllerProps {
  template: string;
  color: string;
  onChangeColor: (color: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sidebarPosition: 'left' | 'right';
  swapSidebar: (position: 'left' | 'right') => void;
  setBgImage: (bgImage: string | undefined) => void;
  borderRadius: {
    topLeft: number | null;
    topRight: number | null;
    bottomLeft: number | null;
    bottomRight: number | null;
  };
  setBorderRadius: (borderRadius: {
    topLeft: number | null;
    topRight: number | null;
    bottomLeft: number | null;
    bottomRight: number | null;
  }) => void;
}

const TemplateController = ({ template, color, onChangeColor, isOpen, setIsOpen, swapSidebar, sidebarPosition, setBgImage, borderRadius, setBorderRadius }: TemplateControllerProps) => {
  const genereteRandomImage = () => {
    const randomImage = `https://picsum.photos/200/2000?random=${Math.random()}`;
    setBgImage(randomImage);
  }

  const templateType: { [key: string]: () => React.ReactNode } = {
    "modern-sidebar-template": () => {
      return (
        <>
          <ColorPicker color={color} setColor={onChangeColor} />
          <Button variant="ghost" onClick={() => {
            setIsOpen(!isOpen)
          }}>
            <PanelRightOpen />
          </Button>
          <Button variant="ghost" onClick={() => {
            swapSidebar(sidebarPosition === 'left' ? 'right' : 'left')
          }}>
            <ArrowLeftRight />
          </Button>
          <Button variant="ghost" onClick={() => {
            genereteRandomImage() 
          }}>
            <Image />
          </Button>
          <Button variant="ghost" onClick={() => {
            setBgImage(undefined)
          }}>
            <ImageOff />
          </Button>
           <Radius 
            topLeft={borderRadius.topLeft || 0}
            topRight={borderRadius.topRight || 0}
            bottomLeft={borderRadius.bottomLeft || 0}
            bottomRight={borderRadius.bottomRight || 0}
            setTopLeft={(value) => setBorderRadius({ ...borderRadius, topLeft: value })}
            setTopRight={(value) => setBorderRadius({ ...borderRadius, topRight: value })}
            setBottomLeft={(value) => setBorderRadius({ ...borderRadius, bottomLeft: value })}
            setBottomRight={(value) => setBorderRadius({ ...borderRadius, bottomRight: value })}
            lockValue={borderRadius.topLeft}
            setLockValue={(value) => setBorderRadius({  bottomLeft: value, bottomRight: value, topLeft: value, topRight: value })}
          />
        </>
      )
    }
  }

  return <div className="fixed flex flex-col z-50 items-center justify-center rounded-lg gap-2 bg-background p-3 bottom-1/2  right-10 shadow-lg">
    {templateType[template] ? templateType[template]() : null}
  </div>
}

import React, { useEffect, useRef, useState } from 'react';

const HandlesDrag = () => {
  const borderRefs = {
    left: useRef<HTMLDivElement>(null),
    right: useRef<HTMLDivElement>(null),
    bottom: useRef<HTMLDivElement>(null),
    bottomLeft: useRef<HTMLDivElement>(null),
    bottomRight: useRef<HTMLDivElement>(null),
  };

  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({
    left: false,
    right: false,
    bottom: false,
    bottomLeft: false,
    bottomRight: false,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newHoverStates: Record<string, boolean> = {};

      for (const [key, ref] of Object.entries(borderRefs)) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) continue;

        const distance = Math.hypot(
          Math.max(rect.left - mouseX, 0, mouseX - rect.right),
          Math.max(rect.top - mouseY, 0, mouseY - rect.bottom)
        );

        newHoverStates[key] = distance < 40;
      }

      setHoverStates(newHoverStates);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
        {/* Left border */}
        <div
          ref={borderRefs.left}
          className={` transition-all bg-primary/50  react-resizable-handle react-resizable-handle-w ${
            hoverStates.left ? ' opacity-100' : ' opacity-0'
          }`}
        />
        {/* Right border */}
        <div
          ref={borderRefs.right}
          className={` transition-all bg-primary/50  react-resizable-handle react-resizable-handle-e ${
            hoverStates.right ? ' opacity-100' : ' opacity-0'
          }`}
        />
        {/* Bottom border */}
        <div
          ref={borderRefs.bottom}
          className={` w-full transition-all bg-primary/50 react-resizable-handle react-resizable-handle-s ${
            hoverStates.bottom ?' opacity-100' : ' opacity-0'
          }`}
        />
      
    </>
  );
};

export { HandlesDrag };

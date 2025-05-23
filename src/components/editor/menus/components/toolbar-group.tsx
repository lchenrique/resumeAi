"use client";

import React from "react";

export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(({ children, className, ...props }, ref) => {
  return (
    <div className={`flex items-center gap-1 ${className || ""}`} {...props} ref={ref}>
      {children}
    </div>
  );
});
ToolbarGroup.displayName = "ToolbarGroup";

import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { ContextMenu, ContextMenuItem, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ReactNode } from "react";

export const ContextMenus = ({ children, items, }: { children: ReactNode, items: { label: string, onClick: () => void }[] }) => {
    if (items.length === 0) return children;
    return (
        <ContextMenu>
            <ContextMenuTrigger >
                    {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                {items.map((item) => (
                    <ContextMenuItem key={item.label} onClick={item.onClick}>
                        {item.label}
                    </ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    );
};

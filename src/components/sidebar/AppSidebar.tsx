"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Files,
  LayoutPanelLeft
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  
  const handleLogout = () => {
    console.log("Logout do usuário");
  };

  const navItems = [
    { href: "/", label: "Painel Principal", icon: LayoutDashboard },
    { href: "/resumes", label: "Meus Currículos", icon: Files },
    { href: "/templates", label: "Modelos", icon: LayoutPanelLeft },
    { href: "/account", label: "Minha Conta", icon: User },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <aside className="w-72 border-r h-full flex flex-col bg-gradient-to-b from-background to-muted/20 print:hidden">
      <div className="px-6 py-6 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Usuário" className="object-cover" />
            <AvatarFallback className="bg-primary/5 text-primary">U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">Nome do Usuário</p>
            <p className="text-xs text-muted-foreground truncate">usuario@email.com</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm h-11 px-4 relative transition-all duration-200",
                  "hover:bg-primary/10",
                  isActive && "bg-primary/10 text-primary font-medium before:absolute before:left-0 before:w-1 before:h-full before:bg-primary before:rounded-r-full"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="mx-3" />

      <div className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm h-11 px-4 text-red-600 hover:text-red-700 hover:bg-red-500/10 transition-colors duration-200" 
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar; 
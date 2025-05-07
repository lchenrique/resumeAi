'use client';

import React from 'react';
import Link from 'next/link';
import { DraftingCompass } from 'lucide-react'; // Exemplo de ícone
import { ModeToggle } from '@/components/theme-toggle';

const Header = () => {
  return (
    <header className="h-14  z-50 w-full border-b border-border/40 dark:border-zinc-700/40 bg-background/95 dark:bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="px-10 flex h-14   items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <DraftingCompass className="h-6 w-6 text-primary dark:text-blue-400" />
          <span className="font-bold inline-block text-zinc-900 dark:text-zinc-100">
            ResumeAI
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {/* Adicionar links de navegação aqui se necessário */}
          {/* <Link href="/templates" className="text-foreground/60 transition-colors hover:text-foreground/80 dark:text-zinc-400 dark:hover:text-zinc-200">
            Templates
          </Link>
          <Link href="/dashboard" className="text-foreground/60 transition-colors hover:text-foreground/80 dark:text-zinc-400 dark:hover:text-zinc-200">
            Dashboard
          </Link> */}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header; 
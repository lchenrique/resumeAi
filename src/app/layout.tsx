import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import React from 'react';
import Header from '@/components/layout/Header';
import AppSidebar from '@/components/sidebar/AppSidebar';
import FloatingControls from '@/components/floating-controls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ResumeAI',
  description: 'Crie currículos impressionantes com IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col h-screen bg-card overflow-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <ScrollArea className="flex-1 relative">
              <main className="p-4 lg:p-6 relative print:p-0">
                {children}
              </main>
            </ScrollArea>
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}

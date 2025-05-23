"use client";

import '@/app/globals.css';
import { RenderContent } from "../render"; // Corrigido para o caminho certo
import { useSearchParams } from 'next/navigation';
import { EditorProvider } from '@/contexts/editor-context';
import MainNavbar from '@/components/layout/MainNavbar';



export default function PrintViewPage() {


  return (
     
      <EditorProvider>
        <div className="flex relative flex-col h-full pt-14 print:pt-0">
          <RenderContent />
        </div>
      </EditorProvider>
  );
} 
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileDown,
  FilePlus,
  Save,
  Undo,
  Redo,
  Layout,
  Settings,
  ChevronDown,
  Share2,
  HelpCircle,
  Keyboard,
  LayoutGrid, // Alterado de LayoutTemplate para melhor distinção ou preferência
  Sparkles, // Para funcionalidades de IA
  DownloadCloud, // Exemplo de ícone para Exportar
  Loader2
} from 'lucide-react';
import { JSONContent } from '@tiptap/react';
import { EditorItem, useEditorContext } from '@/contexts/editor-context';
import { useExportPDF } from '@/hooks/use-export-pdf';

// Funções placeholder para as ações do menu
const handleNewResume = () => console.log("Ação: Novo Currículo");
const handleSave = () => console.log("Ação: Salvar");

// ATENÇÃO: A obtenção de `currentResumeData` e `currentTemplateId` abaixo usa localStorage como placeholder.
// Você DEVE ajustar esta parte para buscar os dados da fonte correta em seu aplicativo
// (por exemplo, de um contexto React, estado global, props, etc.).


const handleUndo = () => console.log("Ação: Desfazer");
const handleRedo = () => console.log("Ação: Refazer");
const handleLayoutOptions = () => console.log("Ação: Opções de Layout");
const handleTemplates = () => console.log("Ação: Escolher Template");
const handleAISuggestions = () => console.log("Ação: Sugestões da IA");
const handleAIGenerateSection = () => console.log("Ação: Gerar Seção com IA");

const MainNavbar: React.FC = () => {
  const { handleExportPDF, isExporting } = useExportPDF();

  return (
    <nav className="h-14 px-4 flex items-center justify-between border-b bg-background print:hidden">
      {/* Lado Esquerdo: Menus Dropdown */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-2">
              Arquivo <ChevronDown size={14} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={handleNewResume}>
              <FilePlus className="mr-2 h-4 w-4" /> Novo Currículo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExportPDF()}>
              {isExporting ? <Loader2 className='w-4 h-4 animate-spin' /> : <DownloadCloud className="mr-2 h-4 w-4" />}
              Exportar PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-2">
              Editar <ChevronDown size={14} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onClick={handleUndo}>
              <Undo className="mr-2 h-4 w-4" /> Desfazer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRedo}>
              <Redo className="mr-2 h-4 w-4" /> Refazer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-2">
              Exibir <ChevronDown size={14} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onClick={handleLayoutOptions}>
              <Layout className="mr-2 h-4 w-4" /> Opções de Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleTemplates}>
              <LayoutGrid className="mr-2 h-4 w-4" /> Templates
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-2">
              Inteligência Artificial <ChevronDown size={14} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuItem onClick={handleAISuggestions}>
              <Sparkles className="mr-2 h-4 w-4 text-yellow-500" /> Analisar e Sugerir Melhorias
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAIGenerateSection}>
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" /> Gerar Seção com IA
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lado Direito: Ações Rápidas */}
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => handleExportPDF()}>
          <FileDown className="mr-1.5 h-4 w-4" />
          Exportar
        </Button>
        {/* <Button variant="ghost" size="icon" className="h-9 w-9" title="Compartilhar">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Ajuda">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Atalhos">
          <Keyboard className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Configurações Globais">
          <Settings className="h-4 w-4" />
        </Button> */}
      </div>
    </nav>
  );
};

export default MainNavbar; 
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
  DownloadCloud // Exemplo de ícone para Exportar
} from 'lucide-react';
import { JSONContent } from '@tiptap/react';
import { EditorItem, useEditorContext } from '@/contexts/editor-context';

// Funções placeholder para as ações do menu
const handleNewResume = () => console.log("Ação: Novo Currículo");
const handleSave = () => console.log("Ação: Salvar");

// ATENÇÃO: A obtenção de `currentResumeData` e `currentTemplateId` abaixo usa localStorage como placeholder.
// Você DEVE ajustar esta parte para buscar os dados da fonte correta em seu aplicativo
// (por exemplo, de um contexto React, estado global, props, etc.).
const handleExportPDF = async (editorValues: EditorItem[]) => {
  try {
    const fileName = `curriculo.pdf`;

    window.open('/print-view?contents=' + JSON.stringify(editorValues), '_blank');
    console.log('editorValues', editorValues);

    return;

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName, editorValues }), 
    });

    if (!response.ok) {
      let errorDetails = 'Não foi possível obter detalhes do erro.';
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      console.error('Erro da API ao gerar PDF:', response.status, response.statusText, errorDetails);
      alert(`Erro ao gerar PDF: ${response.statusText} (Status: ${response.status}). Detalhes: ${errorDetails}`);
      return; // Não limpa o localStorage em caso de erro para depuração
    }

    const blob = await response.blob();
    if (blob.type !== 'application/pdf') {
      console.error('A API não retornou um PDF. Tipo recebido:', blob.type);
      alert('Ocorreu um erro inesperado: o arquivo recebido do servidor não é um PDF.');
      return; // Não limpa o localStorage
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);


  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    alert(`Falha ao exportar PDF: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // 4. Opcional: Limpar os dados temporários do localStorage após a tentativa.
    //    Considere se você quer mantê-los para depuração ou se /print-view pode ser acessada de outra forma.
    // localStorage.removeItem('printViewResumeData');
    // localStorage.removeItem('printViewTemplateId');
    // console.log('Dados temporários do print-view limpos do localStorage.');
  }
};

const handleUndo = () => console.log("Ação: Desfazer");
const handleRedo = () => console.log("Ação: Refazer");
const handleLayoutOptions = () => console.log("Ação: Opções de Layout");
const handleTemplates = () => console.log("Ação: Escolher Template");
const handleAISuggestions = () => console.log("Ação: Sugestões da IA");
const handleAIGenerateSection = () => console.log("Ação: Gerar Seção com IA");

const MainNavbar: React.FC = () => {
  const { editorValues } = useEditorContext();

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
            <DropdownMenuItem onClick={() => handleExportPDF(editorValues)}>
              <DownloadCloud className="mr-2 h-4 w-4" /> Exportar PDF
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
        <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => handleExportPDF(editorValues)}>
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
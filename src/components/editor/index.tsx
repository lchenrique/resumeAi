"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import YooptaEditor, { Blocks, createYooptaEditor, YooptaContentValue, YooptaOnChangeOptions } from "@yoopta/editor";
import Paragraph from "@yoopta/paragraph";
import Blockquote from '@yoopta/blockquote';
import Table from '@yoopta/table';
import Divider from '@yoopta/divider';
import Accordion from '@yoopta/accordion';
import Code from '@yoopta/code';
import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Link from '@yoopta/link';
import File from '@yoopta/file';
import Callout from '@yoopta/callout';
import Video from '@yoopta/video';
import Lists from '@yoopta/lists';
import Headings from '@yoopta/headings';
import { RESUME_TEMPLATE, RESUME_TEMPLATES, ResumeTemplate, getTemplateById } from './initial';
import { Layout, ChevronLeft, Image as ImageIcon, ChevronRight, FileDown } from 'lucide-react';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import TemplateManager from './template-manager';
import { BASIC_TEMPLATE_CONTENT } from "./templates/content/basic";
import { EditorWrapper } from "./editor-wrapper";

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

const plugins = [Headings.HeadingOne, Headings.HeadingTwo, Headings.HeadingThree, Paragraph, Blockquote, Table, Divider, Accordion, Code, Embed, Image, Link, File, Callout, Video, Lists.BulletedList, Lists.NumberedList , Lists.TodoList];

// Tools should be defined outside component
const TOOLS = {
    Toolbar: {
      tool: Toolbar,
      render: DefaultToolbarRender,
    },
    ActionMenu: {
      tool: ActionMenu,
      render: DefaultActionMenuRender,
    },
    LinkTool: {
      tool: LinkTool,
      render: DefaultLinkToolRender,
    },
};

interface EditorProps {
  selectedTemplate: ResumeTemplate;
  onContentChange: (content: YooptaContentValue | undefined) => void;
  resumeContent: YooptaContentValue | undefined;
}

export function Editor({ selectedTemplate, onContentChange, resumeContent }: EditorProps) {
  const editor = useMemo(() => createYooptaEditor(), []);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const onChange = (newValue: YooptaContentValue, options: YooptaOnChangeOptions) => {
    onContentChange(newValue);
  };
 

  // Obtém a classe CSS com base no template selecionado
  const getTemplateClassName = () => {
    switch (selectedTemplate.id) {
      case 'modern-template':
        return 'template-modern';
      case 'minimal-template':
        return 'template-minimal';
      case 'professional-template':
        return 'template-professional';
      case 'creative-template':
        return 'template-creative';
      case 'executive-template':
        return 'template-executive';
      case 'compact-template':
        return 'template-compact';
      case 'classic-template':
        return 'template-classic';
      case 'elegant-template':
        return 'template-elegant';
      case 'contemporary-photo-template':
        return 'template-contemporary-photo';
      case 'academic-elegant-template':
        return 'template-academic-elegant';
      case 'infographic-creative-template':
        return 'template-infographic-creative';
      case 'tech-modern-template':
        return 'template-tech-modern';
      case 'visual-portfolio-template':
        return 'template-visual-portfolio';
      case 'bold-executive-template':
        return 'template-bold-executive';
      case 'clean-minimalist-template':
        return 'template-clean-minimalist';
      case 'two-column-template':
        return 'template-two-column';
      case 'timeline-focused-template':
        return 'template-timeline-focused';
      case 'basic-template':
      default:
        return 'template-basic';
    }
  };

  // Função para exportar o currículo para PDF
  const exportToPDF = async () => {
    setExportLoading(true);
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = editorContainerRef.current?.querySelector('.editor-container');
      if (element instanceof HTMLElement) {
        const options = {
          filename: `curriculo_${selectedTemplate}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(options).from(element).save();
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Ocorreu um erro ao exportar o PDF. Tente novamente.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div 
        className={`w-full h-full overflow-auto ${getTemplateClassName()}`}
        ref={editorContainerRef}
      >
        <div className="editor-container w-full mx-auto h-full">
        <EditorWrapper>
          {resumeContent && (
            <YooptaEditor
              editor={editor}
              plugins={plugins}
              placeholder="Comece a editar seu currículo..."
              value={resumeContent}
              onChange={onChange}
              tools={TOOLS}
              marks={MARKS}
            />
          )}
        </EditorWrapper>
        </div>

      </div>

      <ActionMenu />
      
      {/* Botão de exportar PDF */}
      <div className="fixed bottom-4 right-4 z-10">
        <button
          onClick={exportToPDF}
          disabled={exportLoading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white shadow-sm text-sm font-medium transition-colors"
        >
          {exportLoading ? (
            <span>Exportando...</span>
          ) : (
            <>
              <FileDown size={16} />
              <span>Exportar PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
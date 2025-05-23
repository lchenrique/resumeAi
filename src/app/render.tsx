"use client";

import React, { useEffect } from 'react';
import { EditorInstance, } from "@/components/editor/EditorInstance";
import { sampleModernSidebarContent, templateOne } from '@/components/editor/initial';
import RenderGridLayout from '@/components/resume/renderer/RenderGridLayout';
import { cn } from '@/lib/utils';
import { JSONContent } from '@tiptap/react';
import { useEditorContext } from '@/contexts/editor-context';
import { useSearchParams } from 'next/navigation';
import { Form } from 'react-hook-form';

interface RenderContentProps {
  className?: string;
}

  export function RenderContent({ className  }: RenderContentProps) {
    const { form } = useEditorContext();
  
    return (
        <Form {...form}
          className={cn("w-[210mm] h-[297mm] min-h-[297mm] border border-dashed mx-auto my-8 print:m-0", className)}
        >  
         <RenderGridLayout template={templateOne}  />
        </Form>
    );
  }

RenderContent.displayName = 'RenderContent'; // Adicionando displayName 
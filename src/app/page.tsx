"use client";
import React, { useCallback, useEffect, useState } from "react";
import { RenderContent } from "./render";
import useTemplate from "@/hooks/use-template";
import { sampleModernSidebarContent, templateOne } from "@/components/editor/initial";
import { CustomResumeData } from "@/types/resume-data";
import { ResumeTemplate } from "@/components/resume/renderer/types";
import MainNavbar from "@/components/layout/MainNavbar";
import { EditorProvider } from "@/contexts/editor-context";
import RenderGridLayout from "@/components/resume/renderer/RenderGridLayout";

export default function Home() {
  const { selectedTemplate, setSelectedTemplate } = useTemplate();
  const [currentResumeData, setCurrentResumeData] = useState<CustomResumeData | undefined>(
    selectedTemplate?.initialContent || sampleModernSidebarContent
  );

  useEffect(() => {
    if (selectedTemplate?.initialContent) {
      setCurrentResumeData(selectedTemplate.initialContent);
    }
  }, [selectedTemplate]);

  return (
    <EditorProvider>
      <div className="flex relative flex-col h-full pt-14">
        <div className="fixed w-[calc(100%-287px)] top-14 right-0 z-50 print:hidden">
          <MainNavbar />
        </div>
        <RenderContent />
      </div>
    </EditorProvider>

  );
}

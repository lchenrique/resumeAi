import React, { useCallback, useEffect, useState } from "react";
import { RenderContent } from "./render";
import useTemplate from "@/hooks/use-template";
import { sampleModernSidebarContent, templateOne } from "@/components/editor/initial";
import { CustomResumeData } from "@/types/resume-data";
import { ResumeTemplate } from "@/components/resume/renderer/types";
import MainNavbar from "@/components/layout/MainNavbar";
import { EditorProvider } from "@/contexts/editor-context";
import RenderGridLayout from "@/components/resume/renderer/RenderGridLayout";
import FloatingControls from "@/components/floating-controls";

export default async function Home() {
  const res = await fetch('http://localhost:3000/api/pdf/get-pdf-data?id=32757eae-6905-4dcd-9e9e-8ee28b4a1f68', { cache: 'no-store' })
  const data = await res.json()

  console.log({ data: data.data })
  console.log("OOOOOOOOOOOOOOOI")
  return (
    <EditorProvider initialData={data.data} id={data.id}>
      <div className="flex relative flex-col h-full pt-14">
        <div className="fixed w-[calc(100%-287px)] top-14 right-0 z-50 print:hidden">
          <MainNavbar />
        </div>
        <RenderContent />
      </div>

      <div className='fixed top-36 right-5 flex flex-col gap-2 z-[9999] print:hidden'>
        <FloatingControls />
      </div>
    </EditorProvider>

  );
}

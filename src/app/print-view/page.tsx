
import '@/app/globals.css';
import { RenderContent } from "../render"; // Corrigido para o caminho certo
import { useSearchParams } from 'next/navigation';
import { EditorProvider } from '@/contexts/editor-context';
import MainNavbar from '@/components/layout/MainNavbar';



export default async function PrintViewPage() {
  const res = await fetch('http://localhost:3000/api/pdf/get-pdf-data?id=32757eae-6905-4dcd-9e9e-8ee28b4a1f68', { cache: 'no-store' })
  const data = await res.json()



  return (
     
      <EditorProvider initialData={data.data} id={data.id}>
        <div className="flex relative flex-col h-full pt-14 print:pt-0">
          <RenderContent />
        </div>
      </EditorProvider>
  );
} 
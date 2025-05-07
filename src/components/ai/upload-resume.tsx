import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UploadResumeProps {
  onUpload: (file: File, dataUrl: string) => void;
  disabled?: boolean;
}

interface APIError {
  error: string;
  details: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function UploadResume({ onUpload, disabled }: UploadResumeProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.includes('pdf')) {
      toast.error('Tipo de arquivo inválido', {
        description: 'Por favor, envie apenas arquivos PDF'
      });
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo permitido é 10MB'
      });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Convertendo PDF para enviar...');

    try {
      const dataUrl = await fileToBase64(file);
      
      onUpload(file, dataUrl);
      
      toast.success('PDF pronto para enviar!', {
        description: `Arquivo "${file.name}" será enviado para análise.`
      });

    } catch (error) {
      console.error('Erro ao converter PDF:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao preparar o PDF',
        { description: 'Não foi possível ler o arquivo selecionado.' }
      );
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="relative">
      <Input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="hidden"
        id="resume-upload"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => document.getElementById('resume-upload')?.click()}
        disabled={disabled || isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processando...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Anexar Currículo</span>
          </>
        )}
      </Button>
    </div>
  );
} 
import { EditorItem, useEditorContext } from "@/contexts/editor-context";
import { startTransition, useTransition } from "react"
import { useState } from "react";

export const useExportPDF = () => {
    const [isExporting, setIsExporting] = useState(false);
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const fileName = `curriculo.pdf`;

                const response = await fetch('/api/generate-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fileName }),
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
            setIsExporting(false);
        } 
    };

    return { handleExportPDF, isExporting };

}
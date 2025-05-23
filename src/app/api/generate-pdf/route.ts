import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
// import fs from 'fs'; // Não vamos mais ler o globals.css diretamente por enquanto
// import path from 'path';

// URL base da aplicação para o Puppeteer acessar
// Em produção, você usaria algo como process.env.NEXT_PUBLIC_BASE_URL
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

export async function POST(request: NextRequest) {
  console.log("API Route /api/generate-pdf chamada");
  const { fileName } = await request.json();
  if(!fileName) {
    return NextResponse.json({ error: 'Nome do arquivo é obrigatório' }, { status: 400 });
  }


  try {
    console.log("Tentando iniciar Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--font-render-hinting=none',
      ]
    });

    console.log("Puppeteer iniciado com sucesso");
    const page = await browser.newPage();
    
    // Configurar o viewport para o tamanho A4 (em pixels)
    // A4 = 210mm x 297mm, aqui estamos usando uma aproximação em pixels
    await page.setViewport({
      width: 794, // Aproximadamente 210mm em 96 DPI
      height: 1123, // Aproximadamente 297mm em 96 DPI
      deviceScaleFactor: 2, // Melhor qualidade com escala 2x
    });

    // URL da página de impressão
    const printUrl = `${BASE_URL}/print-view`;
    
    console.log(`Navegando para a URL: ${printUrl}`);
    
    // Navegar para a página de impressão
    await page.goto(printUrl, { 
      waitUntil: 'networkidle0', // Esperar até que não haja mais requisições de rede
      timeout: 30000 // 30 segundos de timeout (ajuste conforme necessário)
    });

    console.log("Página carregada com sucesso, gerando PDF...");

    // Esperar um pouco mais para garantir que tudo seja renderizado
    // incluindo fontes personalizadas, scripts assíncronos, etc.
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Gerar o PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
      scale: 1.0, // Escala exata (1:1)
      // Para impressão sem header/footer (cabeçalho/rodapé)
      displayHeaderFooter: false,
    });

    // Fechar o navegador
    await browser.close();
    console.log("PDF gerado com sucesso");

    // Retornar o PDF como resposta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="documento.pdf"',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF com Puppeteer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ 
      error: 'Falha ao gerar PDF no servidor', 
      details: errorMessage 
    }, { status: 500 });
  }
}

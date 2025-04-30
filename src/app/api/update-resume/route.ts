import { NextResponse } from 'next/server';
import { YooptaContentValue } from "@yoopta/editor"; // Importar o tipo
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Importar SDK do Google

export const runtime = 'edge';

// Função auxiliar para limpar a resposta JSON (mantida)
function cleanJsonResponse(responseString: string): string {
  const cleaned = responseString
  .replace(/^```json\n/, "") // remove início
  .replace(/\n```$/, "") // remove final
  .trim();

  // Faz o parse do JSON limpo
  return cleaned;
}

// Prompt de sistema para edição (mantido)
const getEditSystemPrompt = (resumeContent: Record<string, any>, instruction: string) => 
    `You are a resume editing assistant specialized in the Yoopta editor JSON format. Given the instruction and the current resume content in Yoopta JSON format, modify the JSON to apply the instruction. Return ONLY the complete, valid, updated Yoopta JSON content. Do not include explanations or markdown formatting around the JSON. Current Resume Content: ${JSON.stringify(resumeContent)}. Instruction: ${instruction}`;

export async function POST(req: Request) {
    try {
        const { instruction, resumeContent } = await req.json();

        if (!instruction || !resumeContent) {
            return NextResponse.json({ error: 'Missing instruction or resume content' }, { status: 400 });
        }

        // --- Tentativa Única (Google Gemini via @google/generative-ai) ---
        const googleApiKey = process.env.GOOGLE_API_KEY;
        const modelName = "gemini-1.5-flash"; // Usar o flash diretamente

        if (!googleApiKey) {
             console.error('Google API Key (GOOGLE_API_KEY) is missing.');
             // Retorna um erro claro se a chave estiver faltando
             return NextResponse.json({ error: `Server configuration error: Google API Key is missing.` }, { status: 500 });
        }

        try {
             console.log(`Attempting update with model: ${modelName}`);
             const genAI = new GoogleGenerativeAI(googleApiKey);
             const model = genAI.getGenerativeModel({ model: modelName });
             const systemPrompt = getEditSystemPrompt(resumeContent, instruction);

             // Configurações para tentar obter JSON diretamente (pode não funcionar em todos os modelos/versões)
             const generationConfig = {
                 responseMimeType: "application/json",
             };
             const safetySettings = [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
             ];

             // Gera o conteúdo
             // Nota: Gemini Flash pode não aceitar generationConfig/safetySettings aqui
             // Tentaremos passar apenas o prompt para maior compatibilidade se necessário
             const result = await model.generateContent(
                 systemPrompt, 
                 // generationConfig, // Descomente se quiser testar
                 // safetySettings // Descomente se quiser testar
             );
            
             let responseText = '';
             try {
                 const response = await result.response;
                 responseText = response.text();
             } catch (responseError) {
                 console.error('Error accessing Gemini response text:', responseError);
                 throw new Error('Failed to get text response from Gemini');
             }

             if (!responseText) {
                 throw new Error(`Model (${modelName}) did not return content.`);
             }

             // Limpeza ainda é importante, mesmo pedindo JSON
             const cleanedJsonString = cleanJsonResponse(responseText);

             try {
                 const updatedJson = JSON.parse(cleanedJsonString) as YooptaContentValue;
                 console.log(`Successfully parsed response from model: ${modelName}`);
                 return NextResponse.json(updatedJson);
             } catch (parseError: any) {
                 console.error(`Failed to parse JSON response from model (${modelName}) AFTER cleanup:`, cleanedJsonString, parseError);
                 // Inclui o texto recebido no erro para depuração
                 throw new Error(`Model (${modelName}) response could not be parsed: ${parseError.message}. Response text received: ${responseText}`); 
             }
        } catch (apiError: any) {
             console.error(`API call attempt with ${modelName} failed:`, apiError);
             // Re-lança o erro para ser pego pelo catch externo, adicionando contexto
             throw new Error(`API attempt with ${modelName} failed: ${apiError.message}`); 
        }

    } catch (error: any) {
        console.error('Update Resume API final error:', error);
        // Retorna a mensagem de erro final para o cliente
         return NextResponse.json(
            { error: error.message || 'Failed to process update request' },
            { status: 500 }
        );
    }
} 
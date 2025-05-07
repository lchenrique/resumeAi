import { NextResponse } from 'next/server';
// import { kv } from '@vercel/kv'; // Removido KV
import { OpenRouter, type OpenRouterChatParams, type OpenRouterChatResponseJson } from '@/lib/openrouter';
// import { Content } from '@google/generative-ai'; // Removido tipo Gemini
import { 
    getChatHistory, 
    addChatMessages, 
    pruneChatHistory, 
    convertMemoryToOpenRouterFormat, // Usa função de conversão específica
    type ChatMemoryMessage,
    type OpenRouterMessage as SupabaseMemoryMessage // Renomeia tipo da memória
} from '@/lib/supabase-memory'; // Importa funções de memória Supabase
import { systemPrompt } from '@/app/prompt/cgen'; // <-- Usar o prompt de conversação
// Importar Yoopta tipo se necessário para a função de execução da ferramenta
// import { type YooptaContentValue } from '@yoopta/editor';

// Manter runtime Node.js para API não-streaming
// export const runtime = 'edge'; 

const MAX_HISTORY_MESSAGES = 20;
const MAX_TOTAL_MESSAGES = 100; // Usado aqui agora
const CHAT_MODEL = process.env.OPENROUTER_CHAT_MODEL || 'mistralai/mistral-7b-instruct';
// Usar o mesmo modelo de integração definido na outra rota ou definir um aqui
// const INTEGRATION_MODEL = process.env.OPENROUTER_INTEGRATION_MODEL || 'openai/gpt-4o-mini';

// --- Remover BASE_SYSTEM_PROMPT local ---
// const BASE_SYSTEM_PROMPT = `Você é um assistente prestativo...`;
// ----------------------------------------

// --- Definir tipo OpenRouterMessage AQUI com annotations --- 
interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{ type: string; text?: string; file?: { filename: string; file_data: string } }>;
    annotations?: Array<{ // <-- Adicionado campo opcional
        type: string;
        file?: {
            hash: string;
            name: string;
            content: Array<{ type: string; text?: string; }>;
        };
        // outros tipos de anotação podem existir
    }>;
    // Outros campos como name, tool_calls, tool_call_id podem existir
}
// ---------------------------------------------------------

// Função de conversão movida para supabase-memory.ts
// function convertHistoryToOpenRouterFormat(...) { ... }

// 1. Definir a ferramenta que a IA de chat pode chamar
// const tools = [
//     {
//         "type": "function" as const, // Adicionar 'as const' para tipo literal
//         "function": {
//             "name": "propose_resume_edit",
//             "description": "Prepara uma proposta de modificação para o JSON do currículo Yoopta com base em uma instrução do usuário. Esta ferramenta *não* aplica a mudança diretamente, apenas gera a proposta para revisão posterior.",
//             "parameters": {
//                 "type": "object",
//                 "properties": {
//                     "edit_instruction": {
//                         "type": "string",
//                         "description": "A instrução detalhada do usuário sobre qual mudança fazer no currículo (ex: 'Adicione a empresa XPTO...', 'Mude meu título...', 'Remova a habilidade...')"
//                     }
//                 },
//                 "required": ["edit_instruction"]
//             }
//         }
//     }
// ];

// --- Helper para executar a lógica da ferramenta ---
// async function executeProposeEditTool(
//     instruction: string,
//     resumeContent: YooptaContentValue | null,
//     openRouterInstance: OpenRouter // Passar a instância para reutilizar
// ): Promise<{ success: boolean; message: string; proposedJson?: YooptaContentValue }> {
//     console.log(`Executing tool 'propose_resume_edit' with instruction: \"${instruction}\"`);
//     if (!resumeContent) {
//         console.error("Cannot execute tool: resumeContext is missing.");
//         return { success: false, message: "Erro interno: Contexto do currículo não disponível." };
//     }
//      if (!INTEGRATION_MODEL) {
//          console.error("Cannot execute tool: INTEGRATION_MODEL is not set.");
//          return { success: false, message: "Erro interno: Modelo de integração não configurado." };
//      }

//     try {
//         const integrationPrompt = getIntegrationPrompt({ instruction, resumeContent });
//         const response = await openRouterInstance.chat({
//             model: INTEGRATION_MODEL,
//             messages: [{ role: 'user', content: integrationPrompt }],
//             stream: false, // Queremos o JSON completo
//         });

//         const aiResponseContent = response?.choices?.[0]?.message?.content;
//         if (!aiResponseContent) {
//             throw new Error('Modelo de integração não retornou conteúdo válido.');
//         }

//         // Tentar parse do JSON retornado pela IA de integração
//         let updatedResumeContent: YooptaContentValue;
//         try {
//             const cleanedJsonResponse = aiResponseContent.replace(/\`\`\`(?:json)?/g, '').trim();
//             updatedResumeContent = JSON.parse(cleanedJsonResponse);
//             console.log("Tool execution successful: Integration model generated valid JSON.");
//             // TODO: Implementar armazenamento real do JSON proposto (ex: Supabase, KV)
//             return { success: true, message: "Proposta de edição gerada com sucesso.", proposedJson: updatedResumeContent }; // Retornar JSON
//         } catch (parseError) {
//             console.error('Tool execution failed: Integration model returned invalid JSON.', parseError, `Raw content: ${aiResponseContent}`);
//             return { success: false, message: "Erro ao processar a sugestão da IA (JSON inválido)." };
//         }
//     } catch (error: any) {
//         console.error("Error during tool execution (calling integration model):", error);
//         return { success: false, message: `Erro ao executar a ferramenta: ${error.message}` };
//     }
// }
// --- Fim do Helper ---

interface PdfField {
    filename: string;
    file_data: string;
}

// Interface para o PDF opcional no corpo da requisição
interface RequestBody {
    conversationId: string;
    message: { id: string; text: string };
    resumeContext?: any;
    pdf?: PdfField;
}

// Função auxiliar para mapear tipos se necessário (geralmente não é se forem idênticos)
// function mapMemoryMsgToClassMsg(msg: SupabaseMemoryMessage): OpenRouterClassMessage {
//     // Se os tipos forem diferentes, mapeie os campos aqui
//     // Exemplo: Se `role` for diferente:
//     // let mappedRole: OpenRouterClassMessage['role'];
//     // if (msg.role === 'tool') mappedRole = 'assistant'; // exemplo
//     // else mappedRole = msg.role;
//     return { ...msg, role: msg.role as OpenRouterClassMessage['role'] }; // Casting se forem compatíveis
// }

export async function POST(req: Request) {
    let sessionId: string;
    let userMessage: { id: string; text: string };
    let resumeContext: any;
    let pdfData: PdfField | undefined;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    try {
        const body: RequestBody = await req.json();
        sessionId = body.conversationId;
        userMessage = body.message;
        resumeContext = body.resumeContext;
        pdfData = body.pdf;

        if (!sessionId || !userMessage?.id || !userMessage?.text) {
            return NextResponse.json({ error: 'Missing conversationId or message object (id, text)' }, { status: 400 });
        }
    } catch (parseError: any) {
        console.error('Error parsing request body:', parseError);
        return NextResponse.json({ error: 'Invalid request body. JSON expected.' }, { status: 400 });
    }

    try {
        const memoryHistory = await getChatHistory(sessionId, MAX_HISTORY_MESSAGES);
        if (memoryHistory === null) throw new Error('Failed to retrieve chat history');
        
        const openRouterHistory: OpenRouterMessage[] = convertMemoryToOpenRouterFormat(memoryHistory) as OpenRouterMessage[];
        const systemPromptContent = systemPrompt({ userMessageId: userMessage.id, resumeContextForChat: resumeContext || {} });
        const systemMessage: OpenRouterMessage = { role: 'system', content: systemPromptContent };
        
        let userMessageContent: string | Array<{ type: string; text?: string; file?: PdfField }> = pdfData 
            ? [
                { type: 'text', text: userMessage.text },
                { type: 'file', file: pdfData }
              ]
            : userMessage.text;
        
        const userMessageForOpenRouter: OpenRouterMessage = { 
            role: 'user', 
            content: userMessageContent 
        };

        const messagesToSend: OpenRouterMessage[] = [
            systemMessage,
            ...openRouterHistory,
            userMessageForOpenRouter
        ];

        const openRouter = new OpenRouter();
        
        // ---- Definir parâmetros, incluindo stream: false se houver PDF ----
        const useStreaming = !pdfData; // Só usa stream se NÃO houver PDF
        console.log(`[${sessionId}] Sending request (PDF: ${!!pdfData}, Stream: ${useStreaming}) to OpenRouter (${CHAT_MODEL})`);

        const openRouterParams: OpenRouterChatParams = {
            model: CHAT_MODEL,
            messages: messagesToSend,
            stream: useStreaming, // Define stream baseado na presença de PDF
            plugins: pdfData ? [{
                id: "file-parser",
                pdf: { engine: "pdf-text" } 
            }] : undefined
        };
        // ----------------------------------------------------------------

        // ---- Chamar OpenRouter e tratar resposta (Stream ou JSON) ----
        if (useStreaming) {
             // Lógica de STREAMING (como estava antes, mas retornando stream original)
             const openRouterStream = await openRouter.chat(openRouterParams) as ReadableStream<Uint8Array>; // Cast para stream
              return new Response(openRouterStream, {
                  headers: { 
                      'Content-Type': 'text/event-stream', 
                      'Cache-Control': 'no-cache', 
                      'Connection': 'keep-alive' 
                  },
              });
        } else {
            // Lógica NÃO-STREAMING (para PDF)
            const responseJson = await openRouter.chat(openRouterParams) as OpenRouterChatResponseJson;
            
            // --- Extrair TEXTO da resposta ---
            let aiResponseText = "";
            const messageContent = responseJson.choices?.[0]?.message?.content;
            if (typeof messageContent === 'string') {
                aiResponseText = messageContent;
            } else if (Array.isArray(messageContent)) {
                // Se for um array, pegar apenas as partes de texto
                aiResponseText = messageContent
                    .filter(part => part.type === 'text' && part.text)
                    .map(part => part.text)
                    .join('\\n'); // Junta múltiplos textos com nova linha
            }
            // ---------------------------------

            // Salvar a mensagem original do usuário no histórico
            const userTextForHistory: string = userMessage.text;
            const aiTextForHistory: string = aiResponseText; // Usar a string extraída

            console.log(`[${sessionId}] Non-streaming response received from OpenRouter. AI Text Length: ${aiTextForHistory?.length}`);

            // --- Tentar extrair nome do PDF das anotações e anexar à resposta da IA --- 
            let pdfInfoBlock = '';
                         try {
                const messageWithAnnotations = responseJson.choices?.[0]?.message as OpenRouterMessage | undefined;
                const annotations = messageWithAnnotations?.annotations;
                if (Array.isArray(annotations)) {
                    const fileAnnotation = annotations.find(ann => ann.type === 'file' && ann.file?.content);
                    if (fileAnnotation?.file && Array.isArray(fileAnnotation.file.content)) {
                        const extractedPdfText = fileAnnotation.file.content
                            .filter((part: any) => part.type === 'text' && typeof part.text === 'string')
                            .map((part: any) => part.text)
                            .join('\n');
                        
                        // Tentar pegar a primeira linha não vazia como nome
                        const lines = extractedPdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                        if (lines.length > 0) {
                            const extractedName = lines[0]; // Simplista, mas um começo
                            const pdfInfoJson = JSON.stringify({ name: extractedName }); // Só o nome por enquanto
                            pdfInfoBlock = `[[PDF_INFO_START]]${pdfInfoJson}[[PDF_INFO_END]]`;
                            console.log(`[${sessionId}] Appending PDF_INFO block for name: ${extractedName}`);
                        }
                    }
                             }
            } catch (annotError) {
                console.error(`[${sessionId}] Error processing annotations for PDF_INFO block:`, annotError);
            }
            // -------------------------------------------------------------------------

            if (aiResponseText && sessionId) { // aiResponseText agora é garantidamente string
                await addChatMessages(sessionId, userTextForHistory, aiTextForHistory);
                pruneChatHistory(sessionId, MAX_TOTAL_MESSAGES).catch(err => console.error(`Pruning failed:`, err));
            }

            // Log ANTES de retornar para o frontend
            console.log(`[${sessionId}] Returning JSON to frontend:`, JSON.stringify(responseJson, null, 2)); 

            // Modificar a resposta JSON para incluir o pdfInfoBlock no content da IA, se existir
            let finalResponseJson = responseJson;
            if (pdfInfoBlock && finalResponseJson.choices?.[0]?.message) {
                // Garante que content seja string antes de anexar
                let originalContent = finalResponseJson.choices[0].message.content;
                if (typeof originalContent !== 'string') {
                    // Se for array (improvável aqui, mas seguro), converter para string
                    originalContent = Array.isArray(originalContent) ? originalContent.filter(p => p.type ==='text').map(p => p.text).join('\n') : '' ;
                }
                finalResponseJson.choices[0].message.content = originalContent + pdfInfoBlock;
                console.log(`[${sessionId}] Modified AI response content to include PDF_INFO block.`);
            }

            // Retornar o JSON completo (modificado ou não) para o frontend
            return NextResponse.json(finalResponseJson);
        }
        // -------------------------------------------------------------

    } catch (error: any) {
         console.error(`Error in /api/openrouter-chat for session ${sessionId}:`, error);
         const message = error.message || 'Failed to process chat request';
         const status = message.includes("OpenRouter API key") || message.includes("OpenRouter API Error") ? 401 : 500;
         return NextResponse.json({ error: `API Error: ${message}` }, { status: status });
    }
} 
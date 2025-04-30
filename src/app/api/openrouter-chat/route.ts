import { NextResponse } from 'next/server';
// import { kv } from '@vercel/kv'; // Removido KV
import { OpenRouter } from '@/lib/openrouter';
// import { Content } from '@google/generative-ai'; // Removido tipo Gemini
import { 
    getChatHistory, 
    addChatMessages, 
    pruneChatHistory, 
    convertMemoryToOpenRouterFormat, // Usa função de conversão específica
    type ChatMemoryMessage,
    type OpenRouterMessage // Importa tipo OpenRouter do memory lib
} from '@/lib/supabase-memory'; // Importa funções de memória Supabase
import { systemPrompt } from '@/app/prompt/cgen'; // <-- Usar o prompt de conversação
// Importar Yoopta tipo se necessário para a função de execução da ferramenta
// import { type YooptaContentValue } from '@yoopta/editor';

export const runtime = 'edge';

const MAX_HISTORY_MESSAGES = 20; // Limita histórico enviado à IA
const MAX_TOTAL_MESSAGES = 100; // Limite para pruning no DB
const CHAT_MODEL = process.env.OPENROUTER_CHAT_MODEL || 'mistralai/mistral-7b-instruct';
// Usar o mesmo modelo de integração definido na outra rota ou definir um aqui
// const INTEGRATION_MODEL = process.env.OPENROUTER_INTEGRATION_MODEL || 'openai/gpt-4o-mini';

// --- Remover BASE_SYSTEM_PROMPT local ---
// const BASE_SYSTEM_PROMPT = `Você é um assistente prestativo...`;
// ----------------------------------------

// Interface OpenRouter movida para supabase-memory.ts
// interface OpenRouterMessage { ... }

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

export async function POST(req: Request) {
    let sessionId: string;
    let userMessage: { id: string; text: string };
    let resumeContext: any;

    try {
        const body = await req.json();
        sessionId = body.conversationId;
        userMessage = body.message;
        resumeContext = body.resumeContext;

        if (!sessionId || !userMessage?.id || !userMessage?.text) {
            return NextResponse.json({ error: 'Missing conversationId or message object (id, text)' }, { status: 400 });
        }
    } catch (parseError: any) {
        console.error('Error parsing request body:', parseError);
        return NextResponse.json({ error: 'Invalid request body. JSON expected.' }, { status: 400 });
    }

    let finalAiResponseText = ""; // Para salvar no histórico

    try {
        const memoryHistory = await getChatHistory(sessionId, MAX_HISTORY_MESSAGES);
        if (memoryHistory === null) throw new Error('Failed to retrieve chat history');
        const openRouterHistory = convertMemoryToOpenRouterFormat(memoryHistory);
        const systemPromptContent = systemPrompt({ userMessageId: userMessage.id, resumeContextForChat: resumeContext || {} });
        const systemMessage: OpenRouterMessage = { role: 'system', content: systemPromptContent };
        const userMessageForOpenRouter: OpenRouterMessage = { role: 'user', content: userMessage.text };

        // Manter apenas currentMessages como messagesToSend
        const messagesToSend: OpenRouterMessage[] = [
            systemMessage,
            ...openRouterHistory,
            userMessageForOpenRouter
        ];

        const openRouter = new OpenRouter();
        console.log(`[${sessionId}] Sending message to OpenRouter (${CHAT_MODEL})`);

        // Chamada única com stream (sem tools)
        const openRouterStream = await openRouter.chat({
            model: CHAT_MODEL,
            messages: messagesToSend,
            stream: true,
        });

        // Processar Stream, Enviar SSE e Salvar no Supabase (lógica padrão)
        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                 const textDecoder = new TextDecoder();
                 const textChunk = textDecoder.decode(chunk);
                 const lines = textChunk.split('\n').filter(line => line.trim() !== '');
                 for (const line of lines) {
                     if (line.startsWith('data:')) {
                         const dataString = line.substring(5).trim();
                         if (dataString === '[DONE]') { continue; }
                         try {
                             const jsonData = JSON.parse(dataString);
                             const deltaContent = jsonData.choices?.[0]?.delta?.content;
                             if (deltaContent) {
                                 finalAiResponseText += deltaContent; // Acumula resposta completa
                                 // Envia o chunk SSE original para o frontend
                                 controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(jsonData)}\n\n`));
                             }
                         } catch (parseError) { console.warn('Could not parse SSE chunk:', dataString, parseError);}
                     }
                 }
            },
            async flush(controller) {
                // Salvar no Supabase
                await addChatMessages(sessionId, userMessage.text, finalAiResponseText);
                pruneChatHistory(sessionId, MAX_TOTAL_MESSAGES).catch(err => console.error(`Pruning failed:`, err));
            }
        });

         return new Response(openRouterStream.pipeThrough(transformStream), {
             headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
         });

    } catch (error: any) {
         console.error(`Error in /api/openrouter-chat for session ${sessionId}:`, error);
         const message = error.message || 'Failed to process chat request';
         const status = message.includes("OpenRouter API key") || message.includes("OpenRouter API Error") ? 401 : 500;
         return NextResponse.json({ error: message }, { status: status });
    }
} 
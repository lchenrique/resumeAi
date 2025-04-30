import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";
// import { kv } from '@vercel/kv'; // Removido KV
import { 
    getChatHistory, 
    addChatMessages, 
    pruneChatHistory, 
    convertMemoryToGeminiFormat, 
    type ChatMemoryMessage 
} from '@/lib/supabase-memory'; // Importa funções de memória Supabase

export const runtime = 'edge';

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const MAX_HISTORY_MESSAGES = 20; // Limita histórico enviado à IA (10 trocas)
const MAX_TOTAL_MESSAGES = 100; // Limite para pruning no DB

// --- PLACEHOLDER: Seu prompt de sistema ---
const BASE_SYSTEM_PROMPT = `Você é um assistente prestativo especializado em ajudar usuários a melhorar seus currículos. Use o contexto do currículo fornecido para dar respostas relevantes.`;
// ----------------------------------------

// Configurações de segurança para o Gemini
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function POST(req: Request) {
    if (!GEMINI_API_KEY) {
        console.error('GOOGLE_API_KEY is not set.');
        return NextResponse.json({ error: 'Server configuration error: Google API Key is missing' }, { status: 500 });
    }

    let sessionId: string; // Renomeado de conversationId
    let lastUserMessage: string;
    let resumeContext: any;
    // let userId: string | undefined; // Para quando a auth for adicionada

    try {
        const body = await req.json();
        sessionId = body.conversationId; // conversationId do frontend vira sessionId
        lastUserMessage = body.message?.text; 
        resumeContext = body.resumeContext;
        // userId = body.userId; // Exemplo: obter userId do body ou da sessão

        if (!sessionId || !lastUserMessage) { 
            return NextResponse.json({ error: 'Missing conversationId or message.text' }, { status: 400 });
        }
    } catch (parseError: any) {
        console.error('Error parsing request body:', parseError);
        return NextResponse.json({ error: 'Invalid request body. JSON expected.' }, { status: 400 });
    }

    try {
        // 1. Buscar Histórico do Supabase (formato user/assistant)
        const memoryHistory: ChatMemoryMessage[] | null = await getChatHistory(sessionId, MAX_HISTORY_MESSAGES);
        if (memoryHistory === null) {
            // Log já ocorreu em getChatHistory, retorna erro genérico
             return NextResponse.json({ error: 'Failed to retrieve chat history' }, { status: 500 });
        }
        
        // 2. Converter histórico para formato Gemini
        const geminiHistory: Content[] = convertMemoryToGeminiFormat(memoryHistory);

        // 3. Preparar Instrução do Sistema
        const systemInstruction = `${BASE_SYSTEM_PROMPT}\n\nContexto do Currículo Atual:\n\`\`\`json\n${JSON.stringify(resumeContext || {}, null, 2)}\n\`\`\``;

        // 4. Iniciar Chat Gemini com histórico limitado
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });
        const chat = model.startChat({
            history: geminiHistory, // Passa histórico convertido
            safetySettings: safetySettings,
        });

        // 5. Enviar Mensagem e Obter Stream
        console.log(`Sending message to Gemini for session ${sessionId}`);
        const result = await chat.sendMessageStream(lastUserMessage);

        // 6. Processar Stream, Enviar SSE e Salvar no Supabase
        let fullAiResponse = ""; 
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const textChunk = chunk.text();
                        if (textChunk) {
                            fullAiResponse += textChunk; 
                            const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: textChunk } }] })}\n\n`;
                            controller.enqueue(encoder.encode(sseData));
                        }
                    }
                    
                    // Stream terminou, salvar no Supabase
                    console.log(`Attempting to save messages to Supabase for session ${sessionId}`);
                    const saveSuccess = await addChatMessages(sessionId, lastUserMessage, fullAiResponse /*, userId */);
                    if (!saveSuccess) {
                        console.warn(`Failed to save messages for session ${sessionId}`);
                        // Não necessariamente um erro fatal para o usuário, mas logado.
                    }

                    // Chamar Pruning (Opcional, rodar em background)
                    console.log(`Attempting to prune history for session ${sessionId}`);
                    pruneChatHistory(sessionId, MAX_TOTAL_MESSAGES).catch(err => {
                        console.error(`Background pruning failed for session ${sessionId}:`, err);
                    });

                } catch (streamError: any) {
                    console.error(`Error processing Gemini stream for session ${sessionId}:`, streamError);
                    const errorMessage = `data: ${JSON.stringify({ error: 'Error processing AI response stream' })}\n\n`;
                    controller.enqueue(encoder.encode(errorMessage));
                } finally {
                    controller.close();
                }
            },
        });

        // 7. Retornar o Stream SSE 
        return new Response(stream, {
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
        });

    } catch (error: any) {
        console.error(`Error in /api/gemini-chat for session ${sessionId}:`, error);
        const message = error.message || 'Failed to process chat request';
        const status = message.includes("API key") ? 401 : 500;
        return NextResponse.json({ error: message }, { status: status });
    }
} 
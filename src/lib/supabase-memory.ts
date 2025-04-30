import { createClient } from '@supabase/supabase-js';
import { type Content } from '@google/generative-ai'; // Usado para conversão

// Tipos para clareza interna
export interface ChatMemoryMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase URL or Service Key environment variable is not set.");
    // Lançar erro pode ser melhor em produção
    // throw new Error("Supabase URL or Service Key environment variable is not set.");
}

// Cliente Supabase para o Servidor (usando Service Key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const TABLE_NAME = 'agent_memory';

/**
 * Busca as últimas N mensagens de uma sessão de chat específica.
 * Adaptado para não exigir userId por enquanto.
 * @param sessionId - O ID da sessão de chat.
 * @param limit - O número máximo de mensagens a serem retornadas (padrão 20).
 * @returns Uma array de mensagens ordenadas da mais antiga para a mais nova, ou null em caso de erro.
 */
export async function getChatHistory(
    sessionId: string,
    limit: number = 20
): Promise<ChatMemoryMessage[] | null> {
    if (!sessionId) {
        console.error('Session ID is required for getChatHistory');
        return null;
    }
    console.log(`Fetching history for session: ${sessionId}, limit: ${limit}`);
    try {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('role, content')
            // .eq('user_id', userId) // Removido filtro de usuário por enquanto
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false }) // Mais recentes primeiro
            .limit(limit);

        if (error) {
            // Log específico se for erro de RLS (pode acontecer se user_id for usado sem auth)
            if(error.message.includes('row level security')) {
                 console.error('RLS Error fetching chat history (Check Policies/Auth):', error);
            } else {
                 console.error('Error fetching chat history from Supabase:', error);
            }
            return null;
        }

        console.log(`Fetched ${data?.length || 0} messages for session ${sessionId}`);
        // Reverte para ordem cronológica
        return data?.reverse().map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
        })) || []; // Retorna array vazio se data for null

    } catch (err) {
        console.error('Unexpected error in getChatHistory:', err);
        return null;
    }
}

/**
 * Adiciona a mensagem do usuário e a resposta do assistente ao histórico no Supabase.
 * Adaptado para não exigir userId por enquanto.
 * @param sessionId - O ID da sessão de chat.
 * @param userMessageContent - O conteúdo da mensagem do usuário.
 * @param assistantMessageContent - O conteúdo da resposta do assistente.
 * @param userId - (Opcional) O ID do usuário autenticado (para quando a auth for adicionada).
 * @returns true se sucesso, false caso contrário.
 */
export async function addChatMessages(
    sessionId: string,
    userMessageContent: string,
    assistantMessageContent: string,
    userId?: string // Adicionado opcionalmente para futura integração
): Promise<boolean> {
     if (!sessionId || !userMessageContent || !assistantMessageContent) {
        console.error('Session ID, user message, and assistant message are required for addChatMessages');
        return false;
    }

    // Define o user ID a ser usado (placeholder ou real)
    // AJUSTE ESTE UUID SE A SUA TABELA NÃO PERMITIR NULL OU TIVER OUTRO PADRÃO
    const currentUserId = userId || '00000000-0000-0000-0000-000000000000';

    try {
        const messagesToInsert = [
            {
                user_id: currentUserId,
                session_id: sessionId,
                role: 'user',
                content: userMessageContent
            },
            {
                user_id: currentUserId,
                session_id: sessionId,
                role: 'assistant',
                content: assistantMessageContent
            }
        ];

        const { error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert(messagesToInsert);

        if (error) {
            console.error('Error inserting chat messages to Supabase:', error);
            return false;
        }

        console.log(`Added 2 messages to history for session ${sessionId}`);
        return true;

    } catch (err) {
        console.error('Unexpected error in addChatMessages:', err);
        return false;
    }
}

/**
 * SQL para criar a função PostgreSQL que deleta mensagens antigas de uma sessão.
 * Adaptado para não exigir userId.
 * @param functionName O nome da função a ser criada (ex: prune_session_messages)
 * @returns O comando SQL CREATE FUNCTION
 */
export function createPruningFunctionSQL(functionName: string = 'prune_session_messages'): string {
 return `\n CREATE OR REPLACE FUNCTION ${functionName}(\n     -- _user_id UUID, -- Removido por enquanto\n     _session_id TEXT,\n     _max_messages INT\n )\n RETURNS void\n LANGUAGE plpgsql\n SECURITY DEFINER\n AS $$\n DECLARE\n     message_count INT;\n     messages_to_delete_count INT;\n BEGIN\n     -- Conta o total de mensagens na sessão\n     SELECT count(*)\n     INTO message_count\n     FROM public.agent_memory\n     WHERE session_id = _session_id; -- Removido filtro de usuário\n

     messages_to_delete_count := message_count - _max_messages;\n

     IF messages_to_delete_count > 0 THEN\n         WITH oldest_messages AS (\n             SELECT id\n             FROM public.agent_memory\n             WHERE session_id = _session_id -- Removido filtro de usuário\n             ORDER BY created_at ASC\n             LIMIT messages_to_delete_count\n         )\n         DELETE FROM public.agent_memory\n         WHERE id IN (SELECT id FROM oldest_messages);\n

         RAISE LOG 'Pruned % messages from session %', messages_to_delete_count, _session_id;\n     END IF;\n END;\n $$;\n `;
}

/**
 * Chama a função RPC no Supabase para limpar mensagens antigas.
 * Adaptado para não exigir userId.
 * REQUER que você tenha criado a função no Supabase usando createPruningFunctionSQL().
 * @param sessionId - O ID da sessão.
 * @param maxMessages - O número máximo de mensagens a serem mantidas (padrão 100).
 * @param functionName - O nome da função RPC criada no Supabase.
 * @returns true se sucesso, false caso contrário.
 */
export async function pruneChatHistory(
    sessionId: string,
    maxMessages: number = 100,
    functionName: string = 'prune_session_messages'
): Promise<boolean> {
     if (!sessionId) {
        console.error('Session ID is required for pruneChatHistory');
        return false;
    }
    try {
        const { error } = await supabaseAdmin.rpc(functionName, {
            // _user_id: userId, // Removido
            _session_id: sessionId,
            _max_messages: maxMessages
        });

        if (error) {
            console.error(`Error calling RPC function ${functionName} in Supabase:`, error);
            return false;
        }
        console.log(`Pruning check complete for session ${sessionId}`);
        return true;
    } catch (err) {
        console.error('Unexpected error in pruneChatHistory:', err);
        return false;
    }
}

/**
 * Converte o histórico do formato da memória (user/assistant) para o formato Gemini (user/model).
 * @param memoryHistory - Array de mensagens do tipo ChatMemoryMessage.
 * @returns Array de mensagens no formato Content do Gemini.
 */
export function convertMemoryToGeminiFormat(memoryHistory: ChatMemoryMessage[]): Content[] {
    return memoryHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));
}

/**
 * Converte o histórico do formato da memória (user/assistant) para o formato OpenRouter.
 * @param memoryHistory - Array de mensagens do tipo ChatMemoryMessage.
 * @returns Array de mensagens no formato OpenRouterMessage.
 */
export interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | null;
    tool_call_id?: string;
    tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string; } }[];
}
export function convertMemoryToOpenRouterFormat(memoryHistory: ChatMemoryMessage[]): OpenRouterMessage[] {
     // Mapeia garantindo que o tipo de retorno corresponda à interface OpenRouterMessage completa
     return memoryHistory.map(msg => ({
        role: msg.role, // Mantém 'user' ou 'assistant'
        content: msg.content // Assume que ChatMemoryMessage sempre tem content como string
        // Não adicionamos tool_call_id ou tool_calls aqui, pois vêm da memória simples
    }));
} 
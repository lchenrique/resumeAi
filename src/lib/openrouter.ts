// Importa os tipos corretos de OpenAI, se necessário para o Stream

// Tipo para PDF Data (mantido do exemplo da API)
interface PdfField {
    filename: string;
    file_data: string;
}

// Tipos específicos do OpenRouter atualizados
export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'; // Remover 'tool' se não usar tools
  content: string | null | Array<{ type: string; text?: string; file?: PdfField }>; // Aceita array para file
}

// Ajustar tipo de retorno para acomodar JSON ou Stream
export interface OpenRouterChatResponseJson {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenRouterMessage; 
    finish_reason: string | null;
  }>;
  usage: { 
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  // Adicionar outros campos se necessário
}

// Parâmetros não mudam
export interface OpenRouterChatParams {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  plugins?: Array<{ id: string; [key: string]: any }>;
  [key: string]: any; 
}

export class OpenRouter {
  private apiKey: string;
  private baseURL: string = 'https://openrouter.ai/api/v1';
  private siteUrl: string = 'http://localhost:3000'; // Trocar por seu URL
  private appName: string = 'ResumeAI';

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not found in environment variables');
    }
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  // Ajustar tipo de retorno da função
  async chat(params: OpenRouterChatParams): Promise<ReadableStream<Uint8Array> | OpenRouterChatResponseJson> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.appName,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('OpenRouter API Error:', response.status, errorBody);
        // Tentar parsear como JSON para obter detalhes do erro
        try {
            const jsonError = JSON.parse(errorBody);
            throw new Error(`OpenRouter API Error (${response.status}): ${jsonError.error?.message || errorBody}`);
        } catch {
        throw new Error(`OpenRouter API Error (${response.status}): ${errorBody}`);
        }
      }

      // ---- Decidir o que retornar baseado no stream ----
      if (params.stream) {
        if (!response.body) {
          throw new Error('No response body from OpenRouter when stream was requested');
        }
        return response.body; // Retorna o stream
      } else {
        const jsonData = await response.json();
        return jsonData as OpenRouterChatResponseJson; // Retorna o JSON completo
      }
      // ---------------------------------------------------

    } catch (error) {
      console.error('Failed to fetch from OpenRouter:', error);
      throw error;
    }
  }
} 
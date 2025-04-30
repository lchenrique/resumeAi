// Tipo para a definição de uma ferramenta (simplificado, ajuste conforme necessário)
interface OpenRouterTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: object; // Pode ser mais específico com JSON Schema
  };
}

interface OpenRouterChatParams {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant' | 'tool'; content: string | null; tool_call_id?: string }[];
  stream?: boolean;
  tools?: OpenRouterTool[];
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
}

export class OpenRouter {
  private apiKey: string;
  private refererUrl?: string;
  private siteName?: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.refererUrl = process.env.OPENROUTER_REFERER_URL;
    this.siteName = process.env.OPENROUTER_X_TITLE;

    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY environment variable is not set.');
    }
  }

  async chat({ model, messages, stream = false, tools, tool_choice }: OpenRouterChatParams): Promise<ReadableStream | any> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is missing.');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (this.refererUrl) {
      headers['HTTP-Referer'] = this.refererUrl;
    }
    if (this.siteName) {
      headers['X-Title'] = this.siteName;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: stream,
          ...(tools && { tools: tools }),
          ...(tool_choice && { tool_choice: tool_choice }),
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API Error (${response.status}): ${errorBody}`);
      }

      if (stream) {
        if (!response.body) {
            throw new Error('Response body is null despite requesting stream.')
        }
        return response.body;
      } else {
        return await response.json();
      }

    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      throw error; // Re-throw o erro para ser tratado no chamador
    }
  }
} 
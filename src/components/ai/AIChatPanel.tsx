'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { YooptaContentValue, YooptaBlockData } from '@yoopta/editor';
import { Bot, Sparkles, Send, MoreHorizontal, Mic, Globe, Upload, Lightbulb, Search, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';

// Marcadores e textos para os COMANDOS JSON
const COMMANDS_START_MARKER = '[[COMMANDS_START]]';
const COMMANDS_END_MARKER = '[[COMMANDS_END]]';
// Textos de status como strings simples
const COMMANDS_PLACEHOLDER_TEXT = '\n\n*-- Gerando comandos de edição... --*\n';
const COMMANDS_READY_TEXT = '\n\n*Comandos prontos para aplicar.*\n';
const COMMANDS_ERROR_TEXT = '\n\n*Erro ao processar comandos de edição.*\n';

// Interface para os Comandos de Edição
type BaseCommand = { action: 'add' | 'update' | 'delete' | 'move'; };
export type AddCommand = BaseCommand & { action: 'add'; new_order: number; block_data: YooptaBlockData; };
export type UpdateCommand = BaseCommand & { action: 'update'; block_id: string; new_value: YooptaContentValue[string]['value']; }; // new_value é o array value
export type DeleteCommand = BaseCommand & { action: 'delete'; block_id: string; };
export type MoveCommand = BaseCommand & { action: 'move'; block_id: string; new_order: number; };
export type ResumeEditCommand = AddCommand | UpdateCommand | DeleteCommand | MoveCommand;

// --- Função auxiliar para validar o ARRAY DE COMANDOS JSON ---
const isValidCommandArray = (json: any): json is ResumeEditCommand[] => {
  if (!Array.isArray(json)) {
    console.warn('isValidCommandArray: Falhou - Não é um array.');
    return false;
  }
  if (json.length === 0) {
    console.warn('isValidCommandArray: Falhou - Array está vazio.');
    // Permitir array vazio? Depende. Por enquanto, vamos exigir pelo menos um comando.
    return false;
  }

  // Validar cada comando no array
  for (const command of json) {
    if (!command || typeof command !== 'object') {
      console.warn('isValidCommandArray: Falhou - Item no array não é um objeto:', command);
      return false;
    }
    const action = command.action;
    if (!action || !['add', 'update', 'delete', 'move'].includes(action)) {
      console.warn('isValidCommandArray: Falhou - Ação inválida ou ausente:', command);
      return false;
    }
    // Adicionar validações mais específicas para cada tipo de ação (block_id, new_order, etc.)
    // Exemplo simples:
    if ((action === 'update' || action === 'delete' || action === 'move') && typeof command.block_id !== 'string') {
      console.warn(`isValidCommandArray: Falhou - Falta block_id para ação ${action}:`, command);
      return false;
    }
    if ((action === 'add' || action === 'move') && typeof command.new_order !== 'number') {
       console.warn(`isValidCommandArray: Falhou - Falta new_order para ação ${action}:`, command);
       return false;
    }
    // ... (poderíamos adicionar validação para block_data em 'add' e new_value em 'update' aqui)
  }

  console.log('isValidCommandArray: Passou - Estrutura do array de comandos parece válida.');
  return true;
};

// --- Função auxiliar para validar YooptaContentValue (Manter se necessário em outro lugar, ou remover) ---
/*
const isValidYooptaContent = (json: any): json is YooptaContentValue => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    console.warn('isValidYooptaContent: Falhou - Não é um objeto válido.');
    return false;
  }

  const blockIds = Object.keys(json);
  if (blockIds.length === 0) {
    console.warn('isValidYooptaContent: Falhou - Objeto está vazio.');
    return false; // O objeto não pode estar vazio
  }

  // Verificar a estrutura do primeiro bloco como amostra
  const firstBlockKey = blockIds[0];
  const firstBlock = json[firstBlockKey];

  if (
    !firstBlock || 
    typeof firstBlock !== 'object' || 
    typeof firstBlock.id !== 'string' || 
    typeof firstBlock.type !== 'string' || 
    typeof firstBlock.meta !== 'object' || 
    !firstBlock.meta ||
    typeof firstBlock.meta.order !== 'number' || // Verificar uma propriedade essencial de meta
    !Array.isArray(firstBlock.value) || // value deve ser um array
    firstBlock.value.length === 0 || // value não pode ser vazio (geralmente)
    typeof firstBlock.value[0] !== 'object' || // O primeiro elemento de value deve ser um objeto
    !firstBlock.value[0] ||
    typeof firstBlock.value[0].id !== 'string' ||
    typeof firstBlock.value[0].type !== 'string' ||
    !Array.isArray(firstBlock.value[0].children) // children deve ser um array
  ) {
    console.warn('isValidYooptaContent: Falhou - Estrutura do primeiro bloco inválida.', firstBlock);
    return false;
  }
  
  console.log('isValidYooptaContent: Passou - Estrutura parece válida.');
  return true; // Se chegou até aqui, consideramos válido
};
*/

// --- Função para limpar JSONs antigos do estado (Adaptar para Comandos) ---
const cleanupProposedCommands = (
  proposedCommands: Record<string, ResumeEditCommand[]>,
  maxAgeMs: number = 30 * 60 * 1000 // 30 minutos
): Record<string, ResumeEditCommand[]> => {
  const now = Date.now();
  const cleaned: Record<string, ResumeEditCommand[]> = {};
  Object.entries(proposedCommands).forEach(([msgId, commands]) => {
    const msgTime = parseInt(msgId.split('-')[0], 10);
    if (now - msgTime < maxAgeMs) {
      cleaned[msgId] = commands;
    }
  });
  return cleaned;
};

// --- Função para debug de posições específicas em uma string JSON ---
const debugJsonPosition = (jsonString: string, position: number): void => {
  // Verificação de segurança 
  if (!jsonString || typeof position !== 'number' || position < 0 || position >= jsonString.length) {
    console.log('debugJsonPosition: Posição inválida ou string vazia');
    return;
  }
  
  // Encontrar o contexto ao redor da posição
  const contextRadius = 70; // Aumentar um pouco o raio para mais contexto
  const startPos = Math.max(0, position - contextRadius);
  const endPos = Math.min(jsonString.length, position + contextRadius);
  
  console.log('=================== ERRO DE JSON - DETALHES ===================');
  console.log(`Posição do erro: ${position}`);
  console.log(`Caractere na posição: '${jsonString[position]}'`);
  console.log(`Codigo ASCII: ${jsonString.charCodeAt(position)}`);
  
  // Criar uma string de contexto antes e depois, com marcador do erro
  const contextBefore = jsonString.substring(startPos, position);
  const errorChar = jsonString[position];
  const contextAfter = jsonString.substring(position + 1, endPos);
  
  console.log('--- CONTEXTO AO REDOR DO ERRO ---');
  console.log(`${contextBefore}>>${errorChar}<<${contextAfter}`);
  console.log('-'.repeat(contextBefore.length) + '^^^^' + '-'.repeat(contextAfter.length)); // Indicador visual
  
  // Tentar encontrar o início e fim do array/objeto mais próximo
  const lastOpenBracket = jsonString.lastIndexOf('[', position);
  const lastOpenBrace = jsonString.lastIndexOf('{', position);
  const firstCloseBracket = jsonString.indexOf(']', position);
  const firstCloseBrace = jsonString.indexOf('}', position);
  
  console.log('--- Análise Estrutural Próxima ---');
  if (lastOpenBracket > lastOpenBrace && lastOpenBracket !== -1) {
      console.log(`Provavelmente dentro de um ARRAY iniciado na posição ${lastOpenBracket}.`);
      if (firstCloseBracket !== -1) {
          console.log(`Array parece terminar na posição ${firstCloseBracket}.`);
          // Tentar mostrar elemento anterior se possível (simplificado)
          const potentialCommaBefore = jsonString.lastIndexOf(',', position - 1);
          if (potentialCommaBefore > lastOpenBracket) {
              console.log('Contexto do elemento anterior (aprox.):', jsonString.substring(potentialCommaBefore + 1, position).trim());
          }
      } else {
          console.log('Não foi possível encontrar o fechamento `]` deste array após o erro.');
      }
  } else if (lastOpenBrace > lastOpenBracket && lastOpenBrace !== -1) {
      console.log(`Provavelmente dentro de um OBJETO iniciado na posição ${lastOpenBrace}.`);
       if (firstCloseBrace !== -1) {
           console.log(`Objeto parece terminar na posição ${firstCloseBrace}.`);
       } else {
           console.log('Não foi possível encontrar o fechamento `}` deste objeto após o erro.');
       }
  } else {
      console.log('Não foi possível determinar claramente se está dentro de um array ou objeto próximo.');
  }
  
  // Contar ocorrências de chaves e colchetes para debugar
  const openBraces = (jsonString.match(/\{/g) || []).length;
  const closeBraces = (jsonString.match(/\}/g) || []).length;
  const openBrackets = (jsonString.match(/\[/g) || []).length;
  const closeBrackets = (jsonString.match(/\]/g) || []).length;
  console.log(`Contagem Global: {} ${openBraces}/${closeBraces} (Balanço: ${openBraces - closeBraces}), [] ${openBrackets}/${closeBrackets} (Balanço: ${openBrackets - closeBrackets})`);
  
  console.log('--- JSON COMPLETO PARA INSPEÇÃO (pode ser longo) ---');
  // Considerar truncar se for muito grande para o log
  if (jsonString.length > 20000) {
      console.log('(JSON truncado por ser muito longo)');
      console.log(jsonString.substring(0, 10000) + '\n... [MEIO OMITIDO] ...\n' + jsonString.substring(jsonString.length - 10000));
  } else {
      console.log(jsonString);
  }
  console.log('============================================================');
};

// --- Função para limpar string JSON com problemas ---
const cleanupJsonString = (jsonString: string): string => {
  let cleaned = jsonString;

  // 1. Remover caracteres invisíveis ou não-printáveis PRIMEIRO
  // Isso é importante para resolver o problema específico mencionado pelo usuário
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '');
  
  // 2. Trim whitespace
  cleaned = cleaned.trim();

  // 3. Remover vírgulas extras (antes de tentar parsear sub-partes)
  cleaned = cleaned.replace(/,\s*}/g, '}');
  cleaned = cleaned.replace(/,\s*\]/g, ']');

  // 4. Tentar encontrar o último JSON válido (para remover lixo no final)
  const lastValidJsonCheck = (str: string): string => {
    console.log('lastValidJsonCheck: Iniciando verificação. Tamanho inicial:', str.length);
    try {
      // Check if the whole string is already valid
      JSON.parse(str);
      // Se o JSON inteiro já é válido, não há lixo no final
      console.log('lastValidJsonCheck: JSON inicial já é válido. Nenhum lixo removido.');
      return str; 
    } catch (initialError) {
      // Se não for válido, tentar encontrar o maior prefixo válido
      console.log('lastValidJsonCheck: JSON completo inválido, buscando prefixo válido...');
      for (let i = str.length - 1; i > 0; i--) {
        const subStr = str.substring(0, i);
        try {
          // Adicionar uma heurística simples: o prefixo deve terminar com } ou ]
          const trimmedSubStr = subStr.trim();
          if (trimmedSubStr.endsWith('}') || trimmedSubStr.endsWith(']')) {
            JSON.parse(trimmedSubStr); // Tenta parsear o prefixo (já trimado)
            // Se chegou aqui, encontramos o maior prefixo JSON válido
            console.log(`lastValidJsonCheck: Encontrado prefixo JSON válido de tamanho ${trimmedSubStr.length}. Removendo ${str.length - trimmedSubStr.length} caracteres finais.`);
            // Log dos caracteres removidos (se houver)
            const removedPart = str.substring(trimmedSubStr.length);
            if (removedPart.length > 0) {
                console.log(`lastValidJsonCheck: Caracteres removidos (${removedPart.length}): '${removedPart.substring(0, 100)}${removedPart.length > 100 ? '...': ''}'`); // Mostrar mais caracteres removidos
            }
            return trimmedSubStr; // Retorna o prefixo válido encontrado
          }
        } catch (e) {
          // Continua tentando com substrings menores
        }
      }
    }
    // Se nenhum prefixo válido foi encontrado, retorna a string original (após limpeza inicial)
    console.log('lastValidJsonCheck: Não foi possível encontrar um prefixo JSON válido. Retornando string como estava.');
    return str; 
  };
  
  // Aplicar a verificação para remover lixo no final
  const potentiallyValidJson = lastValidJsonCheck(cleaned);
  
   // Verificar se a string resultante é realmente parseável antes de continuar
  let isPotentiallyValid = false;
  try {
    JSON.parse(potentiallyValidJson);
    cleaned = potentiallyValidJson; // Confirma que é válido
    isPotentiallyValid = true;
    console.log('cleanupJsonString: JSON após lastValidJsonCheck é válido.');
  } catch (e) {
     console.warn('cleanupJsonString: JSON após lastValidJsonCheck ainda é inválido. Prosseguindo com outras limpezas na string original (pré-lastValidJsonCheck).', e);
     // Se lastValidJsonCheck retornou algo inválido, continuamos com a versão 'cleaned' anterior
     // Isso pode acontecer se a função não encontrou um prefixo válido
     isPotentiallyValid = false;
  }


  // 5. Balancear chaves (SOMENTE se o JSON não foi validado por lastValidJsonCheck,
  // ou se a validação falhou, para evitar quebrar um JSON já válido)
  // Isto é mais arriscado e pode alterar a estrutura.
  if (!isPotentiallyValid) {
      console.log('cleanupJsonString: Tentando balancear chaves...');
      const openBraces = (cleaned.match(/\{/g) || []).length;
      const closeBraces = (cleaned.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        console.log(`cleanupJsonString: Desbalanceamento detectado: ${openBraces} vs ${closeBraces}. Adicionando ${openBraces - closeBraces} chaves.`);
        cleaned += '}'.repeat(openBraces - closeBraces);
      } else if (closeBraces > openBraces) {
        console.log(`cleanupJsonString: Excesso de chaves detectado: ${closeBraces} vs ${openBraces}. Tentando remover.`);
        let temp = cleaned;
        for (let i = 0; i < closeBraces - openBraces; i++) {
          const lastCloseBrace = temp.lastIndexOf('}');
          if (lastCloseBrace !== -1) {
            temp = temp.substring(0, lastCloseBrace) + temp.substring(lastCloseBrace + 1);
          }
        }
        // Verificar se a remoção ajudou
        try {
          JSON.parse(temp);
          console.log('cleanupJsonString: JSON corrigido após remover chaves extras.');
          cleaned = temp;
        } catch(e) {
          console.log('cleanupJsonString: Tentativa de remover chaves extras falhou. Mantendo como estava antes da remoção.');
          // Reverte se não validou
        }
      }
  } else {
      console.log('cleanupJsonString: Pulando balanceamento de chaves pois o JSON já é considerado válido após lastValidJsonCheck.');
  }

  // 6. Corrigir padrões específicos (menos provável, mas seguro)
  // Aplicar apenas se o JSON ainda não for válido, ou se a heurística for segura
  try {
      JSON.parse(cleaned); // Verifica se já está válido
  } catch {
      console.log('cleanupJsonString: JSON ainda inválido, tentando correções de padrões específicos...');
      const unexpectedBracketPattern = /}\s*,?\s*]\s*}\s*}/;
      if (unexpectedBracketPattern.test(cleaned)) {
        console.log('cleanupJsonString: Detectado padrão de colchetes extras no final! Corrigindo.');
        cleaned = cleaned.replace(/}\s*,?\s*]\s*}\s*}$/, '}}');
      }
      const badArrayEndPattern = /}\s*,?\s*]\s*}\s*]$/;
      if (badArrayEndPattern.test(cleaned)) {
        console.log('cleanupJsonString: Detectado padrão de array mal terminado! Corrigindo.');
        cleaned = cleaned.replace(badArrayEndPattern, '}}');
      }
  }
  
  // 7. Tentativa final de parse e log de erro se falhar
  try {
    JSON.parse(cleaned);
    console.log("cleanupJsonString: Limpeza finalizada, JSON resultante é válido.");
  } catch(finalError) {
    console.error('cleanupJsonString: ERRO FINAL - JSON inválido após todas as tentativas de limpeza:', finalError);
    console.error('JSON Final (Inválido):', cleaned);
     // Opcional: retornar a string original se tudo falhou?
     // return jsonString; 
  }

  return cleaned;
};

// Função auxiliar para verificar se uma string é JSON válido
const isJsonParsable = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// --- Definição do IconButton (Helper) ---
function IconButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-3 py-1 rounded-full bg-card text-gray-700 hover:bg-gray-200 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}

// --- Definição do ChatInput Adaptado ---
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: () => void;
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

function ChatInput({
  value,
  onChange,
  onSendMessage,
  onSuggestionClick,
  isLoading,
  isDisabled,
}: ChatInputProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled && value.trim() !== '') {
        onSendMessage();
      }
    }
  };

  return (
    <div className="bg-background p-4 rounded-2xl flex flex-col gap-3 shadow-md border border-gray-200">
      <Textarea
        placeholder="Peça ajuda para melhorar seu currículo com IA"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className="w-full bg-transparent p-3 rounded-xl text-gray-800 placeholder-gray-500 outline-none resize-none min-h-[80px] focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 relative">
        <div className="flex flex-wrap gap-2 items-center">
          <IconButton
            icon={<Lightbulb size={16} />}
            label="Sugestões"
            onClick={() => onSuggestionClick('Me dê sugestões para melhorar a seção de experiência.')}
            disabled={isDisabled}
          />
          <IconButton
            icon={<Search size={16} />}
            label="Palavras-chave"
            onClick={() =>
              onSuggestionClick('Quais palavras-chave são importantes para a vaga de [Nome da Vaga]?')
            }
            disabled={isDisabled}
          />
          <IconButton icon={<Globe size={16} />} label="Buscar vagas" disabled={isDisabled} />
          <IconButton icon={<Upload size={16} />} label="Anexar" disabled={isDisabled} />
          <div className="relative">
            <IconButton
              icon={<MoreHorizontal size={16} />}
              label="Mais"
              onClick={() => setShowMoreOptions((prev) => !prev)}
              disabled={isDisabled}
            />
            {showMoreOptions && (
              <div className="absolute bottom-full left-0 mb-2 bg-background border border-gray-300 rounded-md shadow-lg p-2 z-20 w-60">
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="hover:bg-card p-2 rounded cursor-pointer">Ver histórico de edições</li>
                  <li className="hover:bg-card p-2 rounded cursor-pointer">Salvar como modelo</li>
                  <li className="hover:bg-card p-2 rounded cursor-pointer">Análise de perfil LinkedIn</li>
                  <li className="hover:bg-card p-2 rounded cursor-pointer">Gerar versão para vaga</li>
                  <li className="hover:bg-card p-2 rounded cursor-pointer">Refazer última sugestão</li>
                  <li className="hover:bg-card p-2 rounded cursor-pointer">Preferências</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={<Mic size={18} />} disabled={isDisabled} />
          <button
            onClick={onSendMessage}
            disabled={isDisabled || value.trim() === ''}
            className={`p-2 rounded-lg text-white transition-colors ${
              isDisabled || value.trim() === ''
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Interface de Mensagem ---
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// --- Interface de Props do Componente ---
interface AIChatPanelProps {
  resumeContent: Record<string, any>;
  onApplyCommands: (commands: ResumeEditCommand[]) => void;
}

// --- Componente Principal ---
const MAX_MESSAGES = 50; // Definir um limite

const AIChatPanel: React.FC<AIChatPanelProps> = ({ resumeContent, onApplyCommands }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposedCommands, setProposedCommands] = useState<Record<string, ResumeEditCommand[]>>({});
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedApiModel, setSelectedApiModel] = useState<'gemini' | 'openrouter'>('openrouter');

  // Inicializar conversationId
  useEffect(() => {
    setConversationId(crypto.randomUUID());
  }, []);

  // Scroll automático para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para enviar mensagem e processar resposta
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading || !conversationId) return;
    const userMessageText = inputValue;
    setInputValue('');
    const newUserMessage: Message = { id: `${Date.now()}-user`, text: userMessageText, sender: 'user' };
    const aiMessageId = `${Date.now()}-ai`;
    const aiPlaceholderMessage: Message = { id: aiMessageId, text: '', sender: 'ai' };

    // Adicionar novas mensagens e limitar o histórico
    setMessages((prev) => {
       const updatedMessages = [...prev, newUserMessage, aiPlaceholderMessage];
       if (updatedMessages.length > MAX_MESSAGES) {
           // Remove o número excedente de mensagens do início (as mais antigas)
           return updatedMessages.slice(updatedMessages.length - MAX_MESSAGES);
       }
       return updatedMessages;
    });

    setIsLoading(true);
    let accumulatedText = '';
    let accumulatedCommandString = '';
    let isReceivingCommands = false;
    let commandParseError = false;
    let commandEndMarkerFound = false;
    let buffer = '';
    let currentAiTextMessage = '';

    try {
      const apiEndpoint = selectedApiModel === 'gemini' ? '/api/gemini-chat' : '/api/openrouter-chat';
      console.log(`Enviando mensagem via ${selectedApiModel} para ${apiEndpoint}`);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: { text: userMessageText, id: newUserMessage.id },
          resumeContext: resumeContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Erro na API: ${response.statusText}` }));
        throw new Error(errorData.error || `Erro na API: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Nenhum corpo de resposta da API para streaming');
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (!value) continue;
        buffer += value;

        // Processar buffer como SSE
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Manter o último fragmento incompleto no buffer

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const dataString = line.slice(5).trim();

          if (dataString === '[DONE]') {
            if (isReceivingCommands && !commandParseError && accumulatedCommandString.trim()) {
              try {
                // Limpar string de comandos antes de parsear
                const finalCleanedCommands = cleanupJsonString(accumulatedCommandString);
                const parsedCommands = JSON.parse(finalCleanedCommands);

                if (isValidCommandArray(parsedCommands)) {
                  setProposedCommands((prev) => ({
                    ...cleanupProposedCommands(prev),
                    [aiMessageId]: parsedCommands,
                  }));
                  // Atualiza a mensagem final com o texto de sucesso
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_READY_TEXT } : msg
                    )
                  );
                } else {
                  commandParseError = true;
                  console.warn('Array de comandos parseado, mas formato inválido.', parsedCommands);
                  // Atualiza a mensagem final com o texto de erro de formato
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_ERROR_TEXT + '*Formato de comandos inválido.*\n' } : msg
                    )
                  );
                }
              } catch (e) {
                console.error('Erro ao parsear Array de Comandos no [DONE]:', e);
                const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
                const positionMatch = errorMessage.match(/position (\d+)/);
                const errorPosition = positionMatch ? parseInt(positionMatch[1], 10) : null;
                if (errorPosition !== null) {
                  debugJsonPosition(accumulatedCommandString, errorPosition);
                } else {
                  console.log('Array de Comandos bruto no [DONE] (sem posição):', accumulatedCommandString);
                }
                commandParseError = true;
                // Atualiza a mensagem final com o texto de erro de parse
                 setMessages((prev) =>
                   prev.map((msg) =>
                     msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_ERROR_TEXT + `*Comandos inválidos (erro de sintaxe).*\n` } : msg
                   )
                 );
              }
            } else {
                 // Se não estava recebendo comandos ou já houve erro, apenas finaliza com o texto acumulado
                 // ou o placeholder/texto de erro já definido
                 setMessages((prev) =>
                    prev.map((msg) => {
                        if (msg.id === aiMessageId) {
                            // Se ainda tem o texto vazio do placeholder inicial, usa o texto acumulado + erro (se houver)
                            if (msg.text === '') { 
                                return { ...msg, text: currentAiTextMessage + (commandParseError ? COMMANDS_ERROR_TEXT : '') };
                            }
                            // Se já tinha texto (incluindo erro/sucesso vindo dos catches), mantém
                            return msg;
                        }
                        return msg;
                    })
                 );
            }
            break; // Sai do loop while
          }

          try {
            const jsonData = JSON.parse(dataString);
            // Suporte para diferentes formatos de delta
            const deltaContent =
              jsonData.choices?.[0]?.delta?.content || // Parasail, OpenRouter
              jsonData.choices?.[0]?.text || // Gemini (se aplicável)
              '';

            if (!deltaContent) continue;

            if (!isReceivingCommands) {
              const combined = accumulatedText + deltaContent;
              // Procurar pelo marcador de COMANDOS
              const markerIndex = combined.indexOf(COMMANDS_START_MARKER);

              if (markerIndex !== -1) {
                isReceivingCommands = true;
                // Armazena o texto ANTES do marcador
                currentAiTextMessage = combined.slice(0, markerIndex);
                accumulatedCommandString = combined.slice(markerIndex + COMMANDS_START_MARKER.length);
                // Atualiza a mensagem imediatamente com o texto + placeholder
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_PLACEHOLDER_TEXT } : msg 
                  )
                );
              } else {
                accumulatedText += deltaContent;
                currentAiTextMessage = accumulatedText; // Atualiza texto corrente
                 // Atualiza a mensagem com o texto normal
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
                  )
                );
              }
            } else {
              // Estamos recebendo COMANDOS
              const endMarkerIndex = (accumulatedCommandString + deltaContent).indexOf(COMMANDS_END_MARKER);
              if (endMarkerIndex === -1) {
                accumulatedCommandString += deltaContent;
              } else {
                // Extrai APENAS a parte dos comandos deste chunk
                const commandPart = deltaContent.slice(0, endMarkerIndex);
                accumulatedCommandString += commandPart;
                commandEndMarkerFound = true;
                isReceivingCommands = false; // Comandos terminaram
                
                console.log('>>> COMMANDS_END_MARKER encontrado. Iniciando tentativa de parse.');
                let finalCommandsToParse = accumulatedCommandString;
                accumulatedCommandString = '';

                // 1. Tentar limpar ANTES de parsear
                try {
                  console.log('Limpando string de comandos final antes do parse...');
                  finalCommandsToParse = cleanupJsonString(finalCommandsToParse);
                } catch (cleanError) {
                  console.error('Erro durante a limpeza proativa da string de comandos:', cleanError);
                }

                try {
                  console.log('Tentando JSON.parse na string de comandos final (limpa?):', finalCommandsToParse.substring(0, 100) + '...');
                  const parsedCommands = JSON.parse(finalCommandsToParse);
                  
                  if (isValidCommandArray(parsedCommands)) {
                    console.log('<<< Parse de comandos bem-sucedido após COMMANDS_END_MARKER!');
                    setProposedCommands((prev) => ({
                      ...cleanupProposedCommands(prev),
                      [aiMessageId]: parsedCommands,
                    }));
                    // Atualiza a mensagem com o texto de sucesso APÓS o texto original
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_READY_TEXT } : msg
                      )
                    );
                  } else {
                    console.warn('<<< Parse de comandos funcionou, mas o array de comandos é inválido.');
                    commandParseError = true;
                    // Atualiza a mensagem com o texto de erro de formato APÓS o texto original
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_ERROR_TEXT + '*Formato de comandos inválido.*\n' } : msg
                      )
                    );
                  }
                } catch (e) {
                  console.error('<<< Erro ao parsear string de comandos após COMMANDS_END_MARKER:', e);
                  
                  // Extrair posição do erro, se disponível
                  const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
                  const positionMatch = errorMessage.match(/position (\d+)/);
                  const errorPosition = positionMatch ? parseInt(positionMatch[1], 10) : null;
                  
                  if (errorPosition !== null) {
                    // Debug detalhado do JSON na posição do erro
                    console.log(`   (Debug) Erro de parsing na posição ${errorPosition}, analisando string de comandos que falhou...`);
                    debugJsonPosition(finalCommandsToParse, errorPosition);
                  } else {
                    // Se não conseguir extrair a posição, faz log da string completa
                    console.log('   (Debug) String de comandos que falhou no parse (posição não determinada):');
                    console.log(finalCommandsToParse);
                  }
                  
                  commandParseError = true;
                  // Atualiza a mensagem com o texto de erro de parse APÓS o texto original
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_ERROR_TEXT + `*Comandos inválidos (erro de sintaxe).*\n` } : msg
                    )
                  );
                }
              }
            }

            // Não atualiza a mensagem aqui dentro do loop se estivermos esperando o JSON
            // A atualização ocorre quando o marcador é encontrado ou quando o [DONE] chega

          } catch (e) {
            console.warn('Erro ao parsear linha SSE:', line, e);
          }
        }
      }

      // Processar buffer restante
      if (buffer.length > 0 && !isReceivingCommands) {
        accumulatedText += buffer;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
        );
      }

      // Verificar JSON iniciado mas não finalizado (se o [DONE] chegou antes do end marker)
      // Esta verificação agora é feita dentro do bloco [DONE]
      /* 
      if (isReceivingCommands && !commandEndMarkerFound && accumulatedCommandString.trim() && !commandParseError) {
        commandParseError = true;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: currentAiTextMessage + COMMANDS_ERROR_TEXT + '*JSON incompleto, marcador de fim não encontrado.*\n' } : msg
          )
        );
      } 
      */
    } catch (error: any) {
      console.error(`Falha ao enviar mensagem via ${selectedApiModel}:`, error);
      // Adicionar mensagem de erro e limitar o histórico
      setMessages((prev) => {
          const errorMsg: Message = {
              id: `${Date.now()}-error-api`,
              text: `Erro ao conectar com ${selectedApiModel}: ${error.message}`,
              sender: 'ai'
          };
          const updatedMessages = prev.map((msg) => 
              msg.id === aiMessageId ? { ...msg, text: `Erro interno...` } : msg // Atualiza placeholder se existir
          );
          const finalMessages = [...updatedMessages, errorMsg];
           if (finalMessages.length > MAX_MESSAGES) {
              return finalMessages.slice(finalMessages.length - MAX_MESSAGES);
          }
          return finalMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para aplicar os COMANDOS
  const handleApplyCommands = async (messageToApply: Message) => {
    const commandsToApply = proposedCommands[messageToApply.id];

    if (!commandsToApply || commandsToApply.length === 0) {
      console.warn('Nenhum comando proposto encontrado para mensagem:', messageToApply.id);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: 'Erro: Nenhum comando de edição encontrado para aplicar.',
          sender: 'ai',
        },
      ]);
      return;
    }

    try {
      onApplyCommands(commandsToApply);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageToApply.id
            ? { ...msg, text: msg.text.replace(COMMANDS_READY_TEXT, '\n\n*Comandos aplicados!*\n') }
            : msg
        )
      );
      setProposedCommands((prev) => {
        const newState = { ...prev };
        delete newState[messageToApply.id];
        return newState;
      });
    } catch (error) {
      console.error('Erro ao aplicar comandos propostos:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: `Erro ao aplicar comandos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          sender: 'ai',
        },
      ]);
    }
  };

  // Função para lidar com cliques em sugestões
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-4">
            Converse com a IA para otimizar seu currículo.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center mt-1">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
              <div
                className={`prose prose-sm rounded-lg px-4 py-3 mb-1 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white prose-invert'
                    : 'bg-card text-gray-800 border border-gray-200'
                }`}
              >
                {/* Renderiza o Markdown normal */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text.replace(COMMANDS_PLACEHOLDER_TEXT, '') /* Remove placeholder antes de renderizar */}</ReactMarkdown>
                
                {/* Renderiza o Spinner se o placeholder estiver presente */} 
                {msg.text.includes(COMMANDS_PLACEHOLDER_TEXT) && (
                  <div className="flex items-center justify-start gap-2 my-1 italic text-gray-500 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Gerando comandos de edição...</span>
                  </div>
                )}
              </div>
              {/* Botão Aplicar aparece se os COMANDOS existem e a mensagem contém o texto de pronto */}
              {msg.sender === 'ai' && proposedCommands[msg.id] && msg.text.includes(COMMANDS_READY_TEXT) && (
                <button
                  onClick={() => handleApplyCommands(msg)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border transition-colors bg-background border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50`}
                >
                  <Sparkles size={12} /> Aplicar Edições
                </button>
              )}
            </div>
            {msg.sender === 'user' && <div className="w-7 h-7 flex-shrink-0"></div>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-background border-t border-gray-200">
        <div className="mb-2 flex justify-center">
          <select
            value={selectedApiModel}
            onChange={(e) => setSelectedApiModel(e.target.value as 'gemini' | 'openrouter')}
            disabled={isLoading}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
          >
            <option value="gemini">Modelo: Gemini Flash</option>
            <option value="openrouter">Modelo: OpenRouter</option>
          </select>
        </div>
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSendMessage={handleSendMessage}
          onSuggestionClick={handleSuggestionClick}
          isLoading={isLoading}
          isDisabled={isLoading}
        />
      </div>
    </div>
  );
};

export default AIChatPanel;
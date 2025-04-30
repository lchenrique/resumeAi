'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { YooptaContentValue } from '@yoopta/editor';
import { Bot, Sparkles, Send, MoreHorizontal, Mic, Globe, Upload, Lightbulb, Search } from 'lucide-react';
import { Textarea } from '../ui/textarea';

// --- Marcadores (idênticos ao prompt) ---
const JSON_START_MARKER = '\n\n[[JSON_RESUME_START]]\n';
const JSON_END_MARKER = '\n[[JSON_RESUME_END]]';
const JSON_PLACEHOLDER = '\n\n*-- Gerando sugestão estruturada... --*\n';
const JSON_READY_TEXT = '\n\n*Sugestão pronta para aplicar.* \n';
const JSON_ERROR_TEXT = '\n\n*Erro ao processar sugestão estruturada. Tente novamente ou reformule o pedido.* \n';

// --- Função auxiliar para validar YooptaContentValue ---
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

// --- Função para limpar JSONs antigos do estado ---
const cleanupProposedJsons = (
  proposedJsons: Record<string, YooptaContentValue>,
  maxAgeMs: number = 30 * 60 * 1000 // 30 minutos
): Record<string, YooptaContentValue> => {
  const now = Date.now();
  const cleaned: Record<string, YooptaContentValue> = {};
  Object.entries(proposedJsons).forEach(([msgId, json]) => {
    const msgTime = parseInt(msgId.split('-')[0], 10);
    if (now - msgTime < maxAgeMs) {
      cleaned[msgId] = json;
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
  onJsonUpdate: (newContent: YooptaContentValue) => void;
}

// --- Componente Principal ---
const AIChatPanel: React.FC<AIChatPanelProps> = ({ resumeContent, onJsonUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposedJsons, setProposedJsons] = useState<Record<string, YooptaContentValue>>({});
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

    setMessages((prev) => [...prev, newUserMessage, aiPlaceholderMessage]);
    setIsLoading(true);

    let accumulatedText = '';
    let accumulatedJsonString = '';
    let isReceivingJson = false;
    let jsonParseError = false;
    let jsonEndMarkerFound = false;
    let buffer = '';

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
            if (isReceivingJson && !jsonParseError && accumulatedJsonString.trim()) {
              try {
                const parsedJson = JSON.parse(accumulatedJsonString);
                if (isValidYooptaContent(parsedJson)) {
                  setProposedJsons((prev) => ({
                    ...cleanupProposedJsons(prev),
                    [aiMessageId]: parsedJson,
                  }));
                  accumulatedText = accumulatedText.replace(JSON_PLACEHOLDER, JSON_READY_TEXT);
                } else {
                  jsonParseError = true;
                  accumulatedText = accumulatedText.replace(
                    JSON_PLACEHOLDER,
                    JSON_ERROR_TEXT + '*Formato de currículo inválido.*\n'
                  );
                }
              } catch (e) {
                console.error('Erro ao parsear JSON:', e);
                
                // Extrair posição do erro, se disponível
                const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
                const positionMatch = errorMessage.match(/position (\d+)/);
                const errorPosition = positionMatch ? parseInt(positionMatch[1], 10) : null;
                
                if (errorPosition !== null) {
                  // Debug detalhado do JSON na posição do erro
                  console.log(`Erro de parsing na posição ${errorPosition}, analisando...`);
                  debugJsonPosition(accumulatedJsonString, errorPosition);
                } else {
                  // Se não conseguir extrair a posição, faz log do JSON completo
                  console.log('JSON bruto recebido com erro (não foi possível determinar posição):');
                  console.log(accumulatedJsonString);
                }
                
                // Tentar limpar o JSON com método alternativo
                try {
                  // Usar a função de limpeza especializada
                  const cleanedJson = cleanupJsonString(accumulatedJsonString);
                  
                  console.log('Tentando parser com JSON limpo:', cleanedJson);
                  const parsedJsonAlt = JSON.parse(cleanedJson);
                  console.log('JSON limpo:', parsedJsonAlt);
                  
                  if (isValidYooptaContent(parsedJsonAlt)) {
                    console.log('Parsing alternativo bem-sucedido!');
                    setProposedJsons((prev) => ({
                      ...cleanupProposedJsons(prev),
                      [aiMessageId]: parsedJsonAlt,
                    }));
                    accumulatedText = accumulatedText.replace(JSON_PLACEHOLDER, JSON_READY_TEXT);
                  } else {
                    console.log("JSON limpo que falhou no parse (formato inválido):", cleanedJson)
                    throw new Error('JSON limpo tem formato inválido');
                  }
                } catch (cleanError) {
                  console.error('Também falhou ao tentar limpar e parsear o JSON:', cleanError);
                  jsonParseError = true;
                  accumulatedText = accumulatedText.replace(
                    JSON_PLACEHOLDER,
                    JSON_ERROR_TEXT + `*JSON inválido: ${errorMessage}*\n`
                  );
                }
              }
            }
            setMessages((prev) =>
              prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
            );
            break;
          }

          try {
            const jsonData = JSON.parse(dataString);
            // Suporte para diferentes formatos de delta
            const deltaContent =
              jsonData.choices?.[0]?.delta?.content || // Parasail, OpenRouter
              jsonData.choices?.[0]?.text || // Gemini (se aplicável)
              '';

            if (!deltaContent) continue;

            if (!isReceivingJson) {
              const combined = accumulatedText + deltaContent;
              const markerIndex = combined.indexOf(JSON_START_MARKER);

              if (markerIndex !== -1) {
                isReceivingJson = true;
                accumulatedText = combined.slice(0, markerIndex) + JSON_PLACEHOLDER;
                accumulatedJsonString = combined.slice(markerIndex + JSON_START_MARKER.length);
              } else {
                accumulatedText += deltaContent;
              }
            } else {
              const endMarkerIndex = (accumulatedJsonString + deltaContent).indexOf(JSON_END_MARKER);
              if (endMarkerIndex === -1) {
                accumulatedJsonString += deltaContent;
              } else {
                // Extrai APENAS a parte do JSON deste chunk
                const jsonPart = deltaContent.slice(0, endMarkerIndex);
                accumulatedJsonString += jsonPart;
                jsonEndMarkerFound = true;
                isReceivingJson = false; // JSON terminou
                
                console.log('>>> JSON_END_MARKER encontrado. Iniciando tentativa de parse.');
                let finalJsonToParse = accumulatedJsonString; // Copiar para não modificar o acumulador original ainda
                accumulatedJsonString = ''; // Limpar acumulador JSON para próxima mensagem

                // 1. Tentar limpar ANTES de parsear
                try {
                  console.log('Limpando JSON final antes do parse...');
                  finalJsonToParse = cleanupJsonString(finalJsonToParse);
                } catch (cleanError) {
                  console.error('Erro durante a limpeza proativa do JSON:', cleanError);
                  // Continuar mesmo assim, talvez o parse funcione ou falhe e caia no catch abaixo
                }

                try {
                  console.log('Tentando JSON.parse no JSON final (limpo?):', finalJsonToParse.substring(0, 100) + '...');
                  const parsedJson = JSON.parse(finalJsonToParse);
                  
                  if (isValidYooptaContent(parsedJson)) {
                    console.log('<<< Parse bem-sucedido após JSON_END_MARKER!');
                    setProposedJsons((prev) => ({
                      ...cleanupProposedJsons(prev),
                      [aiMessageId]: parsedJson, // Usar o JSON parseado
                    }));
                    accumulatedText = accumulatedText.replace(JSON_PLACEHOLDER, JSON_READY_TEXT);
                  } else {
                    console.warn('<<< Parse funcionou, mas o conteúdo Yoopta é inválido.');
                    jsonParseError = true;
                    accumulatedText = accumulatedText.replace(
                      JSON_PLACEHOLDER,
                      JSON_ERROR_TEXT + '*Formato de currículo inválido.*\n'
                    );
                  }
                } catch (e) {
                  console.error('<<< Erro ao parsear JSON após JSON_END_MARKER:', e);
                  
                  // Extrair posição do erro, se disponível
                  const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
                  const positionMatch = errorMessage.match(/position (\d+)/);
                  const errorPosition = positionMatch ? parseInt(positionMatch[1], 10) : null;
                  
                  if (errorPosition !== null) {
                    // Debug detalhado do JSON na posição do erro
                    console.log(`   (Debug) Erro de parsing na posição ${errorPosition}, analisando JSON que falhou...`);
                    debugJsonPosition(finalJsonToParse, errorPosition); // Usar a string que falhou
                  } else {
                    // Se não conseguir extrair a posição, faz log do JSON completo
                    console.log('   (Debug) JSON que falhou no parse (posição não determinada):');
                    console.log(finalJsonToParse);
                  }
                  
                  // Apenas reportar o erro no UI, pois a limpeza já foi tentada
                  jsonParseError = true;
                  accumulatedText = accumulatedText.replace(
                    JSON_PLACEHOLDER,
                    JSON_ERROR_TEXT + `*JSON inválido: ${errorMessage}*\n`
                  );
                }
              }
            }

            setMessages((prev) =>
              prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
            );
          } catch (e) {
            console.warn('Erro ao parsear linha SSE:', line, e);
          }
        }
      }

      // Processar buffer restante
      if (buffer.length > 0 && !isReceivingJson) {
        accumulatedText += buffer;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
        );
      }

      // Verificar JSON iniciado mas não finalizado
      if (isReceivingJson && !jsonEndMarkerFound && accumulatedJsonString.trim()) {
        jsonParseError = true;
        accumulatedText = accumulatedText.replace(
          JSON_PLACEHOLDER,
          JSON_ERROR_TEXT + '*JSON incompleto, marcador de fim não encontrado.*\n'
        );
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
        );
      }
    } catch (error: any) {
      console.error(`Falha ao enviar mensagem via ${selectedApiModel}:`, error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: `Erro ao conectar com ${selectedApiModel}: ${error.message}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Função para aplicar sugestão de JSON
  const handleApplySuggestion = async (messageToApply: Message) => {
    const jsonToApply = proposedJsons[messageToApply.id];

    if (!jsonToApply) {
      console.warn('Nenhum JSON proposto encontrado para mensagem:', messageToApply.id);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: 'Erro: Nenhuma sugestão estruturada encontrada para aplicar.',
          sender: 'ai',
        },
      ]);
      return;
    }

    try {
      onJsonUpdate(jsonToApply);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageToApply.id
            ? { ...msg, text: msg.text.replace(JSON_READY_TEXT, '\n\n*Sugestão aplicada!*\n') }
            : msg
        )
      );
      setProposedJsons((prev) => {
        const newState = { ...prev };
        delete newState[messageToApply.id];
        return newState;
      });
    } catch (error) {
      console.error('Erro ao aplicar JSON proposto:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: `Erro ao aplicar sugestão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
              {msg.sender === 'ai' && proposedJsons[msg.id] && !msg.text.startsWith('Erro ao') && (
                <button
                  onClick={() => handleApplySuggestion(msg)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border transition-colors bg-background border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50`}
                >
                  <Sparkles size={12} /> Aplicar no Currículo
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
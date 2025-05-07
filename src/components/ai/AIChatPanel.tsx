'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { YooptaContentValue, YooptaBlockData } from '@yoopta/editor';
import { Bot, Sparkles, Send, MoreHorizontal, Mic, Globe, Upload, Lightbulb, Search, Loader2, User } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Select, SelectGroup, SelectTrigger, SelectValue, SelectLabel, SelectContent, SelectItem } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { UploadResume } from './upload-resume';
import { 
    addChatMessages, 
    pruneChatHistory 
} from '@/lib/supabase-memory';

// Marcadores e textos para os COMANDOS JSON
const COMMANDS_START_MARKER = '[[COMMANDS_START]]';
const COMMANDS_END_MARKER = '[[COMMANDS_END]]';
// Marcadores para INFO BÁSICA do PDF
const PDF_INFO_START_MARKER = '[[PDF_INFO_START]]';
const PDF_INFO_END_MARKER = '[[PDF_INFO_END]]';
// Textos de status como strings simples
const COMMANDS_PLACEHOLDER_TEXT = '\n\n*-- Gerando comandos de edição... --*\n';
const COMMANDS_READY_TEXT = '\n\n*Comandos prontos para aplicar.*\n';
const COMMANDS_ERROR_TEXT = '\n\n*Erro ao processar comandos de edição.*\n';

// Interface para os Comandos de Edição
type BaseCommand = { action: 'add' | 'update' | 'delete' | 'move' };
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
              console.log(`lastValidJsonCheck: Caracteres removidos (${removedPart.length}): '${removedPart.substring(0, 100)}${removedPart.length > 100 ? '...' : ''}'`); // Mostrar mais caracteres removidos
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
      } catch (e) {
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
  } catch (finalError) {
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
  tooltipText,
  variant = 'default'
}: {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  tooltipText?: string;
  variant?: 'default' | 'ghost' | 'subtle';
}) {
  const getButtonClasses = () => {
    const baseClasses = "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
    
    if (variant === 'ghost') {
      return `${baseClasses} bg-transparent hover:bg-foreground/5 text-foreground/70 hover:text-foreground`;
    }
    if (variant === 'subtle') {
      return `${baseClasses} bg-accent/10 text-accent-foreground hover:bg-accent/20`;
    }
    
    // Default variant
    return `${baseClasses} bg-foreground/10 text-foreground/70 hover:bg-foreground/20`;
  };

  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClasses()}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );

  if (tooltipText) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

// --- Definição CORRETA da Interface --- 
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: () => void;
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
  onResumeUpload: (file: File, dataUrl: string) => void; // Assinatura correta
}

// --- Definição CORRETA da Função ChatInput --- 
function ChatInput({
  value,
  onChange,
  onSendMessage,
  onSuggestionClick,
  isLoading,
  isDisabled,
  onResumeUpload, // Recebe a prop com tipo correto
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
    <div className="bg-card/50 p-4 rounded-xl flex flex-col gap-3 shadow-sm border">
      <Textarea
        placeholder="Peça ajuda para melhorar seu currículo com IA..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className="w-full bg-background p-3 rounded-lg focus-visible:ring-1 text-foreground placeholder-muted-foreground outline-none resize-none min-h-[80px] border-muted"
      />
      
        <div className="flex flex-wrap gap-2 items-center">
        <UploadResume onUpload={onResumeUpload} disabled={isDisabled} /> 
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <IconButton 
                    icon={<MoreHorizontal size={16} />} 
                    label="Mais" 
                    disabled={isDisabled} 
                    variant="ghost"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Ver histórico de edições</DropdownMenuItem>
                <DropdownMenuItem>Gerar versão para vaga</DropdownMenuItem>
                <DropdownMenuItem>Refazer última sugestão</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      
      <div className="flex items-center justify-end gap-2">
          <IconButton 
            icon={<Mic size={18} />} 
            disabled={isDisabled} 
            tooltipText="Enviar por voz (em breve)" 
            variant="ghost"
          />
          <button
            onClick={onSendMessage}
            disabled={isDisabled || value.trim() === ''}
            className={`p-2.5 rounded-lg text-primary-foreground transition-colors ${
              isDisabled || value.trim() === '' 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90'
            }`}
            aria-label="Enviar mensagem"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
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
  onReplaceContext: (pdfInfo: { name: string; title?: string }) => void; // Nova prop
}

// Mover MAX_MESSAGES para fora do componente para ser acessível
const MAX_MESSAGES = 50;

// --- Lista de Sugestões ---
const ALL_SUGGESTIONS = [
  "Melhore a descrição das minhas experiências para destacar resultados.",
  "Sugira habilidades relevantes para um desenvolvedor front-end.",
  "Como posso quantificar minhas conquistas em projetos anteriores?",
  "Verifique a gramática e o estilo do meu resumo profissional.",
  "Adapte meu currículo para uma vaga de Gerente de Projetos.",
  "Quais são as palavras-chave mais importantes para a área de marketing digital?",
  "Crie um resumo conciso e impactante para o topo do currículo.",
  "Como descrever minha experiência com trabalho voluntário?",
  "Sugira um formato de currículo moderno e eficaz.",
  "Reescreva a seção de educação para ser mais clara.",
];

// Função simples para embaralhar um array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; // Criar cópia para não modificar o original
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const AIChatPanel: React.FC<AIChatPanelProps> = ({ resumeContent, onApplyCommands, onReplaceContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposedCommands, setProposedCommands] = useState<Record<string, ResumeEditCommand[]>>({});
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [pdfInfo, setPdfInfo] = useState<{ name: string; title?: string } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedApiModel, setSelectedApiModel] = useState<'gemini' | 'openrouter' | 'openrouter-pdf'>('openrouter');
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);

  // Inicializar conversationId e escolher sugestões aleatórias
  useEffect(() => {
    setConversationId(crypto.randomUUID());

    // Escolher sugestões aleatórias
    const shuffled = shuffleArray(ALL_SUGGESTIONS);
    // Pegar 2 para a tela inicial e 3 para o contexto acima do input
    setInitialSuggestions(shuffled.slice(0, 2));
    setContextualSuggestions(shuffled.slice(2, 5)); // Pega as próximas 3

  }, []);

  // Scroll automático para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Função para atualizar as sugestões contextuais ---
  const updateContextualSuggestions = () => {
    const shuffled = shuffleArray(ALL_SUGGESTIONS);
    // Garante que pegamos 3 sugestões, mesmo que o total seja pequeno
    setContextualSuggestions(shuffled.slice(0, 3));
  };

  // Função para enviar mensagem e processar resposta
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading || !conversationId) return;
    const userMessageText = inputValue;

    // --- Lógica para substituir contexto --- 
    const confirmationKeywords = ['sim', 'yes', 'pdf', 'arquivo', 'substituir', 'trocar', 'atualizar', '1'];
    if (pdfInfo && confirmationKeywords.some(keyword => userMessageText.toLowerCase().includes(keyword))) {
        console.log("User confirmed PDF context replacement. Calling onReplaceContext...");
        onReplaceContext(pdfInfo);
        setPdfInfo(null); // Reseta após usar
        setInputValue(''); // Limpa input
        // Opcional: Adicionar mensagem de confirmação ao chat?
        // setMessages(prev => [...prev, {id: Date.now() + '-context-replaced', sender: 'ai', text: 'Contexto do currículo atualizado com as informações do PDF.'}]);
        return; // Interrompe o envio normal da mensagem
    }
    // --------------------------------------

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
    // Atualiza as sugestões contextuais sempre que uma for clicada
    if (messages.length > 0) { // Atualiza apenas se já houver mensagens (sugestões contextuais visíveis)
        updateContextualSuggestions();
    }
  };

  const handleResumeUpload = (file: File, dataUrl: string) => {
    sendPdfToApi(file, dataUrl);
  };

  // --- Função CORRIGIDA para tratar JSON do PDF --- 
  const sendPdfToApi = async (file: File, dataUrl: string) => {
    if (isLoading || !conversationId) return;
    const userMessageText = `Analise o currículo em anexo (${file.name}) e sugira melhorias.`;
    setInputValue('');
    const newUserMessage: Message = { id: `${Date.now()}-user-pdf`, text: userMessageText, sender: 'user' };
    const aiMessageId = `${Date.now()}-ai`;
    const aiPlaceholderMessage: Message = { id: aiMessageId, text: '', sender: 'ai' };

    setMessages((prev) => {
      const updatedMessages = [...prev, newUserMessage, aiPlaceholderMessage];
      return updatedMessages.slice(Math.max(0, updatedMessages.length - MAX_MESSAGES));
    });

    setIsLoading(true);
    let response: Response | null = null;
    let responseText = '';

    try {
      const apiEndpoint = '/api/openrouter-chat';
      console.log(`Enviando PDF (${file.name}) para ${apiEndpoint} (esperando JSON)`);

      response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: { text: userMessageText, id: newUserMessage.id },
          resumeContext: resumeContent,
          pdf: { filename: file.name, file_data: dataUrl }
        }),
      });

      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response Status:', response.status);

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Leitura Manual e Decodificação
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalLength = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          totalLength += value.length;
        }
      }
      const concatenatedChunks = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
      }
      const decoder = new TextDecoder('utf-8');
      responseText = decoder.decode(concatenatedChunks);
      console.log('Manually Decoded Text:', responseText.substring(0, 500) + '...');

      // Processamento do JSON Decodificado
      const responseData = JSON.parse(responseText);
      console.log('Successfully parsed manually decoded text as JSON.');

      if (!response.ok) {
        const errorMsg = responseData.error || `Erro na API (${response.status}) - JSON recebido, mas status não OK`;
        throw new Error(errorMsg);
      }

      let aiResponseText = responseData.choices?.[0]?.message?.content || "(Resposta vazia)";
      let displayText = aiResponseText;

      // Extrair PDF Info
      const pdfInfoStartIndex = displayText.indexOf(PDF_INFO_START_MARKER);
      if (pdfInfoStartIndex !== -1) {
        const pdfInfoEndIndex = displayText.indexOf(PDF_INFO_END_MARKER);
        if (pdfInfoEndIndex !== -1) {
          const jsonString = displayText.substring(pdfInfoStartIndex + PDF_INFO_START_MARKER.length, pdfInfoEndIndex).trim();
          try {
            const parsedInfo = JSON.parse(jsonString);
            if (parsedInfo && typeof parsedInfo.name === 'string') {
              setPdfInfo(parsedInfo);
              console.log('Stored PDF basic info from initial response:', parsedInfo);
              displayText = displayText.substring(0, pdfInfoStartIndex) + displayText.substring(pdfInfoEndIndex + PDF_INFO_END_MARKER.length);
            } else {
              console.warn('Parsed PDF info JSON missing name:', parsedInfo);
            }
          } catch (e) {
            console.error('Failed to parse PDF info JSON:', e, 'String:', jsonString);
          }
        } else {
          displayText = displayText.substring(0, pdfInfoStartIndex);
        }
      }

      // Atualizar mensagem no chat
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, text: displayText } : msg
        )
      );

    } catch (error: any) {
      // Captura qualquer erro: fetch, leitura, decodificação, parse JSON, status não OK
      console.error(`Erro durante o processamento da resposta do PDF:`, error);
      // Log do texto bruto só se ele foi lido antes do erro
      if (responseText) {
          console.error('Raw text that might have caused the error:', responseText);
      }
      
      let errorMessage = `Erro ao processar PDF: ${error.message}`;
      // Tenta adicionar status se o objeto response foi obtido e o status não é OK
      if (response && !response.ok && !(error.message.includes(`Erro na API (${response.status})`))) { // Evitar duplicar info do status
           errorMessage += ` (Status: ${response.status})`;
      }
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, text: `Erro: ${errorMessage}` } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }; // Fim da função sendPdfToApi

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground mt-4 gap-3 px-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Assistente IA para Currículo</h3>
              <p className="text-sm">Converse com a IA para obter ajuda na criação, melhoria e otimização do seu currículo.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-4 w-full max-w-md">
              {initialSuggestions.map((suggestion, index) => (
              <button
                  key={`initial-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm p-3 rounded-lg border hover:bg-muted/50 text-left transition-colors"
                  disabled={isLoading}
              >
                  "{suggestion}"
              </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.length > 0 && messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI Avatar */}
            {msg.sender === 'ai' && (
              <Avatar className="w-8 h-8 mb-1">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
            )}

            {/* Message Bubble and Apply Button */}
            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`prose prose-sm rounded-lg px-4 py-3 mb-1 ${
                  msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground prose-invert'
                  : 'bg-card text-card-foreground border border-border/30'
                }`}
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                {!msg.text && <Loader2 size={14} className="animate-spin" />}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text.replace(COMMANDS_PLACEHOLDER_TEXT, '')}</ReactMarkdown>
                {msg.text.includes(COMMANDS_PLACEHOLDER_TEXT) && (
                  <div className="flex items-center justify-start gap-2 my-1 italic text-sm opacity-80">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Gerando comandos...</span>
                  </div>
                )}
              </div>
              
              {/* Apply commands button */}
              {msg.sender === 'ai' && proposedCommands[msg.id] && msg.text.includes(COMMANDS_READY_TEXT) && (
                <button
                  onClick={() => handleApplyCommands(msg)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-md border transition-colors bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                >
                  <Sparkles size={12} /> Aplicar Edições
                </button>
              )}
              
              {/* Error state */}
              {msg.sender === 'ai' && msg.text.includes(COMMANDS_ERROR_TEXT) && (
                <Badge variant="destructive" className="text-xs px-2 py-0 h-5">
                  Erro ao gerar comandos
                </Badge>
              )}
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <Avatar className="w-8 h-8 mb-1">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="mb-3 flex justify-center">
          <Select 
            defaultValue="openrouter" 
            disabled={isLoading} 
            onValueChange={(value) => setSelectedApiModel(value as 'gemini' | 'openrouter' | 'openrouter-pdf')}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Modelo de IA</SelectLabel>
                <SelectItem value="gemini">Gemini Flash</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Sugestões contextuais acima do input */}
        {messages.length > 0 && contextualSuggestions.length > 0 && (
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 mb-3 pb-2">
            {contextualSuggestions.map((suggestion, index) => (
              <button
                key={`contextual-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1 rounded-full border bg-background hover:bg-muted/50 transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSendMessage={handleSendMessage}
          onSuggestionClick={handleSuggestionClick}
          isLoading={isLoading}
          isDisabled={isLoading}
          onResumeUpload={handleResumeUpload}
        />
      </div>
    </div>
  );
};

export default AIChatPanel;
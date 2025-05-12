// Estilos para texto inline
export interface TextStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean; // Comum, embora não no exemplo
    strikeThrough?: boolean; // Comum, embora não no exemplo
    textColor?: string;
    backgroundColor?: string;
  }
  
  // ----- Conteúdo Inline -----
  interface TextInlineContent {
    type: "text";
    text: string;
    styles?: TextStyle & {
      color?: string;
    };
  }
  
  interface LinkInlineContent {
    type: "link";
    content: string; // O texto visível do link
    href: string;
    styles?: TextStyle; // Links também podem ter estilos
  }
  
  // União para todos os tipos de conteúdo inline
  type InlineContent = TextInlineContent | LinkInlineContent;
  
  // ----- Props Específicas de Blocos -----
  interface CodeBlockProps {
    language?: string; // Ex: "javascript", "python"
  }
  
  interface MediaBlockProps { // Para Image, Video, Audio
    url: string;
    caption?: string;
  }
  
  interface CheckListItemProps {
    checked?: boolean; // Para o estado de um item de checklist
  }
  
  // ----- Conteúdo Específico de Blocos -----
  
  // Para o bloco de Tabela
  interface TableRowContent {
    cells: string[]; // Cada célula é uma string, conforme o exemplo
  }
  
  interface TableBlockSpecificContent {
    type: "tableContent";
    rows: TableRowContent[];
  }
  
  // ----- Definições de Blocos -----
  
  // Tipo base para todos os blocos
  // T: Tipo literal do bloco (ex: "paragraph")
  // C: Tipo do campo 'content'
  // P: Tipo do campo 'props'
  interface BaseBlock<T extends string, C = any, P = object | undefined, S = object | undefined> {
    type: T;
    content?: C;
    props?: P;
    styles?: S;
  }
  
  // --- Blocos de Texto e Cabeçalho ---
  interface ParagraphBlock
    extends BaseBlock<"paragraph", string | InlineContent[], undefined, TextStyle> {}
  
  interface HeadingBlockProps {
    level?: 1 | 2 | 3 | 4 | 5 | 6; // Níveis de cabeçalho comuns
  }
  interface HeadingBlock
    extends BaseBlock<"heading", string, HeadingBlockProps> {}
  
  interface QuoteBlock
    extends BaseBlock<"quote", string | InlineContent[]> {}
  
  // --- Blocos de Lista ---
  interface BulletListItemBlock
    extends BaseBlock<"bulletListItem", string | InlineContent[]> {}
  
  interface NumberedListItemBlock
    extends BaseBlock<"numberedListItem", string | InlineContent[]> {}
  
  interface CheckListItemBlock
    extends BaseBlock<"checkListItem", string | InlineContent[], CheckListItemProps> {}
  
  // --- Blocos de Código e Mídia ---
  interface CodeBlock extends BaseBlock<"codeBlock", string, CodeBlockProps> {}
  
  interface TableBlock extends BaseBlock<"table", TableBlockSpecificContent> {}
  
  interface FileBlock extends BaseBlock<"file", undefined, undefined> {
    // O exemplo mostra sem content e sem props.
    // Se houver props como nome do arquivo, URL, etc., adicione-as aqui.
  }
  
  interface ImageBlock extends BaseBlock<"image", undefined, MediaBlockProps> {}
  
  interface VideoBlock extends BaseBlock<"video", undefined, MediaBlockProps> {}
  
  interface AudioBlock extends BaseBlock<"audio", undefined, MediaBlockProps> {}
  
  // ----- União de todos os tipos de Bloco -----
  export type Block =
    | ParagraphBlock
    | HeadingBlock
    | QuoteBlock
    | BulletListItemBlock
    | NumberedListItemBlock
    | CheckListItemBlock
    | CodeBlock
    | TableBlock
    | FileBlock
    | ImageBlock
    | VideoBlock
    | AudioBlock;
  
  // O documento completo é um array de Blocos
  export type BlockNoteDocument = Block[];
  
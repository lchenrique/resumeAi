"use client"
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { CreateLinkButton, UnnestBlockButton, FileCaptionButton, BlockTypeSelect, FormattingToolbar, FormattingToolbarController, useCreateBlockNote, FileReplaceButton, NestBlockButton, ColorStyleButton, TextAlignButton, BasicTextStyleButton, BlockNoteViewProps } from "@blocknote/react";
import { TextColorButton } from "./toolbar/text-color";
import { schema } from "./toolbar/text-color";
import { ComponentProps } from "react";
import { BlockNoteSchema } from "@blocknote/core";
import { pt } from "@blocknote/core/locales";
const locale = pt;
export const Editor = ({ initialContent, level }: { initialContent?: string, level?: 1 | 2 | 3 }) => {
  const editor = useCreateBlockNote({
    sideMenuDetection: "editor",
    schema: schema,
    dictionary:{
      ...locale,
      placeholders:{
        emptyDocument: "Digite aqui ou use '/' para opções"
      },
      slashMenu: {
        searchBarPlaceholder: "Procure por comandos...",
        noResults: "Nenhum resultado encontrado"
      }
    },
    initialContent: [level ? {
      type: "heading",
      content: initialContent,
      props: {
        level: level || 3
      }
    } : {
      type: "paragraph",
      content: initialContent,
    }]

  });

  return <BlockNoteView 
  editor={editor} 
  theme={"light"} 
  style={{ flex: 1 }} 
  formattingToolbar={false}
  >
    <FormattingToolbarController
      formattingToolbar={() => {
        return <FormattingToolbar>
          <BlockTypeSelect key={"blockTypeSelect"} />

          {/* Extra button to toggle blue text & background */}

          <FileCaptionButton key={"fileCaptionButton"} />
          <FileReplaceButton key={"replaceFileButton"} />

          <BasicTextStyleButton
            basicTextStyle={"bold"}
            key={"boldStyleButton"}
          />
          <BasicTextStyleButton
            basicTextStyle={"italic"}
            key={"italicStyleButton"}
          />
          <BasicTextStyleButton
            basicTextStyle={"underline"}
            key={"underlineStyleButton"}
          />
          <BasicTextStyleButton
            basicTextStyle={"strike"}
            key={"strikeStyleButton"}
          />
          {/* Extra button to toggle code styles */}
          <BasicTextStyleButton
            key={"codeStyleButton"}
            basicTextStyle={"code"}
          />

          <TextAlignButton
            textAlignment={"left"}
            key={"textAlignLeftButton"}
          />
          <TextAlignButton
            textAlignment={"center"}
            key={"textAlignCenterButton"}
          />
          <TextAlignButton
            textAlignment={"right"}
            key={"textAlignRightButton"}
          />

          <TextColorButton key={"customButton"} />


          <NestBlockButton key={"nestBlockButton"} />
          <UnnestBlockButton key={"unnestBlockButton"} />

          <CreateLinkButton key={"createLinkButton"} />
        </FormattingToolbar>
      }}
    />
  </BlockNoteView>
}

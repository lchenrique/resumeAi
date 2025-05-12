import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css"
import { BlockNoteView } from "@blocknote/shadcn";
import { 
  CreateLinkButton, 
  UnnestBlockButton, 
  FileCaptionButton, 
  BlockTypeSelect, 
  FormattingToolbar, 
  FormattingToolbarController, 
  useCreateBlockNote, 
  FileReplaceButton, 
  NestBlockButton, 
  TextAlignButton, 
  BasicTextStyleButton,
  blockTypeSelectItems,
  BlockTypeSelectItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController
} from "@blocknote/react";
import { Color as ColorStyleSpec, TextColorButton } from "./toolbar/text-color";
import { pt } from "@blocknote/core/locales";
import { useTheme } from "next-themes";
import { BlockNoteDocument } from "./type";
import { defaultBlockSpecs, defaultStyleSpecs, filterSuggestionItems, insertOrUpdateBlock, BlockNoteSchema } from "@blocknote/core";
import { Alert } from "./blocks/bullet-list";
import { Info, List } from "lucide-react";
import { CustomBulletListItem } from "./blocks/list-bullet-item";
import { group } from "console";
import { v4 } from "uuid";

export const masterSchema = BlockNoteSchema.create({
  styleSpecs: {
    ...defaultStyleSpecs,
    color: ColorStyleSpec,
  },
  blockSpecs: {
    ...defaultBlockSpecs,
    alert: Alert,
    bulletListItem: CustomBulletListItem,
  }
});

const insertAlert = (editor: typeof masterSchema.BlockNoteEditor) => ({
  title: "Alert",
  subtext: "Alert for emphasizing text",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "alert",
    }),
  aliases: [
    "alert",
    "notification",
    "emphasize",
    "warning",
    "error",
    "info",
    "success",
  ],
  group: "Blocos básicos",
  icon: <Info size={18} />,
});

const insertListBulletItem = (editor: typeof masterSchema.BlockNoteEditor) => ({
  title: "Item da lista",
  subtext: "Item da lista para enfatizar texto",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "bulletListItem",
    }),
  aliases: [
    "bulletListItem",
  ],
  group:"Blocos básicos",
  icon: <List size={18} />,
});

const locale = pt;
export const Editor = ({ initialContent }: { initialContent?: BlockNoteDocument | null }) => {
  const {theme} = useTheme()
  const editor = useCreateBlockNote({ 
    sideMenuDetection: "editor",
    schema: masterSchema, 
    dictionary:{
      ...locale,
    },
    initialContent: initialContent as any
  });

  return <BlockNoteView 
  editor={editor} 
  theme={theme === "dark" ? "dark" : "light"} 
  style={{ flex: 1 }} 
  formattingToolbar={false}
  slashMenu={false}
  id={v4()}
  >
    <FormattingToolbarController
      formattingToolbar={() => {
        return <FormattingToolbar
        blockTypeSelectItems={[
          ...blockTypeSelectItems(editor.dictionary),
          {
            name: "Alert",
            type: "alert",
            icon: Info,
            isSelected: (block) => block.type === "alert",
          } satisfies BlockTypeSelectItem,
          {
            name: "List Bullet Item",
            type: "listBulletItem",
            icon: List,
            isSelected: (block) => block.type === "listBulletItem",
          } satisfies BlockTypeSelectItem,
        ]}
        >
          <BlockTypeSelect key={"blockTypeSelect"} />

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
      <SuggestionMenuController
        triggerCharacter={"/"}
        getItems={async (query) => {
          const defaultItems = getDefaultReactSlashMenuItems(editor);
          console.log(defaultItems)
          const lastBasicBlockIndex = defaultItems.findLastIndex(
            (item) => item.group === "Blocos básicos"
          );
          defaultItems.splice(lastBasicBlockIndex + 1, 0, insertAlert(editor));
          defaultItems.splice(lastBasicBlockIndex + 1, 0, insertListBulletItem(editor));
          return filterSuggestionItems(defaultItems, query);
        }}
      />
  </BlockNoteView>
}

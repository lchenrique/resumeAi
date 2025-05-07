import {
  createReactStyleSpec,
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { BlockNoteSchema, defaultStyleSpecs } from "@blocknote/core";


// The Font style.
export const Color = createReactStyleSpec(
  {
    type: "color",
    propSchema: "string",
  },
  {
    render: (props) => (
      <span style={{ color: props.value }} ref={props.contentRef} />
    ),
  }
);

export const schema = BlockNoteSchema.create({
  styleSpecs: {
    ...defaultStyleSpecs,
    color: Color,
  },
});


export function TextColorButton() {
  const editor = useBlockNoteEditor<
    typeof schema.blockSchema,
    typeof schema.inlineContentSchema,
    typeof schema.styleSchema
  >();


  const Components = useComponentsContext()!;

  // Tracks whether the text & background are both blue.
  const [isSelected, setIsSelected] = useState<boolean>(
    editor.getActiveStyles().color === "blue"
  );

  // Updates state on content or selection change.
  useEditorContentOrSelectionChange(() => {
    setIsSelected(
      editor.getActiveStyles().color === "blue"
    );
  }, editor);


  return (
    <ColorPicker color={editor.getActiveStyles().color || "blue"} setColor={(color) => {
      editor.toggleStyles({
        color: color,
      });
    }} />
  );
}

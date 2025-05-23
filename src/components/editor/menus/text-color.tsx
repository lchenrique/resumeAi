import {
  createReactStyleSpec,
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { defaultBlockSpecs } from "@blocknote/core";
import { defaultStyleSpecs } from "@blocknote/core";
import { BlockNoteSchema } from "@blocknote/core";




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

export const TextSchema = BlockNoteSchema.create({
  styleSpecs: {
    ...defaultStyleSpecs,
    color: Color,
  },
});


export function TextColorButton() {
  const editor = useBlockNoteEditor<
    typeof TextSchema.blockSchema,
    typeof TextSchema.inlineContentSchema,
    typeof TextSchema.styleSchema
  >();


  return (
    <ColorPicker color={editor.getActiveStyles().color || "blue"} setColor={(color) => {
      editor.toggleStyles({
        color: color,
      });
    }} />
  );
}

import { Combobox, ComboboxOption, ComboboxOptionWithCommand } from "@/components/combobox"
import { Editor } from "@tiptap/core"
import { useState } from "react"
export interface SlashMenuProps {
  menuRef: React.RefObject<HTMLDivElement>
  slashMenuPosition: { x: number, y: number }
  editor: Editor
  commands: {
    title: string
    description: string
    icon: React.ReactNode
    command: (editor: Editor) => void
  }[]
  searchTerm: string
  onOpenChange: (isOpen: boolean) => void
}

export function SlashMenu({ menuRef, editor, commands, searchTerm, onOpenChange }: SlashMenuProps) {
  const onSelect = (item: ComboboxOptionWithCommand<typeof commands[number]>) => {
    if (editor) {
      item.command(editor);
      onOpenChange(false)
    }
  }

  return (
    <Combobox<typeof commands[number]>
      ref={menuRef}
      onChange={onSelect}
      placeholder="Pesquisar..."
      options={commands.map((cmd) => ({
        value: cmd.title,
        label: cmd.title,
        ...cmd
      }))}
    />
  )
}
"use client"

import { useEffect, useState, useRef, ComponentRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Link,
    Quote,
    Code,
    Undo,
    Redo,
    Trash2,
    Palette,
} from "lucide-react"
import { Editor } from "@tiptap/core"
import { ColorPicker } from "@/components/color-picker"
import { LinkButton } from "./components/link-button"
import { ToolbarGroup } from "./components/toolbar-group"
import { ToolbarSeparator } from "./components/toolbar-separator"
import { RedoButton } from "./components/redo-button"
import { QuoteButton } from "./components/quote-button"
import { UndoButton } from "./components/undo-button"
import { HeadingSelect } from "./components/heading-select"
import CodeBlockButton from "./components/code-block-button"
import { FontSize } from "@tiptap/extension-font-size"
import { FontFamily } from "@tiptap/extension-font-family"
import { FontFamilySelect } from "./components/font-family-select"
import FontSizeSelect from "./components/font-size-select"
import { MarkButton } from "./components/mark-button"
import ColorButton from "./components/color-button"
import ClearFormatButton from "./components/clear-format-button"
import HighlightButton from "./components/highlight-button"
import ColorBadge from "./components/color-badge"

export function TextEditor({ editor }: { editor: Editor }) {
    const [showToolbar, setShowToolbar] = useState(false)
    const [isMouseOverToolbar, setIsMouseOverToolbar] = useState(false)
    const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false)

    const isMouseOverToolbarRef = useRef(isMouseOverToolbar)
    const toolbarRef = useRef<HTMLDivElement>(null)

    const linkPopoverContentRef = useRef<ComponentRef<typeof PopoverContent>>(null)
    const headingSelectContentRef = useRef<ComponentRef<typeof SelectContent>>(null)
    const fontFamilySelectContentRef = useRef<ComponentRef<typeof SelectContent>>(null)
    const fontSizeSelectContentRef = useRef<ComponentRef<typeof SelectContent>>(null)
    const textColorPopoverContentRef = useRef<ComponentRef<typeof PopoverContent>>(null)
    const highlightPopoverContentRef = useRef<ComponentRef<typeof PopoverContent>>(null)
    const colorBadgePopoverContentRef = useRef<ComponentRef<typeof PopoverContent>>(null)

    useEffect(() => {
        isMouseOverToolbarRef.current = isMouseOverToolbar
    }, [isMouseOverToolbar])

    useEffect(() => {
        if (!editor) return;

        const handleSelectionUpdate = () => {
            if (editor.view.state.selection.empty && !editor.isFocused) {
                if(!isSelectMenuOpen && !isMouseOverToolbarRef.current) {
                    setShowToolbar(false)
                }
            } else if (!editor.view.state.selection.empty) {
                setShowToolbar(true)
            }
        }

        const handleFocus = () => {
            if (!editor.view.state.selection.empty || editor.isFocused) {
                 setShowToolbar(true)
            }
        }

        const handleBlur = () => {
            setTimeout(() => {
                const activeElement = document.activeElement;
                const isFocusInsideToolbar = toolbarRef.current?.contains(activeElement);
                const isFocusInsideLinkPopover = linkPopoverContentRef.current?.contains(activeElement);
                const isFocusInsideHeadingSelect = headingSelectContentRef.current?.contains(activeElement);
                const isFocusInsideFontFamilySelect = fontFamilySelectContentRef.current?.contains(activeElement);
                const isFocusInsideFontSizeSelect = fontSizeSelectContentRef.current?.contains(activeElement);
                const isFocusInsideTextColorPopover = textColorPopoverContentRef.current?.contains(activeElement);
                const isFocusInsideHighlightPopover = highlightPopoverContentRef.current?.contains(activeElement);

                if (
                    !isMouseOverToolbarRef.current &&
                    !isSelectMenuOpen &&
                    !isFocusInsideToolbar &&
                    !isFocusInsideLinkPopover &&
                    !isFocusInsideHeadingSelect &&
                    !isFocusInsideFontFamilySelect &&
                    !isFocusInsideFontSizeSelect &&
                    !isFocusInsideTextColorPopover &&
                    !isFocusInsideHighlightPopover
                ) {
                    setShowToolbar(false)
                }
            }, 200);
        }

        editor.on("selectionUpdate", handleSelectionUpdate)
        editor.on("focus", handleFocus)
        editor.on("blur", handleBlur)

        return () => {
            editor.off("selectionUpdate", handleSelectionUpdate)
            editor.off("focus", handleFocus)
            editor.off("blur", handleBlur)
        }
    }, [editor, isSelectMenuOpen])

    if (!editor) return null;

    return (
        <div className="space-y-4">
            {showToolbar && (
                <div
                    ref={toolbarRef}
                    className="flex flex-wrap items-center gap-1 p-2 rounded-md bg-background shadow-md"
                    onMouseEnter={() => setIsMouseOverToolbar(true)}
                    onMouseLeave={() => setIsMouseOverToolbar(false)}
                >
                    <ToolbarGroup>
                        <UndoButton editor={editor} />
                        <RedoButton editor={editor} />
                    </ToolbarGroup>
                    <ToolbarSeparator />
                    <HeadingSelect editor={editor} ref={headingSelectContentRef} onOpenChange={setIsSelectMenuOpen} />
                    <FontFamilySelect editor={editor} ref={fontFamilySelectContentRef} onOpenChange={setIsSelectMenuOpen} />
                    <FontSizeSelect editor={editor} ref={fontSizeSelectContentRef} onOpenChange={setIsSelectMenuOpen} />
                    <ToolbarSeparator />
                    <ToolbarGroup>
                        <MarkButton editor={editor} type="bold" />
                        <MarkButton editor={editor} type="italic" />
                        <MarkButton editor={editor} type="underline" />
                        <MarkButton editor={editor} type="strike" />
                        <MarkButton editor={editor} type="code" />
                    </ToolbarGroup>
                    <ToolbarSeparator />
                     <ToolbarGroup>
                        <ColorButton editor={editor} ref={textColorPopoverContentRef} onOpenChange={setIsSelectMenuOpen} />
                        <HighlightButton editor={editor} ref={highlightPopoverContentRef} onOpenChange={setIsSelectMenuOpen} />
                        <ColorBadge editor={editor} ref={colorBadgePopoverContentRef} onOpenChange={setIsSelectMenuOpen} />
                    </ToolbarGroup>
                    <ToolbarSeparator />
                    <ToolbarGroup>
                        <LinkButton editor={editor} ref={linkPopoverContentRef} onOpenChange={setIsSelectMenuOpen} />
                        <QuoteButton editor={editor} />
                        <CodeBlockButton editor={editor} />
                    </ToolbarGroup>
                    <ToolbarSeparator />
                    <ToolbarGroup>
                       <ClearFormatButton editor={editor}/>
                    </ToolbarGroup>
                </div>
            )}
        </div>
    )
}

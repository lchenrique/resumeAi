import { TextAlign } from "@tiptap/extension-text-align"

import { FontFamily } from "@tiptap/extension-font-family"

import Placeholder from "@tiptap/extension-placeholder"

import StarterKit from "@tiptap/starter-kit"
import { CustomParagraph, CustomHeading, LiveAutocomplete, Badge } from "./"
import Blockquote from "@tiptap/extension-blockquote"
import TextStyle from "@tiptap/extension-text-style"
import FontSize from "@tiptap/extension-font-size"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import LinkExtension from "@tiptap/extension-link"
import DropCursor from "@tiptap/extension-dropcursor"
import { Extension } from "@tiptap/core"
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'


export const getExtensions = ({ instanceId, showAddBlockMenu }: { instanceId: string, showAddBlockMenu?: ((event: MouseEvent, pos: number) => any) | undefined }) => {
    return [
        StarterKit.configure({
            paragraph: false,
            heading: false,
            hardBreak: {
                keepMarks: true,
                HTMLAttributes: {
                    class: 'break',
                },
            },
        }),
        CustomParagraph.configure({
            instanceId,
            showAddBlockMenu,
        }),
        Blockquote,
        Badge,
        CustomHeading.configure({
            levels: [1, 2, 3],
            instanceId,
            showAddBlockMenu,
        }),
        Placeholder.configure({
            placeholder: 'Digite algo ou pressione "/" para comandos...',
        }),
        TextStyle,
        FontFamily,
        FontSize,
        Color,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Highlight.configure({
            multicolor: true,
        }),
        Underline,
        Image,
        BulletList,
        ListItem,
        LinkExtension.configure({
            openOnClick: false,
        }),
        DropCursor.configure({
            color: '#4a9eff',
            width: 2,
        }),
        LiveAutocomplete,
    ]
}

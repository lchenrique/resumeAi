import { Node, mergeAttributes, InputRule, NodeViewRenderer } from '@tiptap/core'
import { Editor, Range } from '@tiptap/core'
import { badgeExitKeymap } from './badgeExitKeymap'

export interface BadgeAttributes {
  color: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    badge: {
      setBadge: (label: string, color?: string) => ReturnType
      updateBadgeColor: (color: string) => ReturnType
    }
  }
}

export const Badge = Node.create({
  name: 'badge',
  inline: true,
  group: 'inline',
  content: 'text*',

  addAttributes() {
    return {
      color: {
        default: '#eee',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-badge]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      {
        'data-badge': '',
        class: 'badge',
        style: `background: ${node.attrs.color}`,
        ...HTMLAttributes,
      },
      0,
    ]
  },

  addCommands() {
    return {
      setBadge:
        (label: string, color: string = '#eee') =>
        ({ commands }) => {
          return commands.insertContent([
            {
              type: this.name,
              attrs: { color },
              content: [
                { type: 'text', text: label },
              ],
            },
            { type: 'text', text: ' ' }
          ])
        },
      updateBadgeColor:
        (color: string) =>
        ({ state, dispatch }) => {
          const { from, to } = state.selection
          if (from === to) return false

          let updated = false
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === 'badge') {
              const tr = state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, color })
              if (dispatch) dispatch(tr)
              updated = true
            }
          })
          return updated
        },
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /::([^,]+),$/,
        handler: ({ chain, range, match }) => {
          const label = match[1]
          if (label) {
            chain()
              .deleteRange({ from: range.from, to: range.to })
              .insertContent({
                type: this.name,
                attrs: {},
                content: [
                  { type: 'text', text: label },
                ],
              })
              .run()
          }
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    console.log('Badge addProseMirrorPlugins chamado!');
    return [
      badgeExitKeymap(),
    ]
  },
})

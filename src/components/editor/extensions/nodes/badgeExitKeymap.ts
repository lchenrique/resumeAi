import { keymap } from 'prosemirror-keymap'
import { TextSelection } from 'prosemirror-state'

export function badgeExitKeymap() {
  return keymap({
    'ArrowRight': (state, dispatch) => {
      const { $from } = state.selection
      if ($from.parent.type.name === 'badge' && $from.parentOffset === $from.parent.nodeSize - 2) {
        console.log('Keymap: ArrowRight pressionado no final do badge!')
        const posAposBadge = $from.after($from.depth)
        const nextNode = state.doc.nodeAt(posAposBadge)
        if (!nextNode) {
          if (dispatch) {
            let tr = state.tr.insertText(' ', posAposBadge)
            tr = tr.setSelection(TextSelection.create(tr.doc, posAposBadge + 1))
            dispatch(tr)
          }
        } else {
          if (dispatch) {
            dispatch(state.tr.setSelection(TextSelection.create(state.doc, posAposBadge)))
          }
        }
        return true
      }
      return false
    },
    'Tab': (state, dispatch) => {
      const { $from } = state.selection
      if ($from.parent.type.name === 'badge' && $from.parentOffset === $from.parent.nodeSize - 2) {
        const posAposBadge = $from.after($from.depth)
        const nextNode = state.doc.nodeAt(posAposBadge)
        if (!nextNode) {
          if (dispatch) {
            let tr = state.tr.insertText(' ', posAposBadge)
            tr = tr.setSelection(TextSelection.create(tr.doc, posAposBadge + 1))
            dispatch(tr)
          }
        } else {
          if (dispatch) {
            dispatch(state.tr.setSelection(TextSelection.create(state.doc, posAposBadge)))
          }
        }
        return true
      }
      return false
    },
    'Space': (state, dispatch) => {
      const { $from } = state.selection
      if ($from.parent.type.name === 'badge' && $from.parentOffset === $from.parent.nodeSize - 2) {
        const posAposBadge = $from.after($from.depth)
        const nextNode = state.doc.nodeAt(posAposBadge)
        if (!nextNode) {
          if (dispatch) {
            let tr = state.tr.insertText(' ', posAposBadge)
            tr = tr.setSelection(TextSelection.create(tr.doc, posAposBadge + 1))
            dispatch(tr)
          }
        } else {
          if (dispatch) {
            dispatch(state.tr.setSelection(TextSelection.create(state.doc, posAposBadge)))
          }
        }
        return true
      }
      return false
    },
  })
} 
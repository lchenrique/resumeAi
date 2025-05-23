import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { commonResumeWords } from '../common-words';

const pluginKey = new PluginKey('liveAutocomplete');

export const LiveAutocomplete = Extension.create({
  name: 'liveAutocomplete',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: () => ({ suggestion: null, from: null }),
          apply(tr, value) {
            const meta = tr.getMeta(pluginKey);
            if (meta) {
              return meta;
            }
            return value;
          },
        },

        props: {
          decorations(state) {
            const { suggestion, from } = pluginKey.getState(state);
            if (!suggestion || from == null) return null;

            return DecorationSet.create(state.doc, [
              Decoration.widget(from, () => {
                const span = document.createElement('span');
                span.className = 'autocomplete-suggestion';
                span.style.color = 'gray';
                span.style.opacity = '0.5';
                span.textContent = suggestion;
                return span;
              }, { side: 0 }), // Alterado para side: 0 para posicionar no cursor
            ]);
          },

          handleTextInput(view, from, to, text) {
            const state = view.state;
            // Captura o texto antes do cursor, incluindo o texto recém-digitado
            const before = state.doc.textBetween(Math.max(0, from - 30), from, '\n', '\n') + text;
            const match = before.match(/(\w{2,})$/);
            if (!match) {
              view.dispatch(state.tr.setMeta(pluginKey, { suggestion: null, from: null }));
              return false;
            }

            const input = match[1].toLowerCase();
            const suggestion = commonResumeWords.find(w => w.startsWith(input) && w !== input);
            if (!suggestion) {
              view.dispatch(state.tr.setMeta(pluginKey, { suggestion: null, from: null }));
              return false;
            }

            // Define a posição da sugestão como o final da palavra digitada
            const suggestionPos = from + text.length;

            view.dispatch(state.tr.setMeta(pluginKey, {
              suggestion: suggestion.slice(input.length),
              from: suggestionPos,
            }));

            return false;
          },

          handleKeyDown(view, event) {
            if (event.key === 'Tab') {
              const state = view.state;
              const { suggestion, from } = pluginKey.getState(state);
              if (suggestion && from != null) {
                const tr = state.tr.insertText(suggestion + ' ', from);
                view.dispatch(tr.setMeta(pluginKey, { suggestion: null, from: null }));
                event.preventDefault();
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
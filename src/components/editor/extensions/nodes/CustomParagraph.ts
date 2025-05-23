import Paragraph, { ParagraphOptions } from '@tiptap/extension-paragraph';
import { ReactNodeViewRenderer, NodeViewProps } from '@tiptap/react';
import BlockWrapperNodeView from './BlockWrapperNodeView';
import React from 'react';

interface CustomParagraphOptions extends ParagraphOptions {
  instanceId: string;
  showAddBlockMenu: (event: MouseEvent, pos: number) => any;
}

 const CustomParagraph = Paragraph.extend<CustomParagraphOptions>({
  name: 'paragraph',

  addOptions() {
    return {
      ...this.parent?.(),
      instanceId: '',
      showAddBlockMenu: () => {},
    };
  },

  addNodeView() {
    const extensionOptions = this.options;

    const NodeViewComponent = (props: NodeViewProps) => {
      return React.createElement(BlockWrapperNodeView, {
        ...props,
        instanceId: extensionOptions.instanceId,
        showAddBlockMenu: extensionOptions.showAddBlockMenu,
      });
    };

    return ReactNodeViewRenderer(NodeViewComponent);
  },
});

export  {CustomParagraph}; 
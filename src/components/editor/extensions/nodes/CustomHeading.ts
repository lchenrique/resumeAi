import Heading, { HeadingOptions } from '@tiptap/extension-heading';
import { ReactNodeViewRenderer, NodeViewProps } from '@tiptap/react';
import BlockWrapperNodeView from './BlockWrapperNodeView';
import React from 'react';

interface CustomHeadingOptions extends HeadingOptions {
  instanceId: string;
  showAddBlockMenu: (event: MouseEvent, pos: number) => any;
}

 const CustomHeading = Heading.extend<CustomHeadingOptions>({
  name: 'heading',

  addOptions() {
    return {
      ...this.parent?.(),
      instanceId: '',
      showAddBlockMenu: () => { },
      levels: [1, 2, 3, 4, 5, 6],
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

export { CustomHeading }; 
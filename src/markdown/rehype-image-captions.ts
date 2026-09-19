import type { Element, Root, RootContent } from 'hast';

export default function rehypeImageCaptions() {
  return (tree: Root) => {
    function transform(parent: Root | Element) {
      parent.children = parent.children.flatMap((node): RootContent[] => {
        if (node.type !== 'element') return [node];
        if (node.tagName === 'img' && typeof node.properties.title === 'string') {
          const caption = node.properties.title;
          delete node.properties.title;
          return [{ type: 'element', tagName: 'figure', properties: {}, children: [
            node,
            { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] },
          ] }];
        }
        transform(node);
        if (node.tagName !== 'p' || !node.children.some(child => child.type === 'element' && child.tagName === 'figure')) return [node];
        // Figures are flow content: split surrounding prose instead of nesting them in a paragraph.
        const result: RootContent[] = [];
        let paragraph: Element | undefined;
        for (const child of node.children) {
          if (child.type === 'element' && child.tagName === 'figure') {
            result.push(child);
            paragraph = undefined;
          } else {
            if (!paragraph) {
              paragraph = { ...node, children: [] };
              result.push(paragraph);
            }
            paragraph.children.push(child);
          }
        }
        return result;
      });
    }
    transform(tree);
  };
}

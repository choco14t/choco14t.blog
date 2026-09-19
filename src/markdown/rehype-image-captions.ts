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
        if (!['p', 'a', 'em', 'strong', 'del'].includes(node.tagName)
          || !node.children.some(child => child.type === 'element' && child.tagName === 'figure')) return [node];
        // Lift figures through Markdown's inline wrappers, keeping captions outside those wrappers.
        const result: RootContent[] = [];
        let segment: Element | undefined;
        for (const child of node.children) {
          if (child.type === 'element' && child.tagName === 'figure') {
            if (node.tagName !== 'p') {
              const caption = child.children.at(-1)!;
              child.children = [{ ...node, children: child.children.slice(0, -1) }, caption];
            }
            result.push(child);
            segment = undefined;
          } else {
            if (!segment) {
              segment = { ...node, children: [] };
              result.push(segment);
            }
            segment.children.push(child);
          }
        }
        return result;
      });
    }
    transform(tree);
  };
}

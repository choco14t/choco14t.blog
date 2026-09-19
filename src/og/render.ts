import { readFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Static builds and renderer checks run from the repository root.
const font = readFileSync('src/og/fonts/NotoSansCJKjp-Bold.otf');

export async function renderOgImage(title: string): Promise<Uint8Array<ArrayBuffer>> {
  for (let fontSize = 64; fontSize >= 32; fontSize -= 4) {
    let fits = false;
    const svg = await satori({
      type: 'div',
      props: {
        style: { display: 'flex', width: 1200, height: 630, padding: 48, backgroundImage: 'linear-gradient(135deg, #719cd6, #63cdcf)' },
        children: {
          type: 'div',
          props: {
            style: { display: 'flex', flex: 1, alignItems: 'center', padding: 64, borderRadius: 28, backgroundColor: '#dfdfe0', color: '#192330', fontFamily: 'Noto Sans CJK JP', fontWeight: 700 },
            children: {
              type: 'div',
              props: { id: 'title', style: { width: 976, flexShrink: 0, fontSize, lineHeight: 1.35, wordBreak: 'break-word' }, children: title },
            },
          },
        },
      },
    }, {
      width: 1200, height: 630,
      fonts: [{ name: 'Noto Sans CJK JP', data: font, weight: 700, style: 'normal' }],
      onNodeDetected(node) {
        if (node.props.id === 'title') fits = node.height <= 406 && node.width <= 976;
      },
    });
    if (fits) return new Uint8Array(new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng());
  }
  throw new Error(`OG image title cannot fit at the readable minimum of 32px: ${title}`);
}

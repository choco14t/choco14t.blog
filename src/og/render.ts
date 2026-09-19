import { readFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Static builds and renderer checks run from the repository root.
const font = readFileSync('src/og/fonts/NotoSansCJKjp-Bold.otf');

export async function renderOgImage(title: string): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori({
    type: 'div',
    props: {
      style: { display: 'flex', width: 1200, height: 630, padding: 48, backgroundImage: 'linear-gradient(135deg, #719cd6, #63cdcf)' },
      children: {
        type: 'div',
        props: {
          style: { display: 'flex', flex: 1, alignItems: 'center', padding: 64, borderRadius: 28, backgroundColor: '#dfdfe0', color: '#192330', fontFamily: 'Noto Sans CJK JP', fontSize: 64, fontWeight: 700 },
          children: title,
        },
      },
    },
  }, { width: 1200, height: 630, fonts: [{ name: 'Noto Sans CJK JP', data: font, weight: 700, style: 'normal' }] });
  return new Uint8Array(new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng());
}

import { renderOgImage } from '../../og/render';

export async function GET() {
  return new Response(await renderOgImage('blog.choco14t.net'), { headers: { 'Content-Type': 'image/png' } });
}

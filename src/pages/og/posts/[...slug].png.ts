import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { renderOgImage } from '../../../og/render';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !import.meta.env.PROD || !data.draft);
  return posts.map(post => ({ params: { slug: post.data.slug }, props: { title: post.data.title } }));
}

export const GET: APIRoute = async ({ props }) => {
  return new Response(await renderOgImage(props.title), { headers: { 'Content-Type': 'image/png' } });
};

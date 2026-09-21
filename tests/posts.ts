import { globSync, readFileSync } from 'node:fs';

export interface Post {
  path: string;
  title: string;
  slug: string;
  draft: boolean;
  date: string;
  description?: string;
  tags: string[];
}

export const posts: Post[] = globSync('**/*.md', { cwd: 'src/content/posts' }).map(path => {
  const markdown = readFileSync(`src/content/posts/${path}`, 'utf8');
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/)![1];
  const field = (name: string) => frontmatter.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1];
  return {
    path,
    title: JSON.parse(field('title')!),
    slug: JSON.parse(field('slug')!),
    draft: field('draft') === 'true',
    date: field('date')!,
    tags: JSON.parse(field('tags')!),
  };
});

import { readFileSync } from 'node:fs';

export interface Post {
  path: string;
  title: string;
  slug: string;
  draft: boolean;
  date: string;
  description?: string;
  tags: string[];
}

export const posts = JSON.parse(readFileSync('tests/posts.json', 'utf8')) as Post[];

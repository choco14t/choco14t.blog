+++
title = "Apollo Server v4 の調査メモ"
slug = "memo-apollo-server-v4"
draft = false
date = 2023-01-06T15:00:00.000+09:00

[taxonomies]
tags = ["GraphQL", "Apollo", "TypeScript", "Node.js"]

[extra]
category = "Diary"
+++

この記事は Zenn で投稿していた内容を移行したものになります。

## はじめに

Apollo Server の v4 が 2022 年 10 月にリリースされました。これにより v2、v3 は deprecated となりました。

EOL は 2023 年 10 月 22 日となってます。Apollo Server v2 の一部機能については 2022 年 12 月 31 日に EOL となりました。

https://www.apollographql.com/blog/announcement/backend/announcing-the-end-of-life-schedule-for-apollo-server-2-3/

現在 Apollo Server v3 を使っているためどういった変更があったのか調べたメモになります。影響がありそうな箇所のみ記載しているため、詳細については公式ドキュメントを参照ください。

https://www.apollographql.com/docs/apollo-server/migration/

## パッケージ名の変更・統合

v3 では `apollo-server-` から始まるパッケージ名で提供されていましたが、`@apollo/server` にパッケージ名が変更されました。

また、`@apollo/server` は下記の v3 パッケージに相当するものが内包されています。

- apollo-server-errors
- apollo-server-plugin-base
- apollo-server-types

加えて、`ApolloServerPluginCacheControl` などのプラグインも追加され、`@apollo/server/plugin` から各プラグインが参照できます。

<div class="code-title">apollo-v3</div>

```ts
import { ApolloServerPluginCacheControl } from 'apollo-server-core';
```

<div class="code-title">apollo-v4</div>

```ts
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
```

## 公式パッケージの削除

v4 では下記パッケージが削除されました。

- apollo-server-fastify
- apollo-server-hapi
- apollo-server-koa
- apollo-server-lambda
- apollo-server-micro
- apollo-server-cloud-functions
- apollo-server-cloudflare
- apollo-server-azure-functions

つまり Express 以外のパッケージが削除されます。

代わりにコミュニティがメンテナンスしているパッケージを使用できます。

https://github.com/apollo-server-integrations

## 依存ライブラリのバージョンアップ

v4 を使用するにあたり、下記ライブラリのサポートバージョンが変更されました。サポート外のバージョンを使っている場合はまずライブラリのバージョンアップから行う必要があります。

- Node.js
  - v14.16.0 以降
- graphql
  - v16.6.0 以降
- TypeScript
  - v4.7.0 以降

## apollo-server-express からの移行

公式のサンプルを引用しています。

<div class="code-title">schema.ts</div>

```ts
export const typeDefs = `#graphql
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

export const resolvers = {
  Query: {
    books: () => books,
  },
};
```

<div class="code-title">apollo-v3</div>

```ts
/**
 * npm install apollo-server-express apollo-server-core express graphql
 * or
 * yarn add apollo-server-express apollo-server-core express graphql
 */

import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

import { typeDefs, resolvers } from './schema';

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({ token: req.headers.token }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

server.applyMiddleware({ app });

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve))

console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
```

<div class="code-title">apollo-v4</div>

```ts
/**
 * npm install @apollo/server express graphql cors body-parser
 * or
 * yarn add @apollo/server express graphql cors body-parser
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { typeDefs, resolvers } from './schema';

interface MyContext {
  token?: String;
}

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000/graphql`);
```

比較すると v3 では Apollo Server に対して Express をミドルウェアとして渡しているのに対して、v4 では Express のミドルウェアとして Apollo Server を渡していることがわかります。

修正は必要ですが Express の場合は少しの修正で移行ができそうですね。

## さいごに

駆け足気味ですが、v4 での変更点を確認しました。
去年末に [レイオフ](https://www.apollographql.com/blog/announcement/ceo-geoff-schmidts-message-to-apollo-employees/) を実施したこともあり、組織としても転換期と言えます。

Apollo Server v2、v3 を使っている方の参考になれば幸いです。
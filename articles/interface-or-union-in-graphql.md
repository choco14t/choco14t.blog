---
template: post
title: 'GraphQL における interface と union に関するメモ'
slug: 'interface-or-union-in-graphql'
draft: false
date: 2023-09-07T15:00:00.000+09:00
category: Diary
tags:
  - GraphQL
---

## TL;DR

- 共通する field を抽象化したい場合は interface で宣言すると良いかも
- 異なる複数の type を別のユースケースとして参照する場合は union での宣言を検討すると良いかも

---

最近は新機能の開発をしていて、GraphQL スキーマに新しく type を増やす機会があった。type で表現したいものは以下のようなもの。

- ベースとなる機能があり、共通の属性を持つ
- 種別 (2 種類) があり、種別ごとに異なる属性を持つ

このとき、上記の type を表現するために interface または union を使えば表現できるなと思いついた。参考になるだろうと思い、GitHub の GraphQL スキーマを読んでみることにした。

はじめに union の定義を読んでみた。検索結果のアイテムに対する type で union を使用していて、用途の異なる type (ユーザーやリポジトリなど) が `SearchResultItem` という別用途 (検索結果) の type として定義されている。

```graphql:title=SearchResultItem.graphql
"""
The results of a search.
"""
union SearchResultItem =
  | App
  | Discussion
  | Issue
  | MarketplaceListing
  | Organization
  | PullRequest
  | Repository
  | User
```

続いて interface の定義を読んでみた。GitHub 上で star を付けることができる要素を表す `Starrable` という interface が定義されている。この `Starrable` は `Repository` や `Gist` などで implements されている。

```graphql:title=Starrable.graphql
"""
Things that can be starred.
"""
interface Starrable {
  id: ID!

  """
  Returns a count of how many stargazers there are on this object
  """
  stargazerCount: Int!

  """
  A list of users who have starred this starrable.
  """
  stargazers(
    """
    Returns the elements in the list that come after the specified cursor.
    """
    after: String

    """
    Returns the elements in the list that come before the specified cursor.
    """
    before: String

    """
    Returns the first _n_ elements from the list.
    """
    first: Int

    """
    Returns the last _n_ elements from the list.
    """
    last: Int

    """
    Order for connection
    """
    orderBy: StarOrder
  ): StargazerConnection!

  """
  Returns a boolean indicating whether the viewing user has starred this starrable.
  """
  viewerHasStarred: Boolean!
}
```

上記の定義を読んでみて、以下の結論に至った。

- 共通の属性を持たせたい場合は interface で良い
- union は異なる type をひとつの type として新しく表現する用途が適切と感じた
- union にした場合、クライアント側で書くクエリが不必要に増える
  - これについて、選択しなかった理由としては不適切だと思う

実装当初は interface と union どちらも必要かと思いこんでいたけど、結果として interface を宣言するだけで要件を満たすことができそうなのでめでたし。

## おまけ

graphql-ruby で interface のみを参照している場合、`orphan_types` を使って実装されている type を明示的にしておかないと interface を実装した type がスキーマに反映されなかったので注意。

## 参考

- [パブリックスキーマ - GitHub Docs](https://docs.github.com/ja/graphql/overview/public-schema)
- [Schemas and Types | GraphQL](https://graphql.org/learn/schema)
  - [Interfaces](https://graphql.org/learn/schema/#interfaces)
  - [Union types](https://graphql.org/learn/schema/#union-types)
- [graphql-ruby: GraphQL - Interfaces](https://graphql-ruby.org/type_definitions/interfaces.html#orphan-types)

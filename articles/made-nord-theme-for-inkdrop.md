---
template: post
title: 'Inkdrop の Nord テーマを作った'
slug: made-nord-theme-for-inkdrop
draft: false
date: 2019-10-10T15:04:00.000+09:00
description: ''
category: Dev
tags:
  - Diary
socialImage: 'icon.png'
---

メモやブログの下書きなどで [Inkdrop](https://inkdrop.app) を利用している。
別のエディタでは [Nord](https://www.nordtheme.com) テーマを使っているので Inkdrop でも同じテーマにしたいなと思って作成した。

Inkdrop のテーマは UI、Syntax、Preview の 3 つに分かれているので個別に作成する必要がある。
テーマの作り方については [ドキュメント](https://docs.inkdrop.app/manual/creating-a-theme) で丁寧に書かれているので作ってみたい場合はドキュメントを参照。

VSCode のテーマに似せて作ったのでそれっぽくはなっているはず。テーマを適用した場合は次の画像のような感じ。

![](../images/made-nord-theme-for-inkdrop/preview.png)

## UI

エディタ部分以外が対象。確認のモーダルや設定のウィンドウも UI テーマに含まれる。
あらかじめ定義されている変数の値を変えたり、`.overrides` ファイルで設定を上書きしたりすることで既存のスタイルが変更できる。

各コンポーネント（ボタンなど）の変数を `.overrides` ファイルに書いてみたが適用されなかったので `.variables` ファイルの値を直接書き換えた。
`site.overrides` では変数の上書きも可能なのでこの点は謎のまま…。

## Syntax

[CodeMirror](https://codemirror.net) が利用されているので、`cm-*` クラスを編集すればコードに関するスタイルが変更できる。

マッチするたびに背景色が変わるのがあまり好きではないので `outline` プロパティを使ったブラケットマッチにした。

![](../images/made-nord-theme-for-inkdrop/bracket-match.png)

また Bulleted List で 3 段目になるとテキストにまでカラーが適用されていたので力技だが適用されないようにした。
左が `Default Dark Syntax` で右が今回作った `Nord Syntax`。

![](../images/made-nord-theme-for-inkdrop/bulleted-list.png)

## Preview

UI テーマ名に合わせてプレビューのスタイルが適用される。今回だと UI のテーマ名を `nord-ui` にしたのでプレビュー側では次のように定義する必要がある。
Syntax と同様 CodeMirror を利用しているので、`cm-*` クラスを編集

```less
body[class*='nord-ui'] {
  ...;
}
```

## あとがき

無事出来上がってよかったの一言。ipm にも公開済みなのでよかったら使ってみてください。

Inkdrop 使ったことないよって方は 60 日の無料トライアルがあるので一度使ってみて継続利用するか決めたら良いと思います！

---
template: post
title: '2021-02-17'
slug: log-2021-02-17
draft: false
date: 2021-02-17T10:00:00.000+09:00
description:
category: Log
tags:
  - Log
  - React Native
  - Gradle
socialImage: '/icon.png'
---

## 画像のトリミング

[ivpusic/react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker) を使って実装した。

`openPicker()`が iOS と Android で返却値が異なることがあるのでアップロードする際には注意が必要。
具体的には iOS では`filename`というプロパティが存在するが、Android では存在しない。（他にもいくつかあった）

## 画像のアップロード

`Content-Type`を変更する必要があった。
今回は`multipart/form-data`を設定して API を実行した。

以下のリンクを参考にした。

- [WebAPI でファイルをアップロードする方法アレコレ - Qiita](https://qiita.com/mserizawa/items/7f1b9e5077fd3a9d336b)
- [Upload to server · Issue #38 · ivpusic/react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker/issues/38)

## TouchableOpacity

特定の要素をタッチ可能にしてくれるコンポーネント。
画像タップ時にイベント発火させるために使用した。

[TouchableOpacity · React Native](https://reactnative.dev/docs/touchableopacity) を参考にした。

## 画面全体にオーバーレイ

ローディングのオーバーレイがステータスバー・ナビゲーションバーに適用されていなかったので修正した。
[joinspontaneous/react-native-loading-spinner-overlay](https://github.com/joinspontaneous/react-native-loading-spinner-overlay) の実装を参考にして、画面全体にオーバーレイがかかるようにした。

## unexpected element \<queries> found in \<manifest>

Android 向けにビルド実行したときに発生したエラー。
gradle のバージョンが適切でないことが原因だった。

画像のトリミング用に追加したライブラリの readme に利用可能なバージョンがちゃんと書かれていた。
ドキュメントは読もう。

[android - How to fix "unexpected element \<queries> found in \<manifest>" error? - Stack Overflow](https://stackoverflow.com/questions/62969917/how-to-fix-unexpected-element-queries-found-in-manifest-error) を参考にした。

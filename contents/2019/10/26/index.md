---
template: post
title: "iOSで後で読むアプリを作ってみた"
slug: made-app-of-read-it-later-for-ios
draft: false
date: 2019-10-26T07:21:00.000+09:00
description: "SwiftとFirebaseでお試しアプリ開発メモ"
category: Dev
tags:
  - Swift
  - Firebase
socialImage: "/icon.png"
---

最近Notionでウェブクリップをしていたけど、スマホからのアクセス時に不便だなと感じていた。
Instapaper、Pocketというサービスがあるけど学習兼ねて作ってみることにした。

Swiftはちょっと書籍読んでちょっと書いたことあるくらい、Firebaseは使ったことない状態で始めたもののFirebaseのおかげでサクサク作れた。
現状以下の機能が実装できた。

* ログイン（Googleログイン）
* 一覧表示
* 記事の保存
* 記事の削除

実装した機能ごとに参考にした記事と一言を書いていく。
プロジェクトのセットアップは[Firebase を iOS プロジェクトに追加する | Firebase](https://firebase.google.com/docs/ios/setup)が詳細に書いてくれているのでこちらを読んでください。

## ログイン

今回はGoogleログインを利用したので、FirebaseのドキュメントとGoogleのドキュメントを参考にしつつ実装した。

* [iOS で Google ログインを使用して認証する | Firebase](https://firebase.google.com/docs/auth/ios/google-signin)
* [Integrating Google Sign-In into your iOS app | Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios/sign-in?ver=swift)

## 一覧表示

Cloud Firestoreに保存された記事をUITableViewに表示するだけのシンプルな実装。
ログインユーザーごとの記事一覧を取得できるようにした。

* [Cloud Firestore でデータを取得する | Firebase](https://firebase.google.com/docs/firestore/query-data/get-data?hl=ja)
* [0から始める Firestore + Firebase Authentication - Qiita](https://qiita.com/karayok/items/0996c8f0ea219c284dbd#%E4%BE%8B2--usersuseridposts-%E3%81%8B%E3%82%89%E3%83%A6%E3%83%BC%E3%82%B6%E3%81%AB%E7%B4%90%E3%81%A5%E3%81%8F%E3%81%99%E3%81%B9%E3%81%A6%E3%81%AE%E8%A8%98%E4%BA%8B%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E5%8F%96%E5%BE%97)
  * サブコレクションの方式を参考にコレクションを作成した

## 記事の保存

今回一番苦戦した。
結果としてはShareExtensionとFirebaseの機能で解決できた。

### ShareExtension

ブラウザで表示しているページを保存する必要があったのだけど保存先のアプリに自分で作成したアプリが表示されなくてまず困った。

アプリが表示されない…となったので、`swift 自作アプリ 共有メニュー`で検索をしたら[Stackoverflow](https://ja.stackoverflow.com/questions/22770/editingmenu%E3%81%AE%E4%B8%AD%E3%81%AE-%E5%85%B1%E6%9C%89-%E3%81%A7%E3%81%A7%E3%82%8B%E4%B8%80%E8%A6%A7%E3%81%AB%E8%87%AA%E5%88%86%E3%81%A7%E9%96%8B%E7%99%BA%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%82%A2%E3%83%97%E3%83%AA%E3%82%92%E8%A1%A8%E7%A4%BA%E3%81%95%E3%81%9B%E3%81%9F%E3%81%84)で運良く似たような質問を見つけられた。

Safariだとツールバー中央のボタンから別のアプリへ共有できる機能があって、この機能にアプリを表示させるためにはアプリとは別にShareExtensionを作成する必要があることがわかった。

* [【iOSアプリ】AppAppのソースコードを公開しました。 | うるおいらんど](https://uruly.xyz/osc-appapp/)
* [Share Extensionでデータを共有する - Qiita](https://qiita.com/KosukeQiita/items/994693da551a7101cc9c)
* [Share Extensionで画像を保存する – 野生のプログラマZ](http://harumi.sakura.ne.jp/wordpress/2019/07/20/share-extension%E3%81%A7%E7%94%BB%E5%83%8F%E3%82%92%E4%BF%9D%E5%AD%98%E3%81%99%E3%82%8B/)
* [Share Extensionで共有ボタンが押された時アプリを表示する – 野生のプログラマZ](http://harumi.sakura.ne.jp/wordpress/2019/06/20/share-extension%E3%81%A7%E5%85%B1%E6%9C%89%E3%83%9C%E3%82%BF%E3%83%B3%E3%81%8C%E6%8A%BC%E3%81%95%E3%82%8C%E3%81%9F%E6%99%82%E3%82%A2%E3%83%97%E3%83%AA%E3%82%92%E8%A1%A8%E7%A4%BA%E3%81%99%E3%82%8B/)

### ログイン状態の共有

アプリのログイン情報をShareExtensionは保持していないのでKeychain Access Groupsを使ってアプリとShareExtension間でログイン情報を共有する必要があった。Firebaseで機能が提供されていたので何とかなった…。

* [共有 iOS キーチェーンを使ったアプリ間認証を有効にする | Firebase](https://firebase.google.com/docs/auth/ios/single-sign-on)
* [Sharing Access to Keychain Items Among a Collection of Apps | Apple Developer Documentation](https://developer.apple.com/documentation/security/keychain_services/keychain_items/sharing_access_to_keychain_items_among_a_collection_of_apps)

## 記事の削除

保存機能を実装してからだったので特に問題なく実装できた。
これもドキュメントを参考に実装した。

* [Cloud Firestore からデータを削除する | Firebase](https://firebase.google.com/docs/firestore/manage-data/delete-data?hl=ja#delete_documents)
* [swift4 - スワイプでtableviewのセル削除 - Qiita](https://qiita.com/Lulu34/items/b0c88d1e1163d50f743b)

## あとがき

Firebaseとても便利ですね。
個人で使う分には無料枠で事足りそうなので小さい機能のアプリだったらどんどん使ってみると良さそう。

Swiftに関してはこう書いたらとりあえずは動くんだなという状態なんでもうちょっと理解を深めたいところ。
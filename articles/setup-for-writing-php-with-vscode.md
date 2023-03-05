---
template: post
title: 'VSCodeでPHPを書くためのセットアップ'
slug: setup-for-writing-php-with-vscode
draft: true
date: 2019-09-15T14:45:58.989Z
description: ''
category: Dev
tags:
  - VSCode
  - PHP
socialImage: 'icon.png'
---

この記事では以下のプラグインが動作するようにセットアップを行う。

- [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client)
- [phpcs](https://marketplace.visualstudio.com/items?itemName=ikappas.phpcs)
- [PHP Debug](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-debug)

## 動作環境

- MacBook Pro (13-inch, 2018, Four Thunderbolt 3 Ports)
- macOS Mojave (10.14.6)
- Visual Studio Code Version 1.38.1

## settings.json の開き方

以降の記述では直接設定ファイル（以下`settings.json`）に編集を行う。
以下の手順で`settings.json`が開く。

1. `cmd + ,`で Settings を表示
2. 画像赤枠のアイコンをクリック（エディタ右上）

![](../images/setup-for-writing-php-with-vscode/open-settings-json.png)

## [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client)

コード補完のプラグイン。[PHP IntelliSense](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense)というプラグインもありますが、こちらのほうがサクサク動くのでおすすめ。

PHP はデフォルトでも補完が有効なので、`settings.json`に以下を追加して補完が重複表示されないようにしておく。

```json
{
  ...
  "php.suggest.basic": false
}
```

## [phpcs](https://marketplace.visualstudio.com/items?itemName=ikappas.phpcs)

コーディングルールをチェックするプラグイン。
phpcs の実行パスとコーディングルールの設定を`settings.json`に追加する。

```json
{
  ...
  "phpcs.executablePath": "your/phpcs/path",
  "phpcs.standard": "your_phpcs_ruleset.xml"
}
```

`phpcs.standard`には以下の項目を設定することも可能。詳細は[こちら](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Usage)。

- PEAR
- PHPCS
- PSR1
- PSR2
- Squiz
- Zend

## [PHP Debug](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-debug)

デバッグのプラグイン。Xdebug のインストール方法は本記事では省略。

ローカルで使用するなら`launch.json`を作成すれば動作するが、docker や vagrant などリモートデバッグする場合は`pathMappings`の設定が必要。

### launch.json のセットアップ

1. `cmd + shfit + D`からサイドバーにデバッグウィンドウを表示
2. 上部の歯車アイコンをクリック
3. ウィンドウが表示されるので、`PHP`を選択してファイル作成

- このとき`.vscode`のディレクトリ直下にファイルが作成されているか確認

4. 以下のように`launch.json`を編集

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9000,
      "pathMappings": {
        "your/docker_or_vagrant/path": "${workspaceFolder}"
      }
    }
  ]
}
```

`pathMappings`は、キーにリモートのディレクトリ、値を作業ディレクトリを設定する。`${workspaceFolder}`は VS Code で定義されている変数で、VS Code で開いているディレクトリのパスを表す。

`${workspaceRoot}`という変数も定義されているが、[Multi-root Workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces)がサポートされたことにより非推奨となっている。

### デバッグ実行の確認

1. `F9`で任意の行にブレークポイントを設定
2. `F5`でデバッグ開始
3. 1.で設定したブレークポイントで処理が停止されれば、セットアップ完了！！

## あとがき

プラグインを導入することで開発の体験が向上するので、気になったり他の人がオススメしているプラグインはどんどん試してみるのが良いと思う:)

ただしインストールしすぎると重たくはなるので取捨選択は必要。

良い PHP 開発を！

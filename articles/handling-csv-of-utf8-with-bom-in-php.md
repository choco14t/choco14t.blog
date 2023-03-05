---
template: post
title: 'PHPでUTF-8 with BOMのcsvを扱う'
slug: handling-csv-of-utf8-with-bom-in-php
draft: true
date: 2018-06-05T22:19:00.000+09:00
description: ''
category: Dev
tags:
  - PHP
socialImage: 'icon.png'
---

## BOM とは

- バイトオーダーマークの略
- ファイルの先頭に数バイトを付与して、それ以降のデータが[unicode](http://d.hatena.ne.jp/keyword/unicode)であることを表す

この数バイトが原因になる。

## 解決法

- pack()で BOM を表す文字列を作成して、preg_replace()で除去することが出来た。

  $bom = pack('H*', 'EFBBBF');
    $str = preg_replace("/^$bom/", '', $bomStr);

### 参考

- [PHP: pack - Manual](http://php.net/manual/ja/function.pack.php)
- [How to remove multiple UTF-8 BOM sequences before “<!DOCTYPE>”?](https://stackoverflow.com/questions/10290849/how-to-remove-multiple-utf-8-bom-sequences-before-doctype)
  - str_replace での解決法も書かれていましたが、実際に試せていないので記事には書きませんでした。

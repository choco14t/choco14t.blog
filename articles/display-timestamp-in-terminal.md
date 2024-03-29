---
template: post
title: 'ターミナルでタイムスタンプを表示する'
slug: display-timestamp-in-terminal
draft: true
date: 2020-02-13T10:00:00.000+09:00
description: ''
category: Dev
tags:
  - CLI
socialImage: 'icon.png'
---

`date` コマンドに引数を渡すことでタイムスタンプの表示ができる。

```sh
$ date +%s
```

引数の補足をすると、`+` でユーザ定義の出力フォーマットを設定してから strftime のタイムスタンプフォーマットである `%s` を指定している。
そのため `+%s` を引数にすることでタイムスタンプが表示できる。

以下は `man date` の一部抜粋。

> An operand with a leading plus ('+') sign signals a user-defined format string which specifies the format in which to display the date and time. The format string may contain any of the conversion specifications described in the strftime(3) manual page, as well as any arbitrary text. A newline ('\n') character is always output after the characters specified by the format string. The format string for the default display is ''+%+''.

## 参考

- [How can I generate Unix timestamps? - Stack Overflow](https://stackoverflow.com/questions/1204669/how-can-i-generate-unix-timestamps)
- [Man page of STRFTIME](https://linuxjm.osdn.jp/html/LDP_man-pages/man3/strftime.3.html)

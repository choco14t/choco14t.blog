---
template: post
title: 'Sequel ProからMySQL8.0にアクセスできるようにする'
slug: make-mysql8-accessible-from-sequelpro
draft: true
date: 2019-09-16T00:26:00.000+09:00
description: ''
category: Dev
tags:
  - MySQL
socialImage: 'icon.png'
---

## まえがき

Sequel Pro から MySQL 8.0 に接続しようとすると以下のようなエラーが出て接続出来ない。

![dialog](./dialog.png)

原因としては MySQL 8.0 で認証プラグインが `caching_sha2_password` というものに変更されたため。

どういったものかわからなかったので調べてみると、ドキュメントに次のように書かれていた。

> The caching_sha2_password and sha256_password authentication plugins provide more secure password encryption than the mysql_native_password plugin, and caching_sha2_password provides better performance than sha256_password.

> Due to these superior security and performance characteristics of caching_sha2_password, it is as of MySQL 8.0 the preferred authentication plugin, and is also the default authentication plugin rather than mysql_native_password.

> This change affects both the server and the libmysqlclient client library.

> ([MySQL :: MySQL 8.0 Reference Manual :: 2.11.3 Changes in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/upgrading-from-previous-series.html#upgrade-caching-sha2-password)) より

`mysql_native_password` より安全で `sha256_password` より高パフォーマンスとのこと。
どういった仕組みで動くのかなどは今回調べていない。

[こちらの記事](https://yoku0825.blogspot.com/2018/10/mysql-80cachingsha2password-ssl.html)によると、いくつか解決法があるみたいだが今回は認証プラグインを変更する方法で解決した。

実行環境は次のとおり。

- MacBook Pro (13-inch, 2018)
- macOS Mojave 10.14.2
- MySQL 8.0.14
  - 公式の[Docker image](https://hub.docker.com/_/mysql)を使用
- Sequel Pro Nightly (Build 5428 / 37f62834)

## ユーザーの認証プラグインを変更する

今回は接続用に別途ユーザー作成した。

```sql
mysql> CREATE USER 'choco'@'%' IDENTIFIED BY 'hogehoge';
```

次の画像のような結果になっていれば OK。

![user-list-before](./user-list-before.png)

作成したユーザーの認証プラグインを変更する。

```sql
mysql> ALTER USER 'choco'@'%' IDENTIFIED WITH mysql_native_password BY 'hogehoge';
```

再度確認すると、`plugin` の項目が変更されていることがわかる。

![user-list-after](./user-list-after.png)

これで Sequel Pro から接続できるようになった。

## Reference

- [日々の覚書: MySQL 8.0 の caching_sha2_password + 非 SSL 接続が転ける](https://yoku0825.blogspot.com/2018/10/mysql-80cachingsha2password-ssl.html)
- [MySQL :: MySQL 8.0 Reference Manual :: 6.5.1.3 Caching SHA-2 Pluggable Authentication](https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html#caching-sha2-pluggable-authentication-cache-operation)
- [MySQL :: MySQL 8.0 Reference Manual :: 6.5.1.3 Caching SHA-2 Pluggable Authentication](https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html)
- [MySQL :: MySQL 8.0 Reference Manual :: 2.11.3 Changes in MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/upgrading-from-previous-series.html#upgrade-caching-sha2-password)
- [Mysql8 で sequel pro がクラッシュした件　 caching_sha2_password - ちょこっとプログラミング](https://stlisacity.hatenablog.com/entry/2018/07/15/170001)
- [Sequre Pro で MySQL にログインできない - Qiita](https://qiita.com/r641ywork/items/7f0ca12ced72363f9448)
- [ユーザーの作成(CREATE USER 文) - ユーザーの作成 - MySQL の使い方](https://www.dbonline.jp/mysql/user/index1.html)
- [ユーザーの削除(DROP USER 文) - ユーザーの作成 - MySQL の使い方](https://www.dbonline.jp/mysql/user/index4.html)
- [権限の設定(GRANT 文) - ユーザーの作成 - MySQL の使い方](https://www.dbonline.jp/mysql/user/index6.html)

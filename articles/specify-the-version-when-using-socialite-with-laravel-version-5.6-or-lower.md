---
template: post
title: 'Laravel バージョン5.6以下でSocialiteを使う場合はバージョンを指定する'
slug: specify-the-version-when-using-socialite-with-laravel-version-5.6-or-lower
draft: true
date: 2019-04-30T12:20:00.000+09:00
description: ''
category: Dev
tags:
  - PHP
  - Laravel
socialImage: 'icon.png'
---

Laravel には[Socialite](https://laravel.com/docs/master/socialite)という OAuth 認証のライブラリが提供されています。
インストールは`composer`から行えるので、いつも通りにコマンドを実行する。

```bash
$ composer require laravel/socialite
```

すると以下のエラーが表示された。

```
Your requirements could not be resolved to an installable set of packages.

  Problem 1
    - Conclusion: remove laravel/framework v5.5.45
    - Conclusion: don't install laravel/framework v5.5.45
    - laravel/socialite 4.1.1 requires illuminate/http ~5.7.0|~5.8.0 -> satisfiable by illuminate/http[5.7.17, 5.7.18, 5.7.19, v5.7.0, v5.7.1, v5.7.10, v5.7.11, v5.7.15, v5.7.2, v5.7.20, v5.7.21, v5.7.22, v5.7.23, v5.7.26, v5.7.27, v5.7.28, v5.7.3, v5.7.4, v5.7.5, v5.7.6, v5.7.7, v5.7.8, v5.7.9, v5.8.0, v5.8.11, v5.8.12, v5.8.14, v5.8.2, v5.8.3, v5.8.4, v5.8.8, v5.8.9].
    - laravel/socialite v4.1.0 requires illuminate/http ~5.7.0|~5.8.0 -> satisfiable by illuminate/http[5.7.17, 5.7.18, 5.7.19, v5.7.0, v5.7.1, v5.7.10, v5.7.11, v5.7.15, v5.7.2, v5.7.20, v5.7.21, v5.7.22, v5.7.23, v5.7.26, v5.7.27, v5.7.28, v5.7.3, v5.7.4, v5.7.5, v5.7.6, v5.7.7, v5.7.8, v5.7.9, v5.8.0, v5.8.11, v5.8.12, v5.8.14, v5.8.2, v5.8.3, v5.8.4, v5.8.8, v5.8.9].
    - laravel/socialite v4.1.2 requires illuminate/http ~5.7.0|~5.8.0 -> satisfiable by illuminate/http[5.7.17, 5.7.18, 5.7.19, v5.7.0, v5.7.1, v5.7.10, v5.7.11, v5.7.15, v5.7.2, v5.7.20, v5.7.21, v5.7.22, v5.7.23, v5.7.26, v5.7.27, v5.7.28, v5.7.3, v5.7.4, v5.7.5, v5.7.6, v5.7.7, v5.7.8, v5.7.9, v5.8.0, v5.8.11, v5.8.12, v5.8.14, v5.8.2, v5.8.3, v5.8.4, v5.8.8, v5.8.9].
    - laravel/socialite v4.1.3 requires illuminate/http ~5.7.0|~5.8.0|~5.9.0 -> satisfiable by illuminate/http[5.7.17, 5.7.18, 5.7.19, v5.7.0, v5.7.1, v5.7.10, v5.7.11, v5.7.15, v5.7.2, v5.7.20, v5.7.21, v5.7.22, v5.7.23, v5.7.26, v5.7.27, v5.7.28, v5.7.3, v5.7.4, v5.7.5, v5.7.6, v5.7.7, v5.7.8, v5.7.9, v5.8.0, v5.8.11, v5.8.12, v5.8.14, v5.8.2, v5.8.3, v5.8.4, v5.8.8, v5.8.9].
    - don't install illuminate/http 5.7.17|don't install laravel/framework v5.5.45
    - 以下 don't install が繰り返し表示
```

調べてみたところ、現行のバージョン(4.\*)では Laravel5.7 以上を要求しているので、3.2.0 をインストールすれば解決した。

```bash
$ composer require laravel/socialite "^3.2.0"
```

## 参考

- [Releases · laravel/socialite](https://github.com/laravel/socialite/releases)
- [Laravel Socialite - Laravel - The PHP Framework For Web Artisans](https://laravel.com/docs/5.6/socialite)
  - 5.6 のインストール手順にはバージョン指定したコマンドが書かれている
- [Laravel Socialite can't be installed in upgraded version 5.6 - Stack Overflow](https://stackoverflow.com/questions/49064789/laravel-socialite-cant-be-installed-in-upgraded-version-5-6)

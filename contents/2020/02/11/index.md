---
template: post
title: "DockerでXdebugのインストールを失敗した場合"
slug: what-to-do-if-xdebug-installation-failed-with-docker
draft: false
date: 2020-02-11T10:00:00.000+09:00
description: "apk add autoconf build-baseが必要"
category: Dev
tags:
  - Docker
  - PHP
socialImage: "/icon.png"
---
DockerのコンテナにXdebugをインストールしようとして失敗した。<br>
発生したエラーは以下の2点。

* autoconfがインストールされていなかった
* Cコンパイラがインストールされていなかった

## 実行環境

* Docker 2.2.0.0
* PHP 7.4
  * [php:7.4-fpm-alpine](https://hub.docker.com/_/php)
* Xdebug 2.9.2

## その1 autoconfがインストールされていない

以下のようなエラーが表示された場合はautoconfがインストールされていない。

```
downloading xdebug-2.9.2.tgz ...
Starting to download xdebug-2.9.2.tgz (242,959 bytes)
..................................................done: 242,959 bytes
90 source files, building
running: phpize
Configuring for:
PHP Api Version:         20190902
Zend Module Api No:      20190902
Zend Extension Api No:   320190902
Cannot find autoconf. Please check your autoconf installation and the
$PHP_AUTOCONF environment variable. Then, rerun this script.

ERROR: `phpize' failed
```

この場合は`apk add autoconf`を実行してインストールすればよい。

## その2 コンパイラがインストールされていない

以下のようなエラーが表示された場合はコンパイラのインストールがされていない。

```
downloading xdebug-2.9.2.tgz ...
Starting to download xdebug-2.9.2.tgz (242,959 bytes)
..................................................done: 242,959 bytes
90 source files, building
running: phpize
Configuring for:
PHP Api Version:         20190902
Zend Module Api No:      20190902
Zend Extension Api No:   320190902
building in /tmp/pear/temp/pear-build-defaultuserhmhpmF/xdebug-2.9.2
running: /tmp/pear/temp/xdebug/configure --with-php-config=/usr/local/bin/php-config
checking for grep that handles long lines and -e... /bin/grep
checking for egrep... /bin/grep -E
checking for a sed that does not truncate output... /bin/sed
checking for pkg-config... no
checking for cc... no
checking for gcc... no
configure: error: in `/tmp/pear/temp/pear-build-defaultuserhmhpmF/xdebug-2.9.2':
configure: error: no acceptable C compiler found in $PATH
See `config.log' for more details
ERROR: `/tmp/pear/temp/xdebug/configure --with-php-config=/usr/local/bin/php-config' failed
```

この場合は`apk add gcc g++ make`を実行してインストールすればコンパイルが可能になる。

また、`apk add build-base`の実行でも必要なパッケージのインストールが行える。
[build-base](https://pkgs.alpinelinux.org/package/edge/main/x86_64/build-base)は以下7つのパッケージをインストールする。

* binutils
* file
* fortify-headers
* g++
* gcc
* libc-dev
* make

## 参考

* [php-alpineコンテナにxdebugをインストールする時にハマったメモ - Qiita](https://qiita.com/ucan-lab/items/fbf021bf69896538e515)
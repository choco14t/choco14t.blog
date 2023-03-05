---
template: post
title: 'tymon/jwt-authにパーサーを追加する'
slug: add-parser-to-tymon-jwt-auth
draft: true
date: 2020-04-01T10:00:00.000+09:00
description: ''
category: Dev
tags:
  - PHP
  - Laravel
socialImage: 'icon.png'
---

`Authorization: Token {token}`の形式でトークンを取得するためにやったことのメモ。

## TL;DR

- `Tymon\JWTAuth\Contracts\Http\Parser`を実装したクラスを作成する
  - 今回の場合だと`Tymon\JWTAuth\Http\Parser\AuthHeaders`を使ってもよかった
- `Tymon\JWTAuth\JWTAuth`に作成したクラスをサービスプロバイダー経由で追加する

## 解決方法

`AuthHeaders`に`setHeaderName`と`setHeaderPrefix`というメソッドが定義されていてトークンの取得形式を変更することができるので、サービスプロバイダーでインスタンスを生成してパーサーへ追加することで解決できた。

```php:title=vendor/tymon/jwt-auth/src/Http/Parser/AuthHeaders.php
class AuthHeaders implements ParserContract
{
    protected $header = 'authorization';

    protected $prefix = 'bearer';

    // 一部省略

    public function parse(Request $request)
    {
        $header = $request->headers->get($this->header) ?: $this->fromAltHeaders($request);

        if ($header && preg_match('/'.$this->prefix.'\s*(\S+)\b/i', $header, $matches)) {
            return $matches[1];
        }
    }

    public function setHeaderName($headerName)
    {
        $this->header = $headerName;

        return $this;
    }

    public function setHeaderPrefix($headerPrefix)
    {
        $this->prefix = $headerPrefix;

        return $this;
    }
}
```

例として`AppServiceProvider`に追加しているが、別途サービスプロバイダーを作成して追加しても良いと思う。

```php:title=app/Providers/AppServiceProvider.php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        $this->addJwtTokenParser();
    }

    private function addJwtTokenParser()
    {
        $jwtAuth = $this->app->make(JWTAuth::class);
        assert($jwtAuth instanceof JWTAuth);

        $parser = (new AuthHeaders())->setHeaderPrefix('token');
        $jwtAuth->parser()->setChain(array_merge(
            $jwtAuth->parser()->getChain(),
            [$parser]
        ));
    }
}
```

## 参考

- [Laravel で作ったらすべて解決ではないよ？ - Qiita](https://qiita.com/imunew/items/ff2b61eb62b5ac4ffac7#tymonjwt-auth)

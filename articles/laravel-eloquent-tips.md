---
template: post
title: 'Laravel Eloquent Tips'
slug: laravel-eloquent-tips
draft: true
date: 2019-06-13T08:01:00.000+09:00
description: Eloquentを使う際にちょっと便利になるTipsをまとめてみた。網羅性はないので参考程度に。
category: Dev
tags:
  - PHP
  - Laravel
socialImage: 'icon.png'
---

Eloquent を使う際にちょっと便利になる Tips をまとめてみた。網羅性はないので参考程度に。

## テーブル名の変更

`$table` を定義することで任意のテーブルへのアクセス出来ます。

```php
<?php

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    protected $table = 'custom_example';
}
```

## 主キー名の変更

`$primaryKey` を定義して変更することが可能です。

```php
<?php

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    // デフォルトは'id'で定義されています。
    protected $primaryKey = 'custom_key';
}
```

## 主キーの型を変更する

`$keyType` を定義して変更することが可能です。

```php
<?php

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    // デフォルトは'int'で定義されています。
    protected $keyType = 'string';
}
```

## 主キーのインクリメントをしないようにする

`$keyType` を定義して変更することが可能です。

```php
<?php

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    // デフォルトはtrueで定義されています。
    protected $incrementing = false;
}
```

## デフォルトのタイムスタンプを使用しないようにする

`$timestamps` を定義することでデフォルトのタイムスタンプを使用しなくなります。

```php
<?php

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    // デフォルトはtrueで定義されています。
    public $timestamps = false;
}
```

詳細は[`Illuminate\Database\Eloquent\Concerns\HasTimestamps`](https://laravel.com/api/5.8/Illuminate/Database/Eloquent/Concerns/HasTimestamps.html)を参照してください。

## タイムスタンプのカラム名を変更する

モデルクラスに `CREATED_AT`、`UPDATED_AT` を定義することで変更できます。

```php
<?php

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    const CREATED_AT = 'created';
    const UPDATED_AT = 'updated';
}
```

## タイムスタンプのプロパティから Carbon のメソッドを実行

次のようなマイグレーションを作成します。

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSampleTable extends Migration
{
    public function up()
    {
        Schema::create('sample', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('text');
            // created_at, updated_atカラムが追加されます。
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sample');
    }
}
```

モデルクラスを `Sample` とした時、次のような実行が可能です。

```php
<?php

namespace App\Http\Controllers;

use App\Sample;

class HomeController extends Controller
{
    public function index()
    {
        /** @var App\Sample $sample */
        $sample = Sample::find(1);

        // 時刻の差分を取得
        $diff = $sample->created_at->diffForHumans();
    }
}
```

`created_at`、`updated_at` にアクセスすると、`Carbon` オブジェクトに変換してくれています。
そのため、`diffForHumans` などのメソッドが呼び出せます。

詳細は[`Illuminate\Database\Eloquent\Concerns\HasAttributes`](https://laravel.com/api/5.8/Illuminate/Database/Eloquent/Concerns/HasAttributes.html)を参照してください。

また、独自に `Carbon` オブジェクトで受け取りたいカラムを設定したい場合は `$dates` を定義することで可能です。

```php
<?php

use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    // created_at, updated_at以外のカラム名を追加します。
    protected $dates = [
        'created', 'updated'
    ];
}
```

## 参考

- [Eloquent: Getting Started - Laravel - The PHP Framework For Web Artisans](https://laravel.com/docs/5.8/eloquent)
- [Eloquent: Mutators - Laravel - The PHP Framework For Web Artisans](https://laravel.com/docs/5.8/eloquent-mutators#accessors-and-mutators)

+++
title = "Laravel Statsを使ったソースコードの分析"
slug = "analyze-code-with-laravelstats"
draft = true
date = 2019-10-06T15:23:00.000+09:00
description = "Laravelプロジェクトでのソースコード分析ライブラリ。"

[taxonomies]
tags = ["PHP", "Laravel"]

[extra]
category = "Dev"
+++

2019 年 9 月 1 日に v2.0 がリリースされました 🎉

私は v2.0 になってからこのパッケージの存在を知ったので、写経用に作成していた Laravel プロジェクトの更新を兼ねてインストールしてみました。

## インストール条件

v2.0 を使用する場合は次の条件を満たしている必要があります。

- PHP 7.2 以上
- Laravel v5.8 以上もしくは Lumen v5.8 以上

Lumen でも使用可能とのことですが、今回は Laravel プロジェクトでの使用方法を記述します。

## インストール

次のコマンドを実行することでインストールできます。

```shell script
$ composer require "wnx/laravel-stats" --dev
```

サービスプロバイダーの設定は自動で行われますが、手動で行う場合は `config/app.php` に次のコードを追加できます。

```php
'providers' => [
    // ...
    \Wnx\LaravelStats\StatsServiceProvider::class,
]
```

別途コンフィグファイルを作成する場合は以下のコマンドを実行することで作成されます。

```shell script
$ php artisan vendor:publish --provider="Wnx\LaravelStats\StatsServiceProvider"
```

実行が完了すると以下のようなファイルが `config/stats.php` として作成されます（以下のコードはコメントを書き換えています）。

```php
<?php

return [

    /*
     * 出力対象のパス
     */
    'paths' => [
        base_path('app'),
        base_path('database'),
        base_path('tests'),
    ],

    /*
     * 出力対象外とするファイル・ディレクトリ
     */
    'exclude' => [
        base_path('tests/bootstrap.php'),
        // base_path('app/helpers.php'),
        // base_path('app/Services'),
    ],

    /*
     * 独自で出力対象を増やす場合はここに追加する。後述。
     */
    'custom_component_classifier' => [
        // \App\Classifiers\CustomerExportClassifier::class
    ],

    /*
     * 対象外とするルール。
     * デフォルトではvendorディレクトリ以下とコアクラスが対象外となっている。
     *
     * 以下の2ファイルがデフォルトで用意されている。
     * - \Wnx\LaravelStats\RejectionStrategies\RejectVendorClasses::class
     * - \Wnx\LaravelStats\RejectionStrategies\RejectInternalClasses::class
     *
     * 上記ファイルのルール以外にしたい場合は、`Wnx\LaravelStats\Contracts\RejectionStrategy`を実装したクラスを別途作成する必要がある。
     */
    'rejection_strategy' => \Wnx\LaravelStats\RejectionStrategies\RejectVendorClasses::class,

    /*
     * 対象外とする名前空間。
     * `Str::startsWith()`で対象外かを判別している。
     *
     * `Illuminate`を指定することでIlluminate全体を対象外に出来る。
     * また`Illuminate\Support`のように一部を対象外にすることも可能。
     */
    'ignored_namespaces' => [
        'Wnx\LaravelStats',
        'Illuminate',
        'Symfony',
    ],

];
```

## 使い方

`artisan` コマンドで実行できます。

```sh
$ php artisan stats
```

以下の画像のような出力結果になります。

画像入れる

### オプション

| オプション                | 説明                         |
| ------------------------- | ---------------------------- |
| --json                    | json 形式で出力              |
| --components[=COMPONENTS] | 出力対象を指定して出力       |
| -h, --help                | ヘルプの表示                 |
| -q, --quiet               | 結果を出力しない             |
| -V, --version             | バージョンの表示             |
| --ansi                    | ANSI で出力                  |
| --no-ansi                 | ANSI で出力しない            |
| -n, --no-interaction      | 対話形式にしない             |
| --env[=ENV]               | 実行環境を指定して出力       |
| -v, -vv, -vvv, --verbose  | 出力メッセージを詳細にする。 |

`-v, -vv, -vvv,` を実行してみましたが、私が実行した環境では出力結果が変わりませんでした 😢

## 出力の分類方法

Laravel Stats では以下の条件で分類しています。

| コンポーネント  | 条件                                                                                                                                                                      |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controller      | ルーティングに登録されている。`php artisan route:list` に表示されるコントローラ                                                                                            |
| Model           | `Illuminate\Database\Eloquent\Model` が継承されているファイル                                                                                                              |
| Command         | `Illuminate\Console\Command` が継承されているファイル                                                                                                                      |
| Rule            | `Illuminate\Contracts\Validation\Rule` が継承されているファイル                                                                                                            |
| Policy          | `AuthServiceProvider` に登録されているポリシー                                                                                                                             |
| Middleware      | `App\Http\Kernel` に登録されているミドルウェア                                                                                                                             |
| Event           | `Illuminate\Foundation\Events\Dispatchable` トレイトを使用しているファイル                                                                                                 |
| Event Listener  | `EventServiceProvider` に登録されているファイル                                                                                                                            |
| Mail            | `Illuminate\Mail\Mailable` が継承されているファイル                                                                                                                        |
| Notification    | `Illuminate\Notifications\Notification` が継承されているファイル                                                                                                           |
| Nova Action     | `Laravel\Nova\Actions\Action` が継承されているファイル                                                                                                                     |
| Nova Filter     | `Laravel\Nova\Filters\Filter` が継承されているファイル                                                                                                                     |
| Nova Lens       | `Laravel\Nova\Lenses\Lens` が継承されているファイル                                                                                                                        |
| Nova Resource   | `Laravel\Nova\Resource` が継承されているファイル                                                                                                                           |
| Job             | `Illuminate\Foundation\Bus\Dispatchable` トレイトを使用しているファイル                                                                                                    |
| Migration       | `Illuminate\Database\Migrations\Migration` が継承されているファイル                                                                                                        |
| Request         | `Illuminate\Foundation\Http\FormRequest` が継承されているファイル                                                                                                          |
| Resource        | `Illuminate\Http\Resources\Json\Resource`, `Illuminate\Http\Resources\Json\JsonResource` または `Illuminate\Http\Resources\Json\ResourceCollection` が継承されているファイル |
| Seeder          | `Illuminate\Database\Seeder` が継承されているファイル                                                                                                                      |
| ServiceProvider | `Illuminate\Support\ServiceProvider` が継承されているファイル                                                                                                              |
| Dusk Tests      | `Laravel\Dusk\TestCase` が継承されているファイル                                                                                                                           |
| BrowserKit Test | `Laravel\BrowserKitTesting\TestCase` が継承されているファイル                                                                                                              |
| PHPUnit Test    | `PHPUnit\Framework\TestCase` が継承されているファイル                                                                                                                      |

## 出力分類の追加

プロジェクト毎に作成しているファイルを分析対象にする場合は、`Wnx\LaravelStats\Contracts\Classifier` を実装したクラスを作成することで追加できます。

例として `app/Classifiers/RepositoryClassifier.php` を作成すると以下のようなファイルになります。

```php
<?php

namespace App\Classifiers;

use Wnx\LaravelStats\ReflectionClass;
use Wnx\LaravelStats\Contracts\Classifier;

class RepositoryClassifier implements Classifier
{
    /**
     * 出力時のコンポーネント名
     */
    public function name(): string
    {
        $d = new DateTime();
        return 'Repositories';
    }

    /**
     * 出力対象とする条件
     */
    public function satisfies(ReflectionClass $class): bool
    {
        return $class->isSubclassOf(\App\Repositories\BaseRepository::class);
    }

    /**
     * Code LLoCに行数を含めるか
     */
    public function countsTowardsApplicationCode(): bool
    {
        return true;
    }

    /**
     * Test LLoCに行数を含めるか
     */
    public function countsTowardsTests(): bool
    {
        return true;
    }
}
```

作成したファイルを `config/stats.php` の `custom_component_classifier` に追加することで出力対象が追加されます。

```php
<?php
    ...
    'custom_component_classifier' => [
        \App\Classifiers\RepositoryClassifier::class
    ],
    ...
```

## あとがき

このパッケージをインストールすることでファイルごとの行数やメソッド数、クラス数を分析することでどこが複雑になっているかを手軽に調べることができるようになると思います。

Laravel Stats と[PHP Insights](https://phpinsights.com)を併せて利用することでよりプロジェクトのコード分析が捗ると思うので一度使用してみてはいかがでしょうか。

## 参考

- [stefanzweifel/laravel-stats](https://github.com/stefanzweifel/laravel-stats)
- [Release v2.0.0 · stefanzweifel/laravel-stats](https://github.com/stefanzweifel/laravel-stats/releases/tag/v2.0.0)
  - 追加機能や v1 からのアップデート手順について書かれています
- [Laravel Stats 2.0 is Here - Laravel News](https://laravel-news.com/laravel-stats-2-0)
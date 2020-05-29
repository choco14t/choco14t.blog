---
template: post
title: "PHPにおけるオブジェクトの比較"
slug: object-comparison-in-php
draft: false
date: 2019-01-20T21:06:00.000+09:00
description: 業務中にとあるクラスのオブジェクトを比較している箇所で不思議な挙動をしていたので、改めてドキュメントを読み直した。
category: Dev
tags:
  - PHP
socialImage: "/icon.png"
---

業務中にとあるクラスのオブジェクトを比較している箇所で不思議な挙動をしていたので、改めてドキュメントを読み直した。

## オブジェクトの比較

PHPにおける、オブジェクト比較の定義として以下が挙げられる。

* 組み込みのクラスには独自の比較基準が定義されている
* 組み込みクラス以外の比較は出来ない
* 比較演算子`==`では、同じ属性と値を持ち、同じクラスのインスタンスであれば`true`となる
* 厳密な比較演算子`===`では、同じクラスの同じインスタンスを参照している場合のみ`true`となる

上記に関しては、以下のドキュメントページから引用した。

* [PHP: 比較演算子 - Manual](http://php.net/manual/ja/language.operators.comparison.php)
* [PHP: オブジェクトの比較 - Manual](http://php.net/manual/ja/language.oop5.object-comparison.php)

### 組み込みのクラスには独自の比較基準が定義されている

ここでは`DateTime`を用いる。

```php
<?php

$dt1 = new DateTime();
$dt2 = new DateTime('+1 day');
$dt3 = new DateTime('-1 day');

var_dump($dt1 == $dt2); // false
var_dump($dt1 == $dt3); // false
var_dump($dt1 < $dt2); // true
var_dump($dt1 > $dt3); // true
```

上記の結果から、直感的な比較が行えていることがわかる。

`DateTime`に関してはマイクロ秒を保持しているので、等価を調べる際は注意が必要。

### 組み込みクラス以外の比較は出来ない

比較そのものが出来ないわけではなく、大小の比較が出来ないといった方が正しい気がする。

ここでは`Dummy`というクラスを作成して検証する。

```php
<?php

class Dummy
{
    public $num1;
    public $num2;
    public $str;

    public function __construct(int $num1, int $num2, string $str)
    {
        $this->num1 = $num1;
        $this->num2 = $num2;
        $this->str = $str;
    }
}

$cls1 = new Dummy(10, 200, 'hoge');
$cls2 = new Dummy(11, 10, 'hoge');
$cls3 = new Dummy(10, 200, 'hoge');

var_dump($cls1 == $cls2); // false
var_dump($cls1 == $cls3); // true

// $num1での比較しか行われていない
var_dump($cls1 > $cls2); // false
var_dump($cls1 < $cls2); // true
```

同じ属性、同じ値であり、同じクラスのインスタンスであれば等価を調べることは可能である。
しかし大小比較は厳密に行われていないので、定義したい場合はメソッドを作成する必要がある。

[比較演算子のページ](http://php.net/manual/ja/language.oop5.object-comparison.php)にある配列の比較例を見るに、
プロパティを定義されている順に比較し、大小関係が判定できた時点で以降の値は見ていないのだと思う。

### 比較演算子`==`によるオブジェクトの比較

ここでも先程の`Dummy`を利用して検証する。

```php
$cls1 = new Dummy(10, 200, 'hoge');
$cls2 = new Dummy(10, 200, 'hoge');
$cls3 = clone $cls1;
$cls4 = clone $cls2;
$cls5 = new Dummy(0, 10, 'fuga');

var_dump($cls1 == $cls2); // true
var_dump($cls1 == $cls3); // true
var_dump($cls1 == $cls4); // true
var_dump($cls1 == $cls5); // false
```

先述している通り、同一の属性・値を持ち、同じクラスのインスタンスであれば`true`となる。
`$cls5`は全ての値を変更しているが、1つでも異なる値になっていれば`false`となる。

### 厳密な比較演算子`===`によるオブジェクトの比較

同様に`Dummy`を利用する。

```php
$cls1 = new Dummy(10, 200, 'hoge');
$cls2 = new Dummy(10, 200, 'hoge');
$cls3 = clone $cls1;
$cls4 = $cls1;
$cls5 = clone $cls4;

var_dump($cls1 === $cls2); // false
var_dump($cls1 === $cls3); // false
var_dump($cls1 === $cls4); // true
var_dump($cls1 === $cls5); // false
```

比較演算子`==`で`true`となっていた比較も厳密な比較演算子の場合は`false`となり、
同一の参照を持つ場合でなければ`true`とならない。

## おまけ：DateIntervalの比較

冒頭に不思議な挙動をしていたと書いたが、正体は`DateInterval`。

次のようなコードの比較結果を確認してみた。

```php
$interval1 = new DateInterval('P10D');
$interval2 = new DateInterval('P20D');

var_dump($interval1 == $interval2);
var_dump($interval1 < $interval2);
var_dump($interval1 > $interval2);
```

このとき`var_dump()`は1つ目が`true`となり、以降は`false`と表示される。
先程書いたとおりにプロパティを順に比較していれば、`$interval2`の方が大きいと判定されて2つ目の`var_dump()`のみ`true`となるはず。

ネタバラシをするとバグであり、[こちら](https://bugs.php.net/bug.php?id=49914)で報告されている。推測としては、組み込みクラスでないためオブジェクト同士の比較をサポートしていないと思われる。

日付に関する比較をする場合は必ず`DateTime`を使って行わないといけないことが学べた。

### Reference

* [Are PHP DateInterval comparable like DateTime? - Stack Overflow](https://stackoverflow.com/questions/9547855/are-php-dateinterval-comparable-like-datetime)
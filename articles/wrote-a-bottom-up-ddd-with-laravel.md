---
template: post
title: 'ボトムアップDDDをLaravelで書いてみた'
slug: wrote-a-bottom-up-ddd-with-laravel
draft: true
date: 2018-09-25T22:09:24.000+09:00
description: PHPとLaravelを使って写経をしてみた。一通り書いてみた感想としては、OOPの特性を活かしたコーディングとはこういうことなんだなとふんわり掴め、責務の所在が明確だとファイルが増えても処理が追いやすいなと感じた。
category: Dev
tags:
  - PHP
  - DDD
  - Laravel
socialImage: 'icon.png'
---

## まえがき

最近、通勤の合間などに IDDD を読んで少しづつ DDD の知識を取り入れている。ユビキタス言語や境界づけられたコンテキストなど、概念的な定義が個人的に難しくて読むのに時間がかかっている。

そんな時に[nrs さん](https://twitter.com/nrslib)のブログに書かれている、[ボトムアップドメイン駆動設計](https://nrslib.com/bottomup-ddd/)を読んだ。理解や実践が難しい箇所はひとまず置いておき、理解しやすく実践しやすい箇所からまず始めてみようという内容だ。

自分にぴったりだと思って一通り読んだ後、せっかくなので PHP と Laravel を使って写経をしてみた。一通り書いてみた感想としては、OOP の特性を活かしたコーディングとはこういうことなんだなとふんわり掴め、責務の所在が明確だとファイルが増えても処理が追いやすいなと感じた。

参考にした記事で扱われているものは次の 5 つ。どれも技術的な要素なので、普段コードを書いている人にとっては読みやすいと思う。

- 値オブジェクト
- エンティティ
- ドメインサービス
- リポジトリ
- アプリケーションサービス

また、サンプルとは異なる実装をしている箇所を以下で補足する。

## 変更点

### コンストラクタ

PHP は`__construct()`を複数定義出来ない。そのため、今回はデフォルト引数を用いて実装を行った。

```php
<?php

namespace BottomUpDDD\Domain\Users;

use InvalidArgumentException;
use BottomUpDDD\Common\Util;
use BottomUpDDD\Domain\EquatableInterface;

final class User implements EquatableInterface
{
    /** @var UserId */
    private $id;

    /** @var UserName */
    private $userName;

    /** @var FullName */
    private $fullName;

    public function __construct(
        UserName $userName,
        FullName $fullName,
        UserId $id = null
    ) {
        $this->id = $id === null ? new UserId(Util::guid()) : $id;
        $this->userName = $userName;
        $this->fullName = $fullName;
    }

    // 以下の処理は省略...
}
```

ただ、必ず引数で受け取る`$userName`と`$fullName`を引数としたコンストラクタを定義し、2 つの引数に合わせて`$id`と 3 つを引数に受け取る静的メソッドを定義すれば擬似的に複数定義することも出来なくはない。

```php
<?php

namespace BottomUpDDD\Domain\Users;

use InvalidArgumentException;
use BottomUpDDD\Common\Util;
use BottomUpDDD\Domain\EquatableInterface;

final class User implements EquatableInterface
{
    /** @var UserId */
    private $id;

    /** @var UserName */
    private $userName;

    /** @var FullName */
    private $fullName;

    public function __construct(
        UserName $userName,
        FullName $fullName
    ) {
        $this->id = new UserId(Util::guid());
        $this->userName = $userName;
        $this->fullName = $fullName;
    }

    public static function ctorWithId(
        UserName $userName,
        FullName $fullName,
        UserId $id
    ) {
        $instance = new self($userName, $fullName);
        $instance->id = $id;
        return $instance;
    }

    // 以下の処理は省略...
}
```

個人的な意見としては、生成処理のパターンが増えたり、複雑であればファクトリを用意すれば良いのかなという解釈でいる。

### 等価性の判定

C#や Java の Object クラスには`equals()`というメソッドが定義されており、等価の判別が出来る。これも PHP には用意されていないので、汎用的なメソッドとして用意し、インターフェースを実装した。

```php
<?php

namespace BottomUpDDD\Common;

final class Util
{
    /**
        * @param object $objA
        * @param object $objB
        * @return boolean
        */
    public static function classEquals($objA, $objB): bool
    {
        return get_class($objA) === get_class($objB);
    }

    // 以下の処理は省略...
}

<?php

namespace BottomUpDDD\Domain;

interface EquatableInterface
{
    public function equals(EquatableInterface $obj): bool;
}
```

### リポジトリ

Laravel を使用したということもあり、学習も兼ねて Eloquent を用いて実装した。

```php
<?php

namespace BottomUpDDD\ProductionInfrastructure;

use BottomUpDDD\Domain\Users\UserRepositoryInterface;
use BottomUpDDD\Domain\Users\User;
use BottomUpDDD\Domain\Users\UserId;
use BottomUpDDD\Domain\Users\UserName;
use BottomUpDDD\ProductionInfrastructure\Eloquents\UserEloquent;
use BottomUpDDD\Domain\Users\FullName;

final class UserRepository implements UserRepositoryInterface
{
    /** @var UserEloquent */
    private $userEloquent;

    public function __construct(UserEloquent $userEloquent)
    {
        $this->userEloquent = $userEloquent;
    }

    /**
        * @param UserId $userId
        * @return User|null
        */
    public function findByUserId(UserId $userId)
    {
        $target = $this->userEloquent->find($userId->value());

        if ($target === null) {
            return null;
        }

        return new User(
            new UserName($target->user_name),
            new FullName($target->first_name, $target->family_name),
            $userId
        );
    }

    /**
        * @param UserName $userName
        * @return User|null
        */
    public function findByUserName(UserName $userName)
    {
        $target = $this->userEloquent->findByUserName($userName);

        return $target;
    }

    /**
        * @return User[]
        */
    public function findAll()
    {
        $users = $this->userEloquent
            ->all()
            ->map(function (UserEloquent $userEloquent) {
                return new User(
                    new UserName($userEloquent->user_name),
                    new FullName(
                        $userEloquent->first_name,
                        $userEloquent->family_name
                    ),
                    new UserId($userEloquent->id)
                );
            })->toArray();

        return $users;
    }

    public function save(User $user)
    {
        $this->userEloquent->persist($user);
    }

    public function delete(UserId $userId)
    {
        $this->userEloquent->deleteByUserId($userId);
    }
}
```

## あとがき

正直なところ、読む前はリポジトリやエンティティを用いて DDD してみたというような記事をみかけては、「それって〇〇アーキテクチャを適用しただけでは…？」と思っていた。でも実際書いてみると、かなり歯ごたえがあって実装したときの達成感のようなものがあったので、書きたくなるのもわかるなぁという感じ。こうして自分も記事にしているので。

ただ参考記事や書籍にも書かれているように、ユビキタス言語や境界づけられたコンテキストなどの概念がより重要であり、技術的な側面だけを注力するといわゆる軽量 DDD に陥ってしまうので、戦略的設計に関わる知識もインプットしていく。

> 軽量 DDD とは、DDD の戦術的パターンの一部だけをつまみ食いする方法で、ユビキタス言語を見つけ出して育てていこうなどという気は毛頭ない。おまけにこの手法は、境界づけられたコンテキストやコンテキストマッピングも使わずに済ませることが多い。技術面だけに注目して、技術的な問題だけを解決したがっているのだ。この方法にはメリットもあるが、戦略的モデリングを併用したときのような大きな見返りは得られない。（実践ドメイン駆動設計より）

最後に写経したものは[GitHub](https://github.com/choco14t/bottom-up-ddd-php)に置いているので、参考になれば。

nrs さんのサンプルコードは[こちら](https://github.com/nrslib/BottomUpDDD)。(C#)

## 参考 URL

- [ytake/valueobjects](https://github.com/ytake/valueobjects)
  - Util クラスを参考にしました。

---
template: post
title: "FormRequestでログインユーザーをユニークの対象外にする"
slug: exclude-login-users-from-unique-targets-with-formrequest
draft: false
date: 2020-03-28T10:00:00.000+09:00
description: ""
category: Dev
tags:
  - PHP
  - Laravel
socialImage: "/icon.png"
---

FormRequestでは、`rules()`でリクエストの値に対してユニーク制約を設定できる。
例としてユーザー更新のリクエストを想定したUpdateUserRequestを定義する。

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize()
    {
        return false;
    }

    public function rules()
    {
        return [
            'email' => 'sometimes|max:255|email|unique:users',
            'user_name' => 'sometimes|max:255|unique:users',
        ];
    }
}

```

上記のようにunique:テーブル名とすることでユニーク制約を設定できる。
リクエストのキーとカラム名が異なる場合はunique:テーブル名,カラム名とすればよい。

しかし、ログインユーザーの重複する値を許容する場合はこのルール設定だとユニーク制約が適用されて更新できない。
ログインユーザーの重複する値を許容する場合は以下のように記述することで対象外にできる。

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize()
    {
        return false;
    }

    public function rules()
    {
        return [
            'email' => 'sometimes|max:255|email|unique:users,email,' . $this->user()->id,
            'user_name' => 'sometimes|max:255|unique:users,user_name,' . $this->user()->id,
        ];
    }
}

```

## 参考

* [Validation - unique:table,column,except,idColumn](https://laravel.com/docs/6.x/validation#rule-unique)
* [[laravel]フォームリクエストの中でuniqueを無視するignoreメソッドを使う方法](https://teratail.com/questions/236370)
* [【Laravel】更新時のユニークチェックで特定の値は対象外としたいときの対応](https://qiita.com/daiki_44/items/0445355e6f688f6385a9)

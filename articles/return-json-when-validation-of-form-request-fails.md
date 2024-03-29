---
template: post
title: 'FormRequestのバリデーション失敗時にjsonを返す'
slug: return-json-when-validation-of-form-request-fails
draft: true
date: 2020-02-14T22:00:00.000+09:00
description: 'failedValidation()をオーバーライドする'
category: Dev
tags:
  - PHP
  - Laravel
socialImage: 'icon.png'
---

以下どちらかの実装で json レスポンスにできる。

- `failedValidation()` をオーバーライドする
- ヘッダーに `Accept` または `X-Requested-With` を追加する

## `failedValidation()` のオーバーライド

フォームリクエストクラスの `failedValidation()` をオーバーライドすることで json レスポンスかつメッセージをカスタマイズすることも可能。以下はサインアップのエンドポイントを想定したリクエストの例。

```php
<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class SignUpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'user_id' => 'required',
            'password' => 'required'
        ];
    }

    public function messages()
    {
        return [
            'user_id.required' => 'ユーザーIDは必須です。',
            'password.required' => 'パスワードは必須です。',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => $validator->errors()->toArray(),
            ], 403)
        );
    }
}
```

## ヘッダに `Accept` または `X-Requested-With` を追加する

エクセプションハンドラを変更していない場合、バリデーションエラー発生時は `Illuminate/Foundation/Exceptions/Handler::render()` でレスポンス生成が行われる。

```php
    // Illuminate/Foundation/Exceptions/Handler.php
    public function render($request, Exception $e)
    {
        if (method_exists($e, 'render') && $response = $e->render($request)) {
            return Router::toResponse($request, $response);
        } elseif ($e instanceof Responsable) {
            return $e->toResponse($request);
        }

        $e = $this->prepareException($e);

        if ($e instanceof HttpResponseException) {
            return $e->getResponse();
        } elseif ($e instanceof AuthenticationException) {
            return $this->unauthenticated($request, $e);
        } elseif ($e instanceof ValidationException) {
            return $this->convertValidationExceptionToResponse($e, $request);
        }

        return $request->expectsJson()
                    ? $this->prepareJsonResponse($request, $e)
                    : $this->prepareResponse($request, $e);
    }
```

今回はバリデーションエラーの場合なので `convertValidationExceptionToResponse()` が実行される。

```php
    // Illuminate/Foundation/Exceptions/Handler.php
    protected function convertValidationExceptionToResponse(ValidationException $e, $request)
    {
        if ($e->response) {
            return $e->response;
        }

        return $request->expectsJson()
                    ? $this->invalidJson($request, $e)
                    : $this->invalid($request, $e);
    }
```

`expectsJson()` はヘッダに `X-Requested-With: XMLHttpRequest` が含まれているか、ヘッダに `Accept: .../json` もしくは `Accept: ...+json` が含まれている場合に json レスポンスを返却する。

そのためミドルウェアでヘッダを追加することで json レスポンスが取得できる。

```php
<?php
// app/Http/Middleware/EnforceJson.php

namespace App\Http\Middleware;

use Closure;

/**
 * @see https://stackoverflow.com/questions/44453221/how-to-set-header-for-all-requests-in-route-group
 */
class EnforceJson
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $request->headers->set('Accept', 'application/json');
        return $next($request);
    }
}
```

```php
<?php
// app/Http/Kernel.php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    // ...

    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            'throttle:60,1',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \App\Http\Middleware\EnforceJson::class, // 追加
        ],
    ];

    // ...
}
```

個人的には返却するメッセージを変更できるので `failedValidation()` をオーバーライドするほうが好みです。

## 参考

- [【Laravel5】FormRequest のバリデーション結果を JSON API で返す - Qiita](https://qiita.com/junsan50/items/ec7f810decd3b82d3d76)
- [Laravel API で常に JSON をリクエストするミドルウェア - Qiita](https://qiita.com/kd9951/items/9b6ef7d2c505522d873b)
- [php - How to set header for all requests in route group - Stack Overflow](https://stackoverflow.com/questions/44453221/how-to-set-header-for-all-requests-in-route-group)

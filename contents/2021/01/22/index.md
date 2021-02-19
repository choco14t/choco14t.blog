---
template: post
title: '2021-01-22'
slug: log-2021-01-22
draft: false
date: 2021-01-22T10:00:00.000+09:00
description:
category: Log
tags:
  - Log
  - React Native
socialImage: '/icon.png'
---

## React Native 入力欄がキーボードで隠れないようにする

`KeyboardAvoidingView`を使うことで対応できた。

[【React Native】キーボードで画面が隠れる場合の対処法 - bagelee（ベーグリー）](https://bagelee.com/programming/react-native-keyboard/) を参考にした。ドキュメントに`behavior`についての記載がない分、この記事は各プロパティの動作が説明されていた。

[android - height vs position vs padding in KeyboardAvoidingView "behavior" - Stack Overflow](https://stackoverflow.com/questions/47661480/height-vs-position-vs-padding-in-keyboardavoidingview-behavior) の回答も参考になった。

`TextInput`がマルチラインになっているとフォーカスが効かない。
issue は立っていたが解消されていない模様。

- [Keyboard popup view auto-scroll not working for Textarea · Issue #2228 · GeekyAnts/NativeBase · GitHub](https://github.com/GeekyAnts/NativeBase/issues/2228)
- [Keyboard popup view auto-scroll not working for TextInput with multiline · Issue #20996 · facebook/react-native · GitHub](https://github.com/facebook/react-native/issues/20996)

[react-native-keyboard-aware-scroll-view](https://github.com/APSL/react-native-keyboard-aware-scroll-view) を使えばマルチラインにも対応可能。

また`ScrollView`を使っていると期待した動作にならなかったが、下記のようにすることで動作した。

```jsx
<KeyboardAvoidingView>
  <ScrollView>
    <View>
      {/* content */}
    </View>
  </ScrollView>
</KeyboardAvoidingView>
```

[reactjs - KeyboardAvoidingView with ScrollView - Stack Overflow](https://stackoverflow.com/questions/40438986/keyboardavoidingview-with-scrollview) を参考にした。

## Android デバイスを指定してビルドする

コマンドからデバイス ID を指定することができる。
デバイス ID は`adb devices`から取得可能。

```shell
npx react-native run-android --deviceId [DEVICE_ID]
```

[React Native で実行対象の Android デバイスを選択してビルドする - つよくなるブログ](https://blog.morugu.com/entry/2018/01/16/214355) を参考。

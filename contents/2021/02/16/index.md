---
template: post
title: '2021-02-16'
slug: log-2021-02-16
draft: false
date: 2021-02-16T10:00:00.000+09:00
description:
category: Log
tags:
  - Log
  - React Native
socialImage: '/icon.png'
---

## URL 指定の画像が表示されない

React Native で外部リソース（画像）を読み込もうとして表示されない問題に遭遇した。
下記のように width、height を指定をすることで解決した。

```jsx
<Image
  source={{uri: `${resource}`}}
  style={{height: 100, width: 100}}
/>
```

[ReactNativeのImageで画像が表示されない - Qiita](https://qiita.com/ozaki25/items/d98ba7436c6e2f7841f0) を参考にした。

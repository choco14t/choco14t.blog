---
template: post
title: '2021-02-10'
slug: log-2021-02-10
draft: false
date: 2021-02-10T10:00:00.000+09:00
description:
category: Log
tags:
  - Log
  - React Native
socialImage: 'icon.png'
---

## Tab ごとにヘッダーのタイトルを切り替える

`navigation.dangerouslyGetParent()`を使って対応した。

```jsx
import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const TabHomeScreen = ({ navigation }) => {
  useFocusEffect(
    useCallback(() => {
      // 親要素である Stack を取得し、Stack に対して title を設定する
      const stackNavigator = navigation.dangerouslyGetParent()

      if (stackNavigator) {
        stackNavigator.setOptions({ title: 'HOME' })
      }
    }, [navigation])
  )

  return (
    <View>
      <Text>This is Home Screen</Text>
    </View>
  )
}

const TabScreens = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen component={TabHomeScreen} />
      <Tab.Screen />
    </Tab.Navigator>
  )
}

const StackScreens = () => {
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen component={TabScreens} />
    </Stack.Navigator>
  </NavigationContainer>
}
```

[ドキュメント](https://reactnavigation.org/docs/navigation-prop/#dangerouslygetparent)にも以下のように記載されている。

> This method returns the navigation prop from the parent navigator that the current navigator is nested in. For example, if you have a stack navigator and a tab navigator nested inside the stack, then you can use `dangerouslyGetParent` inside a screen of the tab navigator to get the navigation prop passed from the stack navigator.
>
> This method will return undefined if there is no parent navigator. Be sure to always check for undefined when using this method.

DeepL での翻訳。

> このメソッドは、現在のナビゲータがネストされている親ナビゲータからナビゲーションプロップを返します。例えば、スタックナビゲータとタブナビゲータがスタック内にネストしている場合、タブナビゲータの画面内で dangerouslyGetParent を使用してスタックナビゲータから渡されたナビゲーションプロップを取得することができます。
>
> このメソッドは親ナビゲータがない場合は未定義を返します。このメソッドを使用する際には必ず undefined をチェックするようにしてください。

[React Navigation header title in nested tab navigator - Stack Overflow](https://stackoverflow.com/questions/60363195/react-navigation-header-title-in-nested-tab-navigator) も参考にした。

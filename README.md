# react-native-web-refresh-control [![NPM Version](https://img.shields.io/npm/v/react-native-web-refresh-control.svg)](https://npmjs.com/package/react-native-web-refresh-control)

Drop-in RefreshControl component for web

<img src="./example.gif" width=800 />

## Install

```bash
npm i react-native-web-refresh-control
```

## Example

https://snack.expo.io/@niciusb/refreshcontrol-example

## Usage

`react-native-web-refresh-control` exports two properties:

* `patchFlatListProps` is a function that you'll want to call  at some point, while loading your app. It replaces the default value of the refreshControl prop of `FlatList`

* `RefreshControl` can be used to easily give `ScrollView` a pull-to-refresh functionality, just like the `RefreshControl` exported from react-native. However, if you used the `RefreshControl` from react-native, it would not work on the web. To see how to do this, check out this snack: https://snack.expo.io/@niciusb/refreshcontrol-example


## patchFlatListProps Example

```
// index.js
import { patchFlatListProps } from 'react-native-web-refresh-control'

import App from './App'

patchFlatListProps()
registerRootComponent(App)
```
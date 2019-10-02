# react-native-web-refresh-control ![](https://img.shields.io/npm/v/react-native-web-refresh-control.svg)

Drop-in RefreshControl component for web

<img src="./example.gif" width=800 />

## Install

```bash
npm i react-native-web-refresh-control
```

## Usage

`react-native-web-refresh-control` exports two properties:

* `patchFlatListProps` is a function that you'll want to call  at some point, while loading your app. It replaces the default value of the refreshControl prop of `FlatList`

* `RefreshControl` can be used to easily give `ScrollView` a pull-to-refresh. If you used `RefreshControl` imported from react-native, it would not work on the web
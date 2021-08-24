import React from 'react'
import { FlatList, Platform, ScrollView } from 'react-native'
import CustomRefreshControl from './RefreshControl'

export { CustomRefreshControl as RefreshControl }
export function patchFlatListProps(options = {}) {
  try {
    if (Platform.OS === 'web') {
      setCustomFlatListWeb(options)
    }
  } catch (e) {
    console.error(e)
  }
}

function setCustomFlatListWeb(options) {
  FlatList.defaultProps = {
    ...FlatList.defaultProps,
    //eslint-disable-next-line react/display-name
    renderScrollComponent: props => (
      <ScrollView
        {...props}
        //eslint-disable-next-line react/prop-types
        refreshControl={<CustomRefreshControl {...options} refreshing={props.refreshing} onRefresh={props.onRefresh} />}
      />
    ),
  }
}

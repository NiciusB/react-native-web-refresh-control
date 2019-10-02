import React from 'react'
import { FlatList, Platform, ScrollView } from 'react-native'
import CustomRefreshControl from './RefreshControl'

export const RefreshControl = CustomRefreshControl
export function patchFlatListProps() {
  try {
    if (Platform.OS === 'web') {
      setCustomFlatListWeb()
    }
  } catch (e) {
    console.error(e)
  }
}

function setCustomFlatListWeb() {
  FlatList.defaultProps = {
    ...FlatList.defaultProps,
    //eslint-disable-next-line react/display-name
    renderScrollComponent: props => (
      <ScrollView
        {...props}
        //eslint-disable-next-line react/prop-types
        refreshControl={
          <RefreshControl refreshing={props.refreshing} onRefresh={props.onRefresh} />
        }
      />
    ),
  }
}

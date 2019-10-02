import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  PanResponder,
  Animated,
  ActivityIndicator,
  findNodeHandle,
  ViewPropTypes,
  ColorPropType,
} from 'react-native'
import PropTypes from 'prop-types'

const arrowIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfgCQYHLCTylhV1AAAAjklEQVQ4y2P8z0AaYCJRPX4NsyNWM5Ok4R/n+/noWhjx+2F20n8HwcTQv0T7IXUe4wFUWwh6Gl0LEaGEqoWoYEXWQmQ8ILQwEh/TkBBjme3HIESkjn+Mv9/vJjlpkOwkom2AxTmRGhBJhCgNyCmKCA2oCZCgBvT0ykSacgIaZiaiKydoA7pykiKOSE+jAwADZUnJjMWwUQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNi0wOS0wNlQwNzo0NDozNiswMjowMAZN3oQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTYtMDktMDZUMDc6NDQ6MzYrMDI6MDB3EGY4AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg=='

function RefreshControl(props) {
  const propsRef = useRef(props)
  useEffect(() => {
    propsRef.current = props
  }, [props])

  const contentContainerRef = useRef()
  const pullPosReachedState = useRef(0)
  const pullPosReachedAnimated = useRef(new Animated.Value(0))
  const pullDownSwipeMargin = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(pullDownSwipeMargin.current, {
      toValue: props.refreshing ? 50 : 0,
      duration: 350,
    }).start()
    if (props.refreshing) {
      pullPosReachedState.current = 0
      pullPosReachedAnimated.current.setValue(0)
    }
  }, [props.refreshing])

  const resetPullVariables = useCallback(() => {
    if (!pullPosReachedState.current) {
      Animated.timing(pullDownSwipeMargin.current, {
        toValue: 0,
        duration: 350,
      }).start()
    }
  }, [])
  const resetPullVariablesRef = useRef(resetPullVariables)
  useEffect(() => {
    resetPullVariablesRef.current = resetPullVariables
  }, [resetPullVariables])

  const onPanResponderFinish = useCallback((evt, gestureState) => {
    if (pullPosReachedState.current && propsRef.current.onRefresh) {
      propsRef.current.onRefresh()
    }
    resetPullVariablesRef.current()
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!contentContainerRef.current) return false
        const containerDOM = findNodeHandle(contentContainerRef.current)
        return containerDOM ? containerDOM.children[0].scrollTop === 0 : false
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      onPanResponderMove: (evt, gestureState) => {
        if (propsRef.current.enabled !== undefined && !propsRef.current.enabled) return

        const adjustedDy = gestureState.dy <= 0 ? 0 : (gestureState.dy * 150) / (gestureState.dy + 120) // Diminishing returns function
        pullDownSwipeMargin.current.setValue(adjustedDy)
        const newValue = adjustedDy > 45 ? 1 : 0
        if (newValue !== pullPosReachedState.current) {
          pullPosReachedState.current = newValue
          Animated.timing(pullPosReachedAnimated.current, {
            toValue: newValue,
            duration: 150,
          }).start()
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: onPanResponderFinish,
      onPanResponderTerminate: onPanResponderFinish,
    })
  )

  const refreshIndicatorColor = useMemo(
    () => (props.tintColor ? props.tintColor : props.colors && props.colors.length ? props.colors[0] : null),
    [props.colors, props.tintColor]
  )
  const pullDownIconStyle = useMemo(
    () => ({
      width: 22,
      height: 22,
      marginBottom: 18,
      transform: [
        {
          rotate: pullPosReachedAnimated.current.interpolate({
            inputRange: [0, 1],
            outputRange: ['90deg', '270deg'],
          }),
        },
      ],
    }),
    []
  )

  const indicatorTransformStyle = useMemo(
    () => ({
      marginTop: -40,
      transform: [{ translateY: pullDownSwipeMargin.current }],
    }),
    []
  )
  const contentContainerStyle = useMemo(
    () => ({
      flex: 1,
      transform: [{ translateY: pullDownSwipeMargin.current }],
    }),
    []
  )

  return (
    <Animated.View
      style={[props.style, { overflowY: 'hidden', overflow: 'hidden' }]}
      {...panResponder.current.panHandlers}>
      <Animated.View style={[indicatorTransformStyle, { marginLeft: 'auto', marginRight: 'auto' }]}>
        {props.refreshing ? (
          <>
            <ActivityIndicator
              color={refreshIndicatorColor || undefined}
              size={props.size || undefined}
              style={{ marginVertical: 10 }}
            />
            {props.title && (
              <Text style={{ color: props.titleColor, textAlign: 'center', marginTop: 5 }}>{props.title}</Text>
            )}
          </>
        ) : (
          <Animated.Image source={{ uri: arrowIcon }} style={pullDownIconStyle} />
        )}
      </Animated.View>
      {props.progressViewOffset && <View style={{ marginTop: props.progressViewOffset }} />}
      <Animated.View ref={contentContainerRef} style={contentContainerStyle}>
        {props.children}
      </Animated.View>
    </Animated.View>
  )
}

RefreshControl.propTypes = {
  ...ViewPropTypes,
  colors: PropTypes.arrayOf(ColorPropType),
  enabled: PropTypes.bool,
  onRefresh: PropTypes.func,
  progressBackgroundColor: ColorPropType,
  progressViewOffset: PropTypes.number,
  refreshing: PropTypes.bool.isRequired,
  size: PropTypes.oneOf(['small', 'large']),
  tintColor: ColorPropType,
  title: PropTypes.string,
  titleColor: ColorPropType,
}

export default RefreshControl

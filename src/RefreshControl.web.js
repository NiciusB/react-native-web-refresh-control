import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, PanResponder, Animated, ActivityIndicator, findNodeHandle } from 'react-native'
import PropTypes from 'prop-types'

const arrowIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfgCQYHLCTylhV1AAAAjklEQVQ4y2P8z0AaYCJRPX4NsyNWM5Ok4R/n+/noWhjx+2F20n8HwcTQv0T7IXUe4wFUWwh6Gl0LEaGEqoWoYEXWQmQ8ILQwEh/TkBBjme3HIESkjn+Mv9/vJjlpkOwkom2AxTmRGhBJhCgNyCmKCA2oCZCgBvT0ykSacgIaZiaiKydoA7pykiKOSE+jAwADZUnJjMWwUQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNi0wOS0wNlQwNzo0NDozNiswMjowMAZN3oQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTYtMDktMDZUMDc6NDQ6MzYrMDI6MDB3EGY4AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg=='

RefreshControl.propTypes = {
  colors: PropTypes.array,
  enabled: PropTypes.bool,
  onRefresh: PropTypes.func,
  progressBackgroundColor: PropTypes.any,
  progressViewOffset: PropTypes.number,
  refreshing: PropTypes.bool.isRequired,
  size: PropTypes.oneOf(['small', 'large']),
  tintColor: PropTypes.any,
  title: PropTypes.string,
  titleColor: PropTypes.any,
  style: PropTypes.any,
  children: PropTypes.any,
}
export default function RefreshControl({
  refreshing,
  tintColor,
  colors,
  style,
  progressViewOffset,
  children,
  size,
  title,
  titleColor,
  onRefresh,
  enabled,
}) {
  const onRefreshRef = useRef(onRefresh)
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])
  const enabledRef = useRef(enabled)
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const containerRef = useRef()
  const pullPosReachedState = useRef(0)
  const pullPosReachedAnimated = useRef(new Animated.Value(0))
  const pullDownSwipeMargin = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(pullDownSwipeMargin.current, {
      toValue: refreshing ? 50 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start()
    if (refreshing) {
      pullPosReachedState.current = 0
      pullPosReachedAnimated.current.setValue(0)
    }
  }, [refreshing])

  const onPanResponderFinish = useCallback(() => {
    if (pullPosReachedState.current && onRefreshRef.current) {
      onRefreshRef.current()
    }
    if (!pullPosReachedState.current) {
      Animated.timing(pullDownSwipeMargin.current, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start()
    }
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => {
        if (!containerRef.current) return false
        const containerDOM = findNodeHandle(containerRef.current)
        if (!containerDOM) return false
        return containerDOM.children[0].scrollTop === 0
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (enabledRef.current !== undefined && !enabledRef.current) return

        const adjustedDy = gestureState.dy <= 0 ? 0 : (gestureState.dy * 150) / (gestureState.dy + 120) // Diminishing returns function
        pullDownSwipeMargin.current.setValue(adjustedDy)
        const newValue = adjustedDy > 45 ? 1 : 0
        if (newValue !== pullPosReachedState.current) {
          pullPosReachedState.current = newValue
          Animated.timing(pullPosReachedAnimated.current, {
            toValue: newValue,
            duration: 150,
            useNativeDriver: false,
          }).start()
        }
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: onPanResponderFinish,
      onPanResponderTerminate: onPanResponderFinish,
    })
  )

  const refreshIndicatorColor = useMemo(() => (tintColor ? tintColor : colors && colors.length ? colors[0] : null), [
    colors,
    tintColor,
  ])
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

  const containerStyle = useMemo(
    () => [style, { overflowY: 'hidden', overflow: 'hidden', paddingTop: progressViewOffset }],
    [progressViewOffset, style]
  )
  const indicatorTransformStyle = useMemo(
    () => ({
      alignSelf: 'center',
      marginTop: -40,
      height: 40,
      transform: [{ translateY: pullDownSwipeMargin.current }],
    }),
    []
  )

  // This is messing with react-native-web's internal implementation
  // Will probably break if anything changes on their end
  const AnimatedContentContainer = useMemo(
    () => withAnimated(childProps => <children.props.children.type {...childProps} />),
    []
  )
  const newContentContainerStyle = useMemo(
    () => [children.props.children.props.style, { transform: [{ translateY: pullDownSwipeMargin.current }] }],
    [children.props.children.props.style]
  )
  const newChildren = React.cloneElement(
    children,
    null,
    <>
      <Animated.View style={indicatorTransformStyle}>
        {refreshing ? (
          <>
            <ActivityIndicator
              color={refreshIndicatorColor || undefined}
              size={size || undefined}
              style={{ marginVertical: 10 }}
            />
            {title && <Text style={{ color: titleColor, textAlign: 'center', marginTop: 5 }}>{title}</Text>}
          </>
        ) : (
          <Animated.Image source={{ uri: arrowIcon }} style={pullDownIconStyle} />
        )}
      </Animated.View>
      <AnimatedContentContainer {...children.props.children.props} style={newContentContainerStyle} />
    </>
  )

  return (
    <View ref={containerRef} style={containerStyle} {...panResponder.current.panHandlers}>
      {newChildren}
    </View>
  )
}

function withAnimated(WrappedComponent) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  class WithAnimated extends React.Component {
    static displayName = `WithAnimated(${displayName})`

    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  return Animated.createAnimatedComponent(WithAnimated)
}

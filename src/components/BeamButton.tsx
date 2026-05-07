import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/tokens';

interface BeamButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isPrimary?: boolean;
}

export const BeamButton: React.FC<BeamButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  isPrimary = false,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={StyleSheet.absoluteFill}
      >
        {/* Rotating gradient border */}
        <View style={styles.borderWrapper}>
          <Animated.View
            style={[
              styles.beamContent,
              { transform: [{ translateX: -75 }, { translateY: -75 }, { rotate: spin }] },
            ]}
          >
            <LinearGradient
              colors={
                isPrimary
                  ? ['transparent', theme.colors.primary, 'transparent']
                  : ['transparent', 'rgba(255,255,255,0.7)', 'transparent']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </View>

        {/* Inner button content */}
        <View
          style={[
            styles.inner,
            isPrimary
              ? { backgroundColor: theme.colors.primary }
              : { backgroundColor: theme.colors.surface1 },
          ]}
        >
          <Text
            style={[
              styles.text,
              isPrimary
                ? { color: '#FFF', fontWeight: '600' }
                : { color: theme.colors.textPrimary },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  borderWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  beamContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%',
    height: '200%',
  },
  inner: {
    margin: 2,
    borderRadius: theme.radii.full,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    letterSpacing: 0.3,
  },
});

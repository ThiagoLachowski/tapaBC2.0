import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
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
  isPrimary = false
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1, // infinite
      false // do not reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.container, 
        style,
        pressed && { transform: [{ scale: 0.98 }] }
      ]}
    >
      {/* The rotating gradient behind the inner content */}
      <View style={styles.borderWrapper}>
        <Animated.View style={[styles.beamContent, animatedStyle]}>
          <LinearGradient
            colors={isPrimary 
              ? ['transparent', theme.colors.primary, 'transparent'] 
              : ['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </View>

      {/* The Inner Button Content */}
      <View style={[
        styles.inner, 
        isPrimary ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surface1 }
      ]}>
        <Text style={[
          styles.text, 
          isPrimary ? { color: '#FFF', fontWeight: '600' } : { color: theme.colors.textPrimary },
          textStyle
        ]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  borderWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  beamContent: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
  },
  inner: {
    margin: 1.5, // The thickness of the animated border
    borderRadius: theme.radii.full,
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
  }
});

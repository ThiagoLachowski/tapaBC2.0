import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import Animated, { FadeInUp, FadeInDown, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/tokens';
import { BeamButton } from '../components/BeamButton';

const { height } = Dimensions.get('window');

export const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Background Dark Gradient (derived from animation-clean) */}
        <LinearGradient
          colors={[theme.colors.surface1, theme.colors.background]}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Vertical Grid Lines Effect (adapted from bg-column) */}
        <View style={styles.gridContainer} pointerEvents="none">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Animated.View 
              key={i} 
              entering={FadeInDown.delay(100 * i).duration(1000)}
              style={styles.gridLine} 
            />
          ))}
        </View>

        <View style={styles.content}>
          {/* Badge */}
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Caxias Buracos v2.0</Text>
            </View>
          </Animated.View>

          {/* Hero Titles */}
          <Animated.Text 
            entering={FadeInUp.delay(300).springify()}
            style={styles.title}
          >
            Ajudando a construir
          </Animated.Text>
          <Animated.Text 
            entering={FadeInUp.delay(400).springify()}
            style={[styles.title, { color: theme.colors.primary }]}
          >
            ruas melhores.
          </Animated.Text>

          <Animated.Text 
            entering={FadeInUp.delay(500).springify()}
            style={styles.subtitle}
          >
            Conecte-se para reportar buracos, visualizar o mapa da cidade e interagir com a comunidade.
          </Animated.Text>

          {/* CTA Buttons */}
          <Animated.View 
            entering={FadeInUp.delay(600).springify()}
            style={styles.actionContainer}
          >
            <BeamButton 
              title="Entrar com Caxias" 
              isPrimary 
              style={styles.primaryBtn} 
            />
            <BeamButton 
              title="Ver Mapa (Visitante)" 
              style={styles.secondaryBtn} 
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.1,
  },
  gridLine: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  badgeText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  title: {
    fontSize: theme.typography.sizes.hero * 0.8, // scaled for mobile
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    maxWidth: '80%',
    lineHeight: 24,
  },
  actionContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  }
});

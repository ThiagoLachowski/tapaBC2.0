import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/tokens';
import { BeamButton } from '../components/BeamButton';

// ─── Animated fade-in helper ──────────────────────────────────────────────────
function useFadeInUp(delay: number, duration = 600) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay, duration]);

  return { opacity, transform: [{ translateY }] };
}

// ─── Grid line individual component ───────────────────────────────────────────
function GridLine({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [opacity, delay]);

  return <Animated.View style={[styles.gridLine, { opacity }]} />;
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export const WelcomeScreen = ({ onLoginPress, onRegisterPress }: { onLoginPress: () => void, onRegisterPress: () => void }) => {
  const badgeAnim  = useFadeInUp(150);
  const title1Anim = useFadeInUp(300);
  const title2Anim = useFadeInUp(420);
  const subAnim    = useFadeInUp(540);
  const btnsAnim   = useFadeInUp(660);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Dark gradient background */}
        <LinearGradient
          colors={[theme.colors.surface1, theme.colors.background]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Subtle radial glow at top */}
        <LinearGradient
          colors={['rgba(249,115,22,0.08)', 'transparent']}
          style={styles.glowTop}
        />

        {/* Vertical grid lines */}
        <View style={styles.gridContainer} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <GridLine key={i} delay={80 * i} />
          ))}
        </View>

        {/* Main content */}
        <View style={styles.content}>

          {/* Badge */}
          <Animated.View style={[styles.badgeWrapper, badgeAnim]}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Caxias Buracos v2.0</Text>
            </View>
          </Animated.View>

          {/* Hero title */}
          <Animated.Text style={[styles.title, title1Anim]}>
            Ajudando a construir
          </Animated.Text>
          <Animated.Text style={[styles.title, styles.titleAccent, title2Anim]}>
            ruas melhores.
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, subAnim]}>
            Reporte buracos, visualize o mapa e interaja com a sua comunidade em Caxias.
          </Animated.Text>

          {/* Divider line */}
          <Animated.View style={[styles.divider, subAnim]} />

          {/* CTA buttons */}
          <Animated.View style={[styles.actionContainer, btnsAnim]}>
            <BeamButton
              title="Entrar com conta Caxias"
              isPrimary
              onPress={onLoginPress}
              style={styles.btn}
            />
            <BeamButton
              title="Se registrar"
              onPress={onRegisterPress}
              style={styles.btn}
            />
          </Animated.View>

          {/* Footer note */}
          <Animated.Text style={[styles.footerNote, btnsAnim]}>
            Ao entrar, você concorda com os termos de uso da plataforma.
          </Animated.Text>
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
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: '10%',
    width: '80%',
    height: 400,
    borderRadius: 200,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0.12,
  },
  gridLine: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  badgeWrapper: {
    marginBottom: theme.spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.12)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily.medium,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  titleAccent: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '88%',
  },
  divider: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(249,115,22,0.4)',
    marginVertical: theme.spacing.xl,
  },
  actionContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  btn: {
    width: '100%',
  },
  footerNote: {
    marginTop: theme.spacing.lg,
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.regular,
  },
});

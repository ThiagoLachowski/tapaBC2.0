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
import { theme as staticTheme } from '../theme/tokens';
import { BeamButton } from '../components/BeamButton';
import { useTheme } from '../context/ThemeContext';

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
export const WelcomeScreen = ({ onLoginPress, onRegisterPress }: { onLoginPress: () => void, onRegisterPress: () => void }) => {
  const { theme, isDark } = useTheme();
  const badgeAnim  = useFadeInUp(150);
  const title1Anim = useFadeInUp(300);
  const title2Anim = useFadeInUp(420);
  const subAnim    = useFadeInUp(540);
  const btnsAnim   = useFadeInUp(660);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>

        {/* Dynamic gradient background */}
        <LinearGradient
          colors={[theme.colors.surface1, theme.colors.background]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Subtle radial glow at top */}
        <LinearGradient
          colors={[isDark ? 'rgba(249,115,22,0.08)' : 'rgba(16,185,129,0.08)', 'transparent']}
          style={styles.glowTop}
        />

        {/* Vertical grid lines */}
        <View style={styles.gridContainer} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <GridLine key={i} delay={80 * i} theme={theme} />
          ))}
        </View>

        {/* Main content */}
        <View style={styles.content}>

          {/* Badge */}
          <Animated.View style={[styles.badgeWrapper, badgeAnim]}>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '44' }]}>
              <View style={[styles.badgeDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Caxias Buracos v2.0</Text>
            </View>
          </Animated.View>

          {/* Hero title */}
          <Animated.Text style={[styles.title, { color: theme.colors.textPrimary }, title1Anim]}>
            Ajudando a construir
          </Animated.Text>
          <Animated.Text style={[styles.title, styles.titleAccent, { color: theme.colors.primary }, title2Anim]}>
            ruas melhores.
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, { color: theme.colors.textSecondary }, subAnim]}>
            Reporte buracos, visualize o mapa e interaja com a sua comunidade em Caxias.
          </Animated.Text>

          {/* Divider line */}
          <Animated.View style={[styles.divider, { backgroundColor: theme.colors.primary + '44' }, subAnim]} />

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
          <Animated.Text style={[styles.footerNote, { color: theme.colors.textMuted }, btnsAnim]}>
            Ao entrar, você concorda com os termos de uso da plataforma.
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

function GridLine({ delay, theme }: { delay: number; theme: any }) {
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

  return <Animated.View style={[styles.gridLine, { opacity, backgroundColor: theme.colors.textPrimary }]} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: staticTheme.colors.background,
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
    backgroundColor: staticTheme.colors.textPrimary,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: staticTheme.spacing.lg,
    zIndex: 10,
  },
  badgeWrapper: {
    marginBottom: staticTheme.spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.12)',
    paddingHorizontal: staticTheme.spacing.md,
    paddingVertical: staticTheme.spacing.xs,
    borderRadius: staticTheme.radii.full,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: staticTheme.colors.primary,
    marginRight: staticTheme.spacing.sm,
  },
  badgeText: {
    color: staticTheme.colors.primary,
    fontSize: staticTheme.typography.sizes.xs,
    fontFamily: staticTheme.typography.fontFamily.medium,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontFamily: staticTheme.typography.fontFamily.semiBold,
    color: staticTheme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  titleAccent: {
    color: staticTheme.colors.primary,
    marginBottom: staticTheme.spacing.lg,
  },
  subtitle: {
    fontSize: staticTheme.typography.sizes.md,
    fontFamily: staticTheme.typography.fontFamily.regular,
    color: staticTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '88%',
  },
  divider: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(249,115,22,0.4)',
    marginVertical: staticTheme.spacing.xl,
  },
  actionContainer: {
    width: '100%',
    gap: staticTheme.spacing.md,
  },
  btn: {
    width: '100%',
  },
  footerNote: {
    marginTop: staticTheme.spacing.lg,
    fontSize: 11,
    color: staticTheme.colors.textMuted,
    textAlign: 'center',
    fontFamily: staticTheme.typography.fontFamily.regular,
  },
});

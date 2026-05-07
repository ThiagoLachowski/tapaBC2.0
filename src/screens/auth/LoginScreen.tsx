import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  Animated, Easing, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { BeamButton } from '../../components/BeamButton';
import { theme } from '../../theme/tokens';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

// ── Animated input field ───────────────────────────────────────────────────────
function Field({
  label, placeholder, value, onChangeText, secure = false, keyboardType = 'default',
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; secure?: boolean; keyboardType?: any;
}) {
  const borderColor = useRef(new Animated.Value(0)).current;
  const [showPwd, setShowPwd] = useState(false);

  const animIn  = () => Animated.timing(borderColor, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const animOut = () => Animated.timing(borderColor, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const border = borderColor.interpolate({ inputRange: [0, 1], outputRange: [theme.colors.border, theme.colors.primary] });

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Animated.View style={[styles.fieldBox, { borderColor: border }]}>
        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !showPwd}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={animIn}
          onBlur={animOut}
        />
        {secure && (
          <Pressable onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Fade-in entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true);
    setError('');
    const err = await login(email, password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[theme.colors.surface1, theme.colors.background]} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['rgba(249,115,22,0.10)', 'transparent']} style={styles.glow} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Logo / brand */}
            <View style={styles.brand}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🕳️</Text>
              </View>
              <Text style={styles.logoTitle}>Caxias Buracos</Text>
              <Text style={styles.logoSub}>Conecte-se para contribuir</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Entrar na conta</Text>

              <Field
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Field
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secure
              />

              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️  {error}</Text>
                </View>
              )}

              <BeamButton
                title={loading ? 'Entrando...' : 'Entrar'}
                isPrimary
                style={styles.submitBtn}
                onPress={handleLogin}
              />
              {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 8 }} />}
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
              <Text style={styles.registerText}>
                Não tem conta?{' '}
                <Text style={styles.registerHighlight}>Criar conta gratuita →</Text>
              </Text>
            </Pressable>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: theme.colors.background },
  glow:     { position: 'absolute', top: -50, left: '5%', width: '90%', height: 350, borderRadius: 200 },
  scroll:   { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
  container:{ gap: theme.spacing.lg },

  brand:       { alignItems: 'center', gap: 8 },
  logoCircle:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.4)', justifyContent: 'center', alignItems: 'center' },
  logoEmoji:   { fontSize: 32 },
  logoTitle:   { fontSize: 24, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  logoSub:     { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular },

  card:        { backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },
  cardTitle:   { fontSize: 18, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold, marginBottom: 4 },

  fieldWrapper:{ gap: 6 },
  fieldLabel:  { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md, borderWidth: 1.5, paddingHorizontal: theme.spacing.md },
  fieldInput:  { flex: 1, color: theme.colors.textPrimary, fontSize: 15, fontFamily: theme.typography.fontFamily.regular, paddingVertical: 13 },
  eyeBtn:      { padding: 4 },
  eyeIcon:     { fontSize: 16 },

  errorBox:    { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: theme.radii.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: theme.spacing.sm },
  errorText:   { color: '#EF4444', fontSize: 13, fontFamily: theme.typography.fontFamily.regular },

  submitBtn:   { marginTop: 4 },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.typography.fontFamily.regular },

  registerLink:   { alignItems: 'center' },
  registerText:   { color: theme.colors.textSecondary, fontSize: 14, fontFamily: theme.typography.fontFamily.regular },
  registerHighlight: { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold },
});

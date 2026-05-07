import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  Animated, Easing, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { BeamButton } from '../../components/BeamButton';
import { theme } from '../../theme/tokens';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

// ── Avatar options ────────────────────────────────────────────────────────────
const AVATARS = [
  { key: 'orange',  bg: '#F97316', initials: true },
  { key: 'indigo',  bg: '#6366F1', initials: true },
  { key: 'emerald', bg: '#10B981', initials: true },
  { key: 'rose',    bg: '#F43F5E', initials: true },
  { key: 'sky',     bg: '#0EA5E9', initials: true },
  { key: 'violet',  bg: '#8B5CF6', initials: true },
];

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, placeholder, value, onChangeText, secure = false, keyboardType = 'default', autoCapitalize = 'none' }: {
  label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; secure?: boolean;
  keyboardType?: any; autoCapitalize?: any;
}) {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [showPwd, setShowPwd] = useState(false);
  const animIn  = () => Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const animOut = () => Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  const border  = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.colors.border, theme.colors.primary] });

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
          autoCapitalize={autoCapitalize}
          onFocus={animIn}
          onBlur={animOut}
        />
        {secure && (
          <Pressable onPress={() => setShowPwd(!showPwd)} style={{ padding: 4 }}>
            <Text style={{ fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

// ── Avatar picker ─────────────────────────────────────────────────────────────
function AvatarPicker({ name, selected, onSelect }: {
  name: string; selected: string; onSelect: (key: string) => void;
}) {
  const initials = name.trim().split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'CX';
  return (
    <View style={styles.avatarSection}>
      {/* Big preview */}
      <View style={[styles.avatarPreview, { backgroundColor: AVATARS.find(a => a.key === selected)?.bg ?? '#F97316' }]}>
        <Text style={styles.avatarPreviewText}>{initials}</Text>
      </View>
      <Text style={styles.avatarHint}>Escolha uma cor para seu perfil</Text>

      {/* Color grid */}
      <View style={styles.avatarGrid}>
        {AVATARS.map(a => (
          <Pressable
            key={a.key}
            onPress={() => onSelect(a.key)}
            style={[
              styles.avatarOption,
              { backgroundColor: a.bg },
              selected === a.key && styles.avatarOptionSelected,
            ]}
          >
            {selected === a.key && <Text style={styles.avatarCheck}>✓</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [avatar, setAvatar]     = useState('orange');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Step: 0 = info, 1 = avatar
  const [step, setStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const goNext = () => {
    if (!name.trim())     { setError('Digite seu nome.'); return; }
    if (!email.trim())    { setError('Digite seu e-mail.'); return; }
    if (password.length < 6) { setError('Senha mínima de 6 caracteres.'); return; }
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    setError('');
    setStep(1);
  };

  const handleRegister = async () => {
    setLoading(true);
    const err = await register(name, email, password, avatar);
    setLoading(false);
    if (err) { setError(err); setStep(0); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[theme.colors.surface1, theme.colors.background]} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['rgba(99,102,241,0.10)', 'transparent']} style={styles.glow} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={() => step === 1 ? setStep(0) : navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>← Voltar</Text>
              </Pressable>
              <View>
                <Text style={styles.headerTitle}>{step === 0 ? 'Criar conta' : 'Foto de perfil'}</Text>
                <Text style={styles.headerSub}>{step === 0 ? 'Preencha suas informações' : 'Escolha como te reconhecer'}</Text>
              </View>

              {/* Step dots */}
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, step >= 0 && styles.stepDotActive]} />
                <View style={[styles.stepLine, step >= 1 && styles.stepLineDone]} />
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              </View>
            </View>

            {/* Step 0 – Info */}
            {step === 0 && (
              <View style={styles.card}>
                <Field
                  label="Nome completo"
                  placeholder="Como você se chama?"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <Field
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <Field
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secure
                />
                <Field
                  label="Confirmar senha"
                  placeholder="Repita sua senha"
                  value={confirm}
                  onChangeText={setConfirm}
                  secure
                />
                {!!error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️  {error}</Text>
                  </View>
                )}
                <BeamButton title="Próximo →" isPrimary style={styles.btn} onPress={goNext} />
              </View>
            )}

            {/* Step 1 – Avatar */}
            {step === 1 && (
              <View style={styles.card}>
                <AvatarPicker name={name} selected={avatar} onSelect={setAvatar} />
                {!!error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️  {error}</Text>
                  </View>
                )}
                <BeamButton
                  title={loading ? 'Criando conta...' : 'Criar minha conta ✓'}
                  isPrimary
                  style={styles.btn}
                  onPress={handleRegister}
                />
                {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 8 }} />}
              </View>
            )}

            {/* Login link */}
            {step === 0 && (
              <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                <Text style={styles.loginText}>
                  Já tem conta?{' '}
                  <Text style={styles.loginHighlight}>Entrar →</Text>
                </Text>
              </Pressable>
            )}

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

  header:     { gap: theme.spacing.sm },
  backBtn:    { alignSelf: 'flex-start' },
  backText:   { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 14 },
  headerTitle:{ fontSize: 22, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  headerSub:  { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular },
  stepRow:    { flexDirection: 'row', alignItems: 'center', gap: 0, marginTop: 4 },
  stepDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  stepDotActive: { backgroundColor: theme.colors.primary },
  stepLine:   { width: 24, height: 2, backgroundColor: theme.colors.border, marginHorizontal: 4 },
  stepLineDone:{ backgroundColor: theme.colors.primary },

  card:       { backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },

  fieldWrapper:{ gap: 6 },
  fieldLabel:  { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md, borderWidth: 1.5, paddingHorizontal: theme.spacing.md },
  fieldInput:  { flex: 1, color: theme.colors.textPrimary, fontSize: 15, fontFamily: theme.typography.fontFamily.regular, paddingVertical: 13 },

  errorBox:   { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: theme.radii.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: theme.spacing.sm },
  errorText:  { color: '#EF4444', fontSize: 13, fontFamily: theme.typography.fontFamily.regular },

  btn:        { marginTop: 4 },

  // Avatar
  avatarSection:   { alignItems: 'center', gap: theme.spacing.md },
  avatarPreview:   { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)' },
  avatarPreviewText:{ color: '#FFF', fontSize: 30, fontFamily: theme.typography.fontFamily.semiBold },
  avatarHint:      { color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.typography.fontFamily.regular },
  avatarGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' },
  avatarOption:    { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarOptionSelected: { borderWidth: 3, borderColor: '#FFF' },
  avatarCheck:     { color: '#FFF', fontSize: 18, fontFamily: theme.typography.fontFamily.semiBold },

  loginLink:      { alignItems: 'center' },
  loginText:      { color: theme.colors.textSecondary, fontSize: 14, fontFamily: theme.typography.fontFamily.regular },
  loginHighlight: { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold },
});

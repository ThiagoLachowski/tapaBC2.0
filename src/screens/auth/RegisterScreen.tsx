import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  Animated, Easing, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { BeamButton } from '../../components/BeamButton';
import { theme } from '../../theme/tokens';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

const AVATARS = [
  { key: 'orange',  bg: '#F97316' },
  { key: 'indigo',  bg: '#6366F1' },
  { key: 'emerald', bg: '#10B981' },
  { key: 'rose',    bg: '#F43F5E' },
  { key: 'sky',     bg: '#0EA5E9' },
  { key: 'violet',  bg: '#8B5CF6' },
];

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

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [avatar, setAvatar]     = useState('orange');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [step, setStep]         = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso às suas fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      setIsCustom(true);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const err = await register(name, email, password, avatar, isCustom);
    setLoading(false);
    if (err) { setError(err); setStep(0); }
  };

  const initials = name.trim().split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'CX';

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[theme.colors.surface1, theme.colors.background]} style={StyleSheet.absoluteFillObject} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            <View style={styles.header}>
              <Pressable onPress={() => step === 1 ? setStep(0) : navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>← Voltar</Text>
              </Pressable>
              <Text style={styles.headerTitle}>{step === 0 ? 'Criar conta' : 'Foto de perfil'}</Text>
              <Text style={styles.headerSub}>{step === 0 ? 'Preencha suas informações' : 'Escolha como te reconhecer'}</Text>
            </View>

            {step === 0 && (
              <View style={styles.card}>
                <Field label="Nome completo" placeholder="Como você se chama?" value={name} onChangeText={setName} autoCapitalize="words" />
                <Field label="E-mail" placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <Field label="Senha" placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword} secure />
                <Field label="Confirmar senha" placeholder="Repita sua senha" value={confirm} onChangeText={setConfirm} secure />
                {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠️  {error}</Text></View>}
                <BeamButton title="Próximo →" isPrimary style={styles.btn} onPress={() => {
                  if(!name || !email || password.length < 6 || password !== confirm) {
                    setError('Verifique os campos acima.'); return;
                  }
                  setError(''); setStep(1);
                }} />
              </View>
            )}

            {step === 1 && (
              <View style={styles.card}>
                <View style={styles.avatarSection}>
                  <View style={[styles.avatarPreview, !isCustom && { backgroundColor: AVATARS.find(a => a.key === avatar)?.bg || '#F97316' }]}>
                    {isCustom ? (
                      <Image source={{ uri: avatar }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarPreviewText}>{initials}</Text>
                    )}
                  </View>
                  
                  <Pressable style={styles.galleryBtn} onPress={pickImage}>
                    <Text style={styles.galleryBtnIcon}>🖼️</Text>
                    <Text style={styles.galleryBtnText}>Escolher da Galeria</Text>
                  </Pressable>

                  <Text style={styles.avatarHint}>Ou selecione uma cor sólida:</Text>
                  <View style={styles.avatarGrid}>
                    {AVATARS.map(a => (
                      <Pressable key={a.key} onPress={() => { setAvatar(a.key); setIsCustom(false); }} style={[styles.avatarOption, { backgroundColor: a.bg }, !isCustom && avatar === a.key && styles.avatarOptionSelected]} />
                    ))}
                  </View>
                </View>

                <BeamButton title={loading ? 'Criando conta...' : 'Criar minha conta ✓'} isPrimary style={styles.btn} onPress={handleRegister} />
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: theme.colors.background },
  scroll:   { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
  container:{ gap: theme.spacing.lg },
  header:     { gap: 4 },
  backBtn:    { alignSelf: 'flex-start', marginBottom: 8 },
  backText:   { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 14 },
  headerTitle:{ fontSize: 22, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  headerSub:  { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular },
  card:       { backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },
  fieldWrapper:{ gap: 6 },
  fieldLabel:  { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md, borderWidth: 1.5, paddingHorizontal: theme.spacing.md },
  fieldInput:  { flex: 1, color: theme.colors.textPrimary, fontSize: 15, fontFamily: theme.typography.fontFamily.regular, paddingVertical: 13 },
  errorBox:   { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: theme.radii.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: theme.spacing.sm },
  errorText:  { color: '#EF4444', fontSize: 13, fontFamily: theme.typography.fontFamily.regular },
  btn:        { marginTop: 4 },
  avatarSection:   { alignItems: 'center', gap: theme.spacing.md },
  avatarPreview:   { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  avatarImg:       { width: '100%', height: '100%' },
  avatarPreviewText:{ color: '#FFF', fontSize: 30, fontFamily: theme.typography.fontFamily.semiBold },
  galleryBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface2, paddingVertical: 10, paddingHorizontal: 16, borderRadius: theme.radii.full, borderWidth: 1, borderColor: theme.colors.border, gap: 8 },
  galleryBtnIcon:  { fontSize: 18 },
  galleryBtnText:  { color: theme.colors.textPrimary, fontSize: 13, fontFamily: theme.typography.fontFamily.medium },
  avatarHint:      { color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.typography.fontFamily.regular, marginTop: 8 },
  avatarGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' },
  avatarOption:    { width: 42, height: 42, borderRadius: 21 },
  avatarOptionSelected: { borderWidth: 3, borderColor: '#FFF' },
});

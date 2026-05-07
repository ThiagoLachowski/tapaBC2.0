import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/tokens';
import { BeamButton } from '../components/BeamButton';

// ── Types ────────────────────────────────────────────────────────────────────
type Severity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

const SEVERITIES: { label: Severity; color: string; icon: string }[] = [
  { label: 'Baixa',   color: '#22C55E', icon: '🟢' },
  { label: 'Média',   color: '#F97316', icon: '🟡' },
  { label: 'Alta',    color: '#EF4444', icon: '🔴' },
  { label: 'Crítica', color: '#A855F7', icon: '🚨' },
];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDot({ active, done, n }: { active: boolean; done: boolean; n: number }) {
  return (
    <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
      {done
        ? <Text style={styles.stepDotText}>✓</Text>
        : <Text style={styles.stepDotText}>{n}</Text>
      }
    </View>
  );
}

// ── Animated label input ──────────────────────────────────────────────────────
function LabelInput({ label, placeholder, value, onChangeText, multiline = false }: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; multiline?: boolean;
}) {
  const focused = useRef(new Animated.Value(0)).current;
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => Animated.timing(focused, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
        onBlur={() => Animated.timing(focused, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
      />
    </View>
  );
}

// ── Photo placeholder ─────────────────────────────────────────────────────────
function PhotoSlot({ filled }: { filled: boolean }) {
  return (
    <Pressable style={[styles.photoSlot, filled && styles.photoSlotFilled]}>
      {filled
        ? <Text style={styles.photoCheck}>✓</Text>
        : <Text style={styles.photoPlus}>＋</Text>
      }
    </Pressable>
  );
}

// ── Success overlay ───────────────────────────────────────────────────────────
function SuccessScreen({ onReset }: { onReset: () => void }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View style={[styles.successContainer, { opacity, transform: [{ scale }] }]}>
      <View style={styles.successIcon}>
        <Text style={{ fontSize: 40 }}>📍</Text>
      </View>
      <Text style={styles.successTitle}>Reporte enviado!</Text>
      <Text style={styles.successSub}>
        Seu relato foi adicionado ao mapa de Caxias. Obrigado pela contribuição!
      </Text>
      <BeamButton title="Novo Reporte" isPrimary onPress={onReset} style={{ width: '80%', marginTop: 24 }} />
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export const ReportScreen = () => {
  const [step, setStep]           = useState(0); // 0=local, 1=details, 2=done
  const [street, setStreet]       = useState('');
  const [neighborhood, setNhood]  = useState('');
  const [description, setDesc]    = useState('');
  const [severity, setSeverity]   = useState<Severity | null>(null);
  const [photos]                  = useState([true, false, false]); // sim 1 foto "tirada"

  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToStep = (s: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
    setStep(s);
  };

  if (step === 2) return <SuccessScreen onReset={() => { setStreet(''); setNhood(''); setDesc(''); setSeverity(null); setStep(0); }} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reportar Buraco</Text>
          <Text style={styles.headerSub}>Ajude a melhorar as vias de Caxias</Text>
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <StepDot n={1} active={step === 0} done={step > 0} />
          <View style={[styles.stepLine, step > 0 && styles.stepLineDone]} />
          <StepDot n={2} active={step === 1} done={step > 1} />
          <View style={styles.stepLine} />
          <StepDot n={3} active={false} done={false} />
        </View>
        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>Localização</Text>
          <Text style={styles.stepLabel}>Detalhes</Text>
          <Text style={styles.stepLabel}>Enviar</Text>
        </View>

        <Animated.View style={{ opacity: slideAnim.interpolate({ inputRange: [-30, 0], outputRange: [0, 1] }), transform: [{ translateX: slideAnim }] }}>

          {/* STEP 0 – Location */}
          {step === 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📍 Onde é o buraco?</Text>
              <LabelInput label="Rua / Avenida" placeholder="Ex: Av. Getúlio Vargas" value={street} onChangeText={setStreet} />
              <LabelInput label="Bairro" placeholder="Ex: Centro" value={neighborhood} onChangeText={setNhood} />

              <View style={styles.mapMini}>
                <View style={styles.mapMiniContent}>
                  <Text style={styles.mapMiniText}>📌 Toque para fixar no mapa</Text>
                  <Text style={styles.mapMiniSub}>(integração de mapa em breve)</Text>
                </View>
              </View>

              <BeamButton
                title="Próximo →"
                isPrimary
                style={styles.ctaBtn}
                onPress={() => { if (street && neighborhood) goToStep(1); }}
              />
            </View>
          )}

          {/* STEP 1 – Details */}
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔍 Detalhe o problema</Text>

              <Text style={styles.inputLabel}>Gravidade</Text>
              <View style={styles.severityGrid}>
                {SEVERITIES.map((s) => (
                  <Pressable
                    key={s.label}
                    onPress={() => setSeverity(s.label)}
                    style={[
                      styles.severityOption,
                      { borderColor: severity === s.label ? s.color : theme.colors.border },
                      severity === s.label && { backgroundColor: s.color + '18' },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                    <Text style={[styles.severityOptionText, severity === s.label && { color: s.color }]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>

              <LabelInput
                label="Descrição"
                placeholder="Descreva o problema (tamanho, profundidade, riscos...)"
                value={description}
                onChangeText={setDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Fotos (opcional)</Text>
              <View style={styles.photoRow}>
                {photos.map((filled, i) => <PhotoSlot key={i} filled={filled} />)}
              </View>

              <View style={styles.btnRow}>
                <BeamButton title="← Voltar" style={{ flex: 1, marginTop: theme.spacing.sm } as any} onPress={() => goToStep(0)} />
                <BeamButton title="Enviar ✓" isPrimary style={{ flex: 1, marginTop: theme.spacing.sm } as any} onPress={() => { if (severity) goToStep(2); }} />
              </View>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: theme.colors.background },
  scroll:  { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },

  header:     { marginBottom: theme.spacing.xl },
  headerTitle:{ fontSize: 24, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  headerSub:  { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, marginTop: 4 },

  // Steps
  stepRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
  stepDot:    { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surface2, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border },
  stepDotActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(249,115,22,0.15)' },
  stepDotDone: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  stepDotText: { color: theme.colors.textPrimary, fontSize: 11, fontFamily: theme.typography.fontFamily.semiBold },
  stepLine:    { flex: 1, height: 1.5, backgroundColor: theme.colors.border },
  stepLineDone:{ backgroundColor: theme.colors.primary },
  stepLabels:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xl },
  stepLabel:   { fontSize: 10, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, textAlign: 'center', width: 60 },

  // Card
  card:        { backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },
  cardTitle:   { fontSize: 17, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold, marginBottom: theme.spacing.xs },

  // Input
  inputWrapper:  { gap: 6 },
  inputLabel:    { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:         { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.textPrimary, paddingHorizontal: theme.spacing.md, paddingVertical: 12, fontSize: 14, fontFamily: theme.typography.fontFamily.regular },
  inputMulti:    { height: 100 },

  // Map mini
  mapMini:       { height: 90, backgroundColor: theme.colors.surface2, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
  mapMiniContent:{ alignItems: 'center' },
  mapMiniText:   { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 },
  mapMiniSub:    { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.regular, marginTop: 4 },

  // Severity
  severityGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  severityOption:{ flex: 1, minWidth: '40%', alignItems: 'center', padding: theme.spacing.sm, borderRadius: theme.radii.md, borderWidth: 1.5, gap: 4 },
  severityOptionText: { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, fontSize: 12 },

  // Photos
  photoRow:  { flexDirection: 'row', gap: theme.spacing.sm },
  photoSlot: { width: 72, height: 72, borderRadius: theme.radii.md, borderWidth: 1.5, borderColor: theme.colors.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface2 },
  photoSlotFilled: { borderColor: theme.colors.primary, backgroundColor: 'rgba(249,115,22,0.1)', borderStyle: 'solid' },
  photoPlus: { fontSize: 24, color: theme.colors.textMuted },
  photoCheck:{ fontSize: 24, color: theme.colors.primary },

  // Buttons
  ctaBtn: { marginTop: theme.spacing.sm },
  btnRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },

  // Success
  successContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.35)', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
  successTitle:{ fontSize: 26, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold, marginBottom: theme.spacing.md },
  successSub:  { fontSize: 14, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, textAlign: 'center', lineHeight: 22 },
});

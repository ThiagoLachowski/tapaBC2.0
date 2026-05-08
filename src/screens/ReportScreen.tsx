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
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { theme as staticTheme } from '../theme/tokens';
import { BeamButton } from '../components/BeamButton';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { LeafletMap } from '../components/LeafletMap';
import { useTheme } from '../context/ThemeContext';

// ── Types ────────────────────────────────────────────────────────────────────
type Severity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

const SEVERITIES: { label: Severity; color: string; icon: string }[] = [
  { label: 'Baixa',   color: '#22C55E', icon: 'circle' },
  { label: 'Média',   color: '#F97316', icon: 'circle' },
  { label: 'Alta',    color: '#EF4444', icon: 'circle' },
  { label: 'Crítica', color: '#A855F7', icon: 'alert-triangle' },
];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDot({ active, done, n, theme }: { active: boolean; done: boolean; n: number; theme: any }) {
  return (
    <View style={[
      styles.stepDot, 
      { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
      active && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '22' },
      done && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }
    ]}>
      {done
        ? <Feather name="check" size={14} color="#FFF" />
        : <Text style={[styles.stepDotText, { color: active ? theme.colors.primary : theme.colors.textPrimary }]}>{n}</Text>
      }
    </View>
  );
}

// ── Animated label input ──────────────────────────────────────────────────────
function LabelInput({ label, placeholder, value, onChangeText, multiline = false, theme }: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; multiline?: boolean; theme: any;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, color: theme.colors.textPrimary }, multiline && styles.inputMulti]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

// ── Custom Photo Modal ────────────────────────────────────────────────────────
function PhotoModal({ visible, onClose, onTakePhoto, theme }: { visible: boolean; onClose: () => void; onTakePhoto: () => void; theme: any }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 100, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.modalContent, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalHandle, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Adicionar Foto</Text>
            <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>Capture uma imagem real do buraco</Text>
          </View>
          
          <View style={styles.modalActions}>
            <Pressable style={[styles.modalActionBtn, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]} onPress={onTakePhoto}>
              <View style={[styles.modalActionIconBox, { backgroundColor: theme.colors.primary + '22' }]}>
                <Feather name="camera" size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.modalActionLabel, { color: theme.colors.textPrimary }]}>Tirar Foto</Text>
                <Text style={[styles.modalActionDesc, { color: theme.colors.textMuted }]}>Usar a câmera do celular</Text>
              </View>
            </Pressable>
          </View>

          <Pressable style={styles.modalCancel} onPress={onClose}>
            <Text style={[styles.modalCancelText, { color: theme.colors.textMuted }]}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Success overlay ───────────────────────────────────────────────────────────
function SuccessScreen({ onReset, theme }: { onReset: () => void; theme: any }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View style={[styles.successContainer, { backgroundColor: theme.colors.background, opacity, transform: [{ scale }] }]}>
      <View style={[styles.successIcon, { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary + '55' }]}>
        <Feather name="map-pin" size={40} color={theme.colors.primary} />
      </View>
      <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>Reporte enviado!</Text>
      <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
        Seu relato foi adicionado ao mapa de Caxias. Obrigado pela contribuição!
      </Text>
      <BeamButton title="Novo Reporte" isPrimary onPress={onReset} style={{ width: '80%', marginTop: 24 }} />
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export const ReportScreen = () => {
  const { user } = useAuth();
  const { reports, addReport } = useReports();
  const { theme, isDark } = useTheme();

  const [step, setStep]           = useState(0); 
  const [street, setStreet]       = useState('');
  const [neighborhood, setNhood]  = useState('');
  const [description, setDesc]    = useState('');
  const [severity, setSeverity]   = useState<Severity | null>(null);
  const [images, setImages]       = useState<string[]>([]);
  const [location, setLocation]   = useState<{ lat: number, lng: number } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const takePhoto = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua câmera para continuar.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const getMyLocation = async () => {
    setLoadingLoc(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão de localização negada.');
      setLoadingLoc(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setLoadingLoc(false);
  };

  const goToStep = (s: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
    setStep(s);
  };

  const handleSubmit = () => {
    if (!user || !severity) return;
    const sevObj = SEVERITIES.find(s => s.label === severity)!;
    addReport({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      isCustomAvatar: user.isCustomAvatar,
      street,
      neighborhood,
      description,
      severity,
      severityColor: sevObj.color,
      images,
      latitude: location?.lat,
      longitude: location?.lng,
    });
    goToStep(2);
  };

  if (step === 2) return <SuccessScreen onReset={() => { setStreet(''); setNhood(''); setDesc(''); setSeverity(null); setImages([]); setLocation(null); setStep(0); }} theme={theme} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Reportar Buraco</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>Ajude a melhorar as vias de Caxias</Text>
        </View>

        <View style={styles.stepRow}>
          <StepDot n={1} active={step === 0} done={step > 0} theme={theme} />
          <View style={[styles.stepLine, { backgroundColor: theme.colors.border }, step > 0 && { backgroundColor: theme.colors.primary }]} />
          <StepDot n={2} active={step === 1} done={step > 1} theme={theme} />
          <View style={[styles.stepLine, { backgroundColor: theme.colors.border }]} />
          <StepDot n={3} active={false} done={false} theme={theme} />
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, { color: theme.colors.textMuted }]}>Localização</Text>
          <Text style={[styles.stepLabel, { color: theme.colors.textMuted }]}>Detalhes</Text>
          <Text style={[styles.stepLabel, { color: theme.colors.textMuted }]}>Enviar</Text>
        </View>

        <Animated.View style={{ opacity: slideAnim.interpolate({ inputRange: [-30, 0], outputRange: [0, 1] }), transform: [{ translateX: slideAnim }] }}>

          {step === 0 && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
              <View style={styles.cardTitleRow}>
                <Feather name="map-pin" size={18} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, marginLeft: 8 }]}>Onde é o buraco?</Text>
              </View>
              
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Toque no mapa para marcar ou use GPS</Text>
              <View style={[styles.mapSelectionContainer, { borderColor: theme.colors.border }]}>
                <LeafletMap 
                  center={location || { lat: -4.8622, lng: -43.3561 }}
                  markers={location ? [{ id: 'current', lat: location.lat, lng: location.lng, color: theme.colors.primary }] : []}
                  onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                />
                <Pressable style={[styles.gpsBtn, { backgroundColor: theme.colors.primary }]} onPress={getMyLocation} disabled={loadingLoc}>
                  {loadingLoc ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name="target" size={20} color="#FFF" />}
                </Pressable>
              </View>

              <LabelInput label="Rua / Avenida" placeholder="Ex: Av. Getúlio Vargas" value={street} onChangeText={setStreet} theme={theme} />
              <LabelInput label="Bairro" placeholder="Ex: Centro" value={neighborhood} onChangeText={setNhood} theme={theme} />
              
              <BeamButton title="Próximo" isPrimary iconRight="arrow-right" style={styles.ctaBtn} onPress={() => { if (street && neighborhood) goToStep(1); }} />
            </View>
          )}

          {step === 1 && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
              <View style={styles.cardTitleRow}>
                <Feather name="search" size={18} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary, marginLeft: 8 }]}>Detalhe o problema</Text>
              </View>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Gravidade</Text>
              <View style={styles.severityGrid}>
                {SEVERITIES.map((s) => (
                  <Pressable key={s.label} onPress={() => setSeverity(s.label)} style={[styles.severityOption, { borderColor: severity === s.label ? s.color : theme.colors.border }, severity === s.label && { backgroundColor: s.color + '18' }]}>
                    <Feather name={s.icon as any} size={18} color={severity === s.label ? s.color : theme.colors.textMuted} />
                    <Text style={[styles.severityOptionText, { color: theme.colors.textSecondary }, severity === s.label && { color: s.color }]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
              <LabelInput label="Descrição" placeholder="Descreva o problema (riscos...)" value={description} onChangeText={setDesc} multiline theme={theme} />
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Fotos do buraco ({images.length}/3)</Text>
              <View style={styles.photoRow}>
                {images.map((uri, i) => (
                  <View key={i} style={styles.photoPreviewWrapper}>
                    <Image source={{ uri }} style={styles.photoPreview} />
                    <Pressable style={[styles.photoRemove, { borderColor: theme.colors.surface1 }]} onPress={() => setImages(images.filter((_, idx) => idx !== i))}>
                      <Feather name="x" size={12} color="#FFF" />
                    </Pressable>
                  </View>
                ))}
                {images.length < 3 && (
                  <Pressable style={[styles.photoSlot, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]} onPress={() => setModalVisible(true)}>
                    <Feather name="plus" size={24} color={theme.colors.textMuted} />
                  </Pressable>
                )}
              </View>
              <View style={styles.btnRow}>
                <BeamButton title="Voltar" iconLeft="arrow-left" style={{ flex: 1, marginTop: theme.spacing.sm } as any} onPress={() => goToStep(0)} />
                <BeamButton title="Enviar" isPrimary iconRight="check" style={{ flex: 1, marginTop: theme.spacing.sm } as any} onPress={handleSubmit} />
              </View>
            </View>
          )}
        </Animated.View>
        <PhotoModal visible={modalVisible} onClose={() => setModalVisible(false)} onTakePhoto={takePhoto} theme={theme} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: staticTheme.colors.background },
  scroll:  { flex: 1 },
  content: { padding: staticTheme.spacing.lg, paddingBottom: 40 },
  header:     { marginBottom: staticTheme.spacing.xl },
  headerTitle:{ fontSize: 24, color: staticTheme.colors.textPrimary, fontFamily: staticTheme.typography.fontFamily.semiBold },
  headerSub:  { fontSize: 13, color: staticTheme.colors.textSecondary, fontFamily: staticTheme.typography.fontFamily.regular, marginTop: 4 },
  stepRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: staticTheme.spacing.xs },
  stepDot:    { width: 28, height: 28, borderRadius: 14, backgroundColor: staticTheme.colors.surface2, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: staticTheme.colors.border },
  stepDotActive: { borderColor: staticTheme.colors.primary, backgroundColor: 'rgba(249,115,22,0.15)' },
  stepDotDone: { borderColor: staticTheme.colors.primary, backgroundColor: staticTheme.colors.primary },
  stepDotText: { color: staticTheme.colors.textPrimary, fontSize: 11, fontFamily: staticTheme.typography.fontFamily.semiBold },
  stepLine:    { flex: 1, height: 1.5, backgroundColor: staticTheme.colors.border },
  stepLineDone:{ backgroundColor: staticTheme.colors.primary },
  stepLabels:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: staticTheme.spacing.xl },
  stepLabel:   { fontSize: 10, color: staticTheme.colors.textMuted, fontFamily: staticTheme.typography.fontFamily.regular, textAlign: 'center', width: 60 },
  card:        { backgroundColor: staticTheme.colors.surface1, borderRadius: staticTheme.radii.xl, padding: staticTheme.spacing.lg, borderWidth: 1, borderColor: staticTheme.colors.border, gap: staticTheme.spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: staticTheme.spacing.xs },
  cardTitle:   { fontSize: 17, color: staticTheme.colors.textPrimary, fontFamily: staticTheme.typography.fontFamily.semiBold },
  inputWrapper:  { gap: 6 },
  inputLabel:    { fontSize: 12, color: staticTheme.colors.textSecondary, fontFamily: staticTheme.typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:         { backgroundColor: staticTheme.colors.surface2, borderRadius: staticTheme.radii.md, borderWidth: 1, borderColor: staticTheme.colors.border, color: staticTheme.colors.textPrimary, paddingHorizontal: staticTheme.spacing.md, paddingVertical: 12, fontSize: 14, fontFamily: staticTheme.typography.fontFamily.regular },
  inputMulti:    { height: 100 },
  
  mapSelectionContainer: { height: 200, borderRadius: staticTheme.radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: staticTheme.colors.border, marginBottom: staticTheme.spacing.sm, position: 'relative' },
  gpsBtn: { position: 'absolute', right: 12, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: staticTheme.colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },

  severityGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: staticTheme.spacing.sm },
  severityOption:{ flex: 1, minWidth: '40%', alignItems: 'center', padding: staticTheme.spacing.sm, borderRadius: staticTheme.radii.md, borderWidth: 1.5, gap: 4 },
  severityOptionText: { color: staticTheme.colors.textSecondary, fontFamily: staticTheme.typography.fontFamily.medium, fontSize: 12 },
  photoRow:  { flexDirection: 'row', gap: staticTheme.spacing.sm, flexWrap: 'wrap' },
  photoPreviewWrapper: { position: 'relative' },
  photoPreview: { width: 80, height: 80, borderRadius: staticTheme.radii.md },
  photoRemove: { position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: staticTheme.colors.surface1 },
  photoSlot: { width: 80, height: 80, borderRadius: staticTheme.radii.md, borderWidth: 1.5, borderColor: staticTheme.colors.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: staticTheme.colors.surface2 },
  photoPlus: { fontSize: 24, color: staticTheme.colors.textMuted },
  ctaBtn: { marginTop: staticTheme.spacing.sm },
  btnRow: { flexDirection: 'row', gap: staticTheme.spacing.sm, marginTop: staticTheme.spacing.sm },
  successContainer: { flex: 1, backgroundColor: staticTheme.colors.background, justifyContent: 'center', alignItems: 'center', padding: staticTheme.spacing.xl },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.35)', justifyContent: 'center', alignItems: 'center', marginBottom: staticTheme.spacing.lg },
  successTitle:{ fontSize: 26, color: staticTheme.colors.textPrimary, fontFamily: staticTheme.typography.fontFamily.semiBold, marginBottom: staticTheme.spacing.md },
  successSub:  { fontSize: 14, color: staticTheme.colors.textSecondary, fontFamily: staticTheme.typography.fontFamily.regular, textAlign: 'center', lineHeight: 22 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: staticTheme.colors.surface1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: staticTheme.spacing.xl, paddingBottom: 40, borderTopWidth: 1, borderColor: staticTheme.colors.border },
  modalHeader: { alignItems: 'center', marginBottom: staticTheme.spacing.lg },
  modalHandle: { width: 40, height: 4, backgroundColor: staticTheme.colors.border, borderRadius: 2, marginBottom: 16 },
  modalTitle: { fontSize: 18, color: staticTheme.colors.textPrimary, fontFamily: staticTheme.typography.fontFamily.semiBold },
  modalSub: { fontSize: 13, color: staticTheme.colors.textSecondary, fontFamily: staticTheme.typography.fontFamily.regular, marginTop: 4 },
  modalActions: { gap: staticTheme.spacing.md, marginBottom: staticTheme.spacing.xl },
  modalActionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: staticTheme.colors.surface2, padding: staticTheme.spacing.md, borderRadius: staticTheme.radii.xl, borderWidth: 1, borderColor: staticTheme.colors.border, gap: staticTheme.spacing.md },
  modalActionIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(249,115,22,0.1)', justifyContent: 'center', alignItems: 'center' },
  modalActionLabel: { fontSize: 15, color: staticTheme.colors.textPrimary, fontFamily: staticTheme.typography.fontFamily.semiBold },
  modalActionDesc: { fontSize: 12, color: staticTheme.colors.textMuted, fontFamily: staticTheme.typography.fontFamily.regular, marginTop: 2 },
  modalCancel: { alignItems: 'center', padding: staticTheme.spacing.md },
  modalCancelText: { color: staticTheme.colors.textMuted, fontFamily: staticTheme.typography.fontFamily.medium, fontSize: 14 },
});


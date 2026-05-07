import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated, Easing, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';
import { LeafletMap } from '../components/LeafletMap';

const { width } = Dimensions.get('window');
const CARD_IMAGE_WIDTH = width - (theme.spacing.lg * 2) - (theme.spacing.md * 2) - 20;

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, delay }: { label: string; value: string | number; icon: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [anim, delay]);
  return (
    <Animated.View style={[styles.statCard, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🕳️</Text>
      <Text style={styles.emptyTitle}>Nenhum reporte ainda</Text>
      <Text style={styles.emptySub}>Seja o primeiro a reportar um buraco em Caxias!</Text>
    </View>
  );
}

// ── Report mini card ──────────────────────────────────────────────────────────
function ReportMini({ item, ticker }: { item: any; ticker: number }) {
  return (
    <View style={styles.reportRow}>
      <View style={[styles.dot, { backgroundColor: item.severityColor }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportStreet}>{item.street}</Text>
            <Text style={styles.reportSub}>{item.neighborhood} · {getRelativeTime(item.createdAt)}</Text>
          </View>
          <View style={[styles.sevBadge, { backgroundColor: item.severityColor + '22', borderColor: item.severityColor + '55' }]}>
            <Text style={[styles.sevText, { color: item.severityColor }]}>{item.severity}</Text>
          </View>
        </View>

        {item.images && item.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miniGallery} contentContainerStyle={{ gap: 8 }}>
            {item.images.map((img: string, i: number) => (
              <Image key={i} source={{ uri: img }} style={styles.miniImage} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export const HomeScreen = () => {
  const { user } = useAuth();
  const { reports } = useReports();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    const interval = setInterval(() => setTicker(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [headerAnim]);

  const resolved = reports.filter(r => r.status === 'Resolvido').length;
  const analyzing = reports.filter(r => r.status === 'Em análise').length;
  
  // Transform reports into markers
  const markers = reports
    .filter(r => r.latitude && r.longitude)
    .map(r => ({ lat: r.latitude!, lng: r.longitude!, color: r.severityColor }));

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-12,0] }) }] }]}>
          <View>
            <Text style={styles.greeting}>Olá, {user.name.split(' ')[0]} 👋</Text>
            <Text style={styles.headerTitle}>Mapa de Buracos</Text>
          </View>
          <UserAvatar user={user} />
        </Animated.View>

        <View style={styles.statsRow}>
          <StatCard icon="📍" label="Reportados" value={reports.length} delay={100} />
          <StatCard icon="🔍" label="Em análise"  value={analyzing}       delay={200} />
          <StatCard icon="✅" label="Resolvidos"  value={resolved}         delay={300} />
        </View>

        <Text style={styles.sectionTitle}>Mapa da cidade (Leaflet)</Text>
        <View style={styles.mapContainer}>
          <LeafletMap markers={markers} interactive={false} />
        </View>

        <Text style={styles.sectionTitle}>
          Reportes recentes{reports.length > 0 ? ` (${reports.length})` : ''}
        </Text>
        {reports.length === 0
          ? <EmptyState />
          : <View style={styles.reportsList}>
              {reports.slice(0, 5).map(r => <ReportMini key={r.id} item={r} ticker={ticker} />)}
            </View>
        }

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingBottom: 32 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, marginBottom: theme.spacing.lg },
  greeting:    { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, marginBottom: 2 },
  headerTitle: { fontSize: 22, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  statsRow:    { flexDirection: 'row', paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  statCard:    { flex: 1, backgroundColor: theme.colors.surface1, borderRadius: theme.radii.lg, padding: theme.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  statIcon:    { fontSize: 18, marginBottom: 4 },
  statValue:   { fontSize: 20, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  statLabel:   { fontSize: 10, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, marginTop: 2, textAlign: 'center' },
  sectionTitle:{ fontSize: 15, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm },
  mapContainer:{ marginHorizontal: theme.spacing.lg, height: 250, borderRadius: theme.radii.xl, overflow: 'hidden', marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, position: 'relative', backgroundColor: '#0a0a0a' },
  reportsList: { marginHorizontal: theme.spacing.lg, gap: theme.spacing.sm },
  reportRow:   { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.colors.surface1, borderRadius: theme.radii.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.sm },
  dot:         { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  reportStreet:{ color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 },
  reportSub:   { color: theme.colors.textSecondary, fontSize: 11, fontFamily: theme.typography.fontFamily.regular, marginTop: 2 },
  miniGallery: { marginTop: 10, paddingRight: 10 },
  miniImage:   { width: CARD_IMAGE_WIDTH * 0.8, height: 120, borderRadius: theme.radii.md },
  sevBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radii.full, borderWidth: 1, marginLeft: 8 },
  sevText:     { fontSize: 10, fontFamily: theme.typography.fontFamily.medium },
  empty:       { marginHorizontal: theme.spacing.lg, alignItems: 'center', padding: theme.spacing.xl, backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.sm },
  emptyEmoji:  { fontSize: 40 },
  emptyTitle:  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold, fontSize: 16 },
  emptySub:    { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

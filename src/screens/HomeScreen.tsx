import React, { useRef, useEffect, useState } from 'react';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import {
  View, Text, StyleSheet, ScrollView, Animated as RNAnimated, Easing as RNEasing, Dimensions, Image, TouchableOpacity, Pressable, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';
import { LeafletMap } from '../components/LeafletMap';
import { theme as staticTheme, darkTheme, lightTheme } from '../theme/tokens';

const { width } = Dimensions.get('window');

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, delay, theme }: { label: string; value: string | number; icon: string; delay: number; theme: any }) {
  const anim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.timing(anim, { toValue: 1, duration: 500, delay, easing: RNEasing.out(RNEasing.quad), useNativeDriver: true }).start();
  }, [anim, delay]);
  return (
    <RNAnimated.View style={[
      styles.statCard, 
      { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border },
      { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }
    ]}>
      <View style={styles.statIconWrapper}>
        <Feather name={icon as any} size={18} color={theme.colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </RNAnimated.View>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ theme }: { theme: any }) {
  return (
    <View style={[styles.empty, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
      <Feather name="info" size={40} color={theme.colors.textMuted} style={{ marginBottom: 8 }} />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Nenhum reporte ainda</Text>
      <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>Seja o primeiro a reportar um buraco em Caxias!</Text>
    </View>
  );
}

// ── Report mini card ──────────────────────────────────────────────────────────
function ReportMini({ item, ticker, theme }: { item: any; ticker: number; theme: any }) {
  const CARD_IMAGE_WIDTH = width - (theme.spacing.lg * 2) - (theme.spacing.md * 2) - 20;
  return (
    <View style={[styles.reportRow, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
      <View style={[styles.dot, { backgroundColor: item.severityColor }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reportStreet, { color: theme.colors.textPrimary }]}>{item.street}</Text>
            <Text style={[styles.reportSub, { color: theme.colors.textSecondary }]}>{item.neighborhood} · {getRelativeTime(item.createdAt)}</Text>
          </View>
          <View style={[styles.sevBadge, { backgroundColor: item.severityColor + '22', borderColor: item.severityColor + '55' }]}>
            <Text style={[styles.sevText, { color: item.severityColor }]}>{item.severity}</Text>
          </View>
        </View>

        {item.images && item.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miniGallery} contentContainerStyle={{ gap: 8 }}>
            {item.images.map((img: string, i: number) => (
              <Image key={i} source={{ uri: img }} style={[styles.miniImage, { width: CARD_IMAGE_WIDTH * 0.8 }]} />
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
  const { theme, toggleTheme, transition, isDark } = useTheme();
  const headerAnim = useRef(new RNAnimated.Value(0)).current;
  const [ticker, setTicker] = useState(0);
  const [isMapFullVisible, setIsMapFullVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    RNAnimated.timing(headerAnim, { toValue: 1, duration: 600, easing: RNEasing.out(RNEasing.quad), useNativeDriver: true }).start();
    const interval = setInterval(() => setTicker(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [headerAnim]);

  // Interpolate background color for smooth transition
  const backgroundColor = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [darkTheme.colors.background, lightTheme.colors.background]
  });

  const resolved = reports.filter(r => r.status === 'Resolvido').length;
  const analyzing = reports.filter(r => r.status === 'Em análise').length;

  const markers = reports
    .filter(r => r.latitude && r.longitude)
    .map(r => ({ 
      id: r.id, 
      lat: r.latitude!, 
      lng: r.longitude!, 
      color: r.severityColor,
      image: r.images[0],
      title: r.street,
      description: r.neighborhood
    }));

  const selectedReport = selectedReportId ? reports.find(r => r.id === selectedReportId) : null;

  if (!user) return null;

  return (
    <RNAnimated.View style={[styles.safe, { backgroundColor }]}>
      <SafeAreaView edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          <RNAnimated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }]}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Olá, {user.name.split(' ')[0]}</Text>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Mapa de Buracos</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={[styles.themeToggle, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
              >
                <Feather name={isDark ? 'sun' : 'moon'} size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <UserAvatar user={user} />
            </View>
          </RNAnimated.View>

          <View style={styles.statsRow}>
            <StatCard icon="map-pin" label="Reportados" value={reports.length} delay={100} theme={theme} />
            <StatCard icon="search" label="Em análise" value={analyzing} delay={200} theme={theme} />
            <StatCard icon="check-circle" label="Resolvidos" value={resolved} delay={300} theme={theme} />
          </View>

          {/* Ranking Section */}
          <View style={styles.rankingSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Top Colaboradores</Text>
              <Feather name="award" size={16} color={theme.colors.primary} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rankingScroll}>
              {Object.values(reports.reduce((acc, r) => {
                if (!acc[r.userName]) acc[r.userName] = { name: r.userName, avatar: r.userAvatar, isCustom: r.isCustomAvatar, count: 0 };
                acc[r.userName].count++;
                return acc;
              }, {} as Record<string, any>))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((item, i) => (
                  <View key={item.name} style={[styles.rankingCard, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                    <View style={styles.rankBadge}>
                      {i < 3 ? (
                        <Feather name="award" size={16} color={i === 0 ? '#FACC15' : i === 1 ? '#94A3B8' : '#B45309'} />
                      ) : (
                        <Text style={[styles.rankText, { color: theme.colors.textMuted }]}>#{i+1}</Text>
                      )}
                    </View>
                    <UserAvatar user={{ name: item.name, avatar: item.avatar, isCustomAvatar: item.isCustom }} size={48} />
                    <Text style={[styles.rankingName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                    <View style={[styles.reportCountBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Text style={[styles.reportCountText, { color: theme.colors.primary }]}>{item.count} reportes</Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>

          <View style={[styles.sectionHeaderRow, { paddingHorizontal: 24 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Mapa da cidade</Text>
            <TouchableOpacity onPress={() => setIsMapFullVisible(true)} style={styles.seeAllBtn}>
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontFamily: 'Inter-Medium', marginRight: 4 }}>Ver tela cheia</Text>
              <Feather name="arrow-right" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Pressable 
            onPress={() => setIsMapFullVisible(true)}
            style={[styles.mapContainer, { borderColor: theme.colors.border, backgroundColor: isDark ? '#0a0a0a' : '#f0f0f0' }]}
          >
            <LeafletMap markers={markers} interactive={false} />
            <View style={styles.mapOverlay}>
              <View style={[styles.expandBtn, { backgroundColor: theme.colors.primary }]}>
                <Feather name="maximize-2" size={18} color="#FFF" />
              </View>
            </View>
          </Pressable>

          {/* Full Screen Map Modal */}
          <Modal
            visible={isMapFullVisible}
            animationType="slide"
            onRequestClose={() => setIsMapFullVisible(false)}
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Mapa de Caxias-MA</Text>
                <TouchableOpacity 
                  onPress={() => { setIsMapFullVisible(false); }}
                  style={[styles.closeBtn, { backgroundColor: theme.colors.surface2 }]}
                >
                  <Feather name="x" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, position: 'relative' }}>
                <LeafletMap 
                  markers={markers} 
                  interactive={true} 
                />
              </View>
              <View style={[styles.modalFooter, { backgroundColor: theme.colors.surface1, borderTopColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
                  Mostrando {markers.length} reportes ativos na cidade
                </Text>
              </View>
            </SafeAreaView>
          </Modal>

          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, paddingHorizontal: 24, marginBottom: 12 }]}>
            Reportes recentes{reports.length > 0 ? ` (${reports.length})` : ''}
          </Text>
          {reports.length === 0
            ? <EmptyState theme={theme} />
            : <View style={styles.reportsList}>
              {reports.slice(0, 5).map(r => <ReportMini key={r.id} item={r} ticker={ticker} theme={theme} />)}
            </View>
          }

        </ScrollView>
      </SafeAreaView>
    </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, marginBottom: 24 },
  greeting: { fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontFamily: 'Inter-SemiBold' },
  themeToggle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 8, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  statIconWrapper: { height: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: 'Inter-SemiBold' },
  statLabel: { fontSize: 10, fontFamily: 'Inter-Regular', marginTop: 2, textAlign: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter-SemiBold' },
  mapContainer: { marginHorizontal: 24, height: 250, borderRadius: 16, overflow: 'hidden', marginBottom: 24, borderWidth: 1, position: 'relative' },
  reportsList: { paddingHorizontal: 24, gap: 8 },
  reportRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, borderWidth: 1, gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  reportStreet: { fontFamily: 'Inter-Medium', fontSize: 13 },
  reportSub: { fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 1 },
  miniGallery: { marginTop: 10, paddingRight: 10 },
  miniImage: { height: 120, borderRadius: 8 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1, marginLeft: 8 },
  sevText: { fontSize: 10, fontFamily: 'Inter-Medium' },
  empty: { marginHorizontal: 24, alignItems: 'center', padding: 32, borderRadius: 16, borderWidth: 1, gap: 8 },
  emptyTitle: { fontFamily: 'Inter-SemiBold', fontSize: 16 },
  emptySub: { fontFamily: 'Inter-Regular', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 12 },
  expandBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  modalHeader: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalFooter: { padding: 16, borderTopWidth: 1 },
  rankingSection: { marginBottom: 24 },
  rankingScroll: { paddingHorizontal: 24, gap: 12 },
  rankingCard: { width: 120, borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, position: 'relative' },
  rankBadge: { position: 'absolute', top: 4, left: 4 },
  rankText: { fontSize: 12, fontFamily: 'Inter-SemiBold' },
  rankingName: { fontSize: 13, fontFamily: 'Inter-SemiBold', marginTop: 8, marginBottom: 4, textAlign: 'center' },
  reportCountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reportCountText: { fontSize: 10, fontFamily: 'Inter-Medium', textAlign: 'center' },
});



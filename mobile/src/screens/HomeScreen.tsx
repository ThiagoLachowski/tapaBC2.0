import React, { useRef, useEffect, useState } from 'react';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import {
  View, Text, StyleSheet, ScrollView, Animated as RNAnimated, Easing as RNEasing, 
  Dimensions, Image, TouchableOpacity, Pressable, Modal, TextInput, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';



import { LeafletMap } from '../components/LeafletMap';
import { theme as staticTheme, darkTheme, lightTheme } from '../theme/tokens';


const SEVERITIES = [
  { label: 'Baixa',   color: '#22C55E' },
  { label: 'Média',   color: '#F97316' },
  { label: 'Alta',    color: '#EF4444' },
  { label: 'Crítica', color: '#A855F7' },
];

const { width } = Dimensions.get('window');

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Baixa': return '#22C55E';
    case 'Média': return '#F97316';
    case 'Alta': return '#EF4444';
    case 'Crítica': return '#A855F7';
    default: return '#F97316';
  }
};


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

// ── Report mini card ──────────────────────────────────────────
function ReportMini({ item, ticker, theme, onPress }: { item: any; ticker: number; theme: any; onPress: () => void }) {
  const CARD_IMAGE_WIDTH = width - (theme.spacing.lg * 2) - (theme.spacing.md * 2) - 20;
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.reportRow, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
    >
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
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>(); 
  const { user } = useAuth();
  const { reports, loading } = useReports();
  const { theme, toggleTheme, transition, isDark } = useTheme();
  const headerAnim = useRef(new RNAnimated.Value(0)).current;
  const [ticker, setTicker] = useState(0);
  const [isMapFullVisible, setIsMapFullVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeverity, setActiveSeverity] = useState<string | null>(null);

  const handleReportPress = (reportId: string) => {
    navigation.navigate('ReportDetail', { reportId });
  };

  const handleStatsPress = (filterType: 'all' | 'analyzing' | 'resolved') => {
  console.log('Navegando com filtro:', filterType); // Para debug
  navigation.navigate('Comunidade', { filter: filterType });
};

    // Processar reports com cores e dados completos
  const processedReports = reports.map(report => ({
    ...report,
    severityColor: getSeverityColor(report.severity),
    userAvatar: report.userAvatar || 'default',
    userName: report.userName || 'Usuário',
    isCustomAvatar: report.userAvatar && report.userAvatar !== 'default',
  }));

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

  const resolved = processedReports.filter(r => r.status === 'Resolvido').length;
  const analyzing = processedReports.filter(r => r.status === 'Em análise' || r.status === 'Novo').length;

  const markers = processedReports
    .filter(r => r.latitude && r.longitude)
    .filter(r => activeSeverity ? r.severity === activeSeverity : true)
    .filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.street.toLowerCase().includes(q) || r.neighborhood?.toLowerCase().includes(q);
    })
    .map(r => ({ 
      id: r.id, 
      lat: r.latitude!, 
      lng: r.longitude!, 
      color: r.severityColor,
      image: r.images?.[0],
      title: r.street,
      description: r.neighborhood
    }));

  // Ranking usando processedReports
  const rankingData = Object.values(
    processedReports.reduce((acc, r) => {
      const userName = r.userName || 'Anônimo';
      if (!acc[userName]) {
        acc[userName] = { 
          name: userName, 
          avatar: r.userAvatar, 
          isCustom: r.isCustomAvatar, 
          count: 0 
        };
      }
      acc[userName].count++;
      return acc;
    }, {} as Record<string, any>)
  ).sort((a, b) => b.count - a.count).slice(0, 5);

  // Se estiver carregando, mostrar loading
  if (loading) {
    return (
      <View style={[styles.safe, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const selectedReport = selectedReportId ? processedReports.find(r => r.id === selectedReportId) : null;

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
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => handleStatsPress('all')}
              activeOpacity={0.7}
            >
              <StatCard icon="map-pin" label="Reportados" value={processedReports.length} delay={100} theme={theme} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => handleStatsPress('analyzing')}
              activeOpacity={0.7}
            >
              <StatCard icon="search" label="Em análise" value={analyzing} delay={200} theme={theme} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => handleStatsPress('resolved')}
              activeOpacity={0.7}
            >
              <StatCard icon="check-circle" label="Resolvidos" value={resolved} delay={300} theme={theme} />
            </TouchableOpacity>
          </View>

          {/* Ranking Section - Usando rankingData */}
          <View style={styles.rankingSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Top Colaboradores</Text>
              <Feather name="award" size={16} color={theme.colors.primary} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rankingScroll}>
              {rankingData.map((item, i) => (
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
            style={[styles.mapContainer, { 
              borderColor: theme.colors.border, 
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              shadowColor: isDark ? '#000' : theme.colors.primary,
              shadowOpacity: isDark ? 0.5 : 0.1,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8
            }]}
          >
            <LeafletMap markers={markers} interactive={false} />
            <LinearGradient
              colors={['transparent', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)']}
              style={styles.mapGradient}
            />
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
              <View style={[styles.modalHeader, { borderBottomColor: 'transparent' }]}>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Mapa de Caxias-MA</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontFamily: 'Inter-Regular' }}>Navegue pelos reportes ativos</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => { setIsMapFullVisible(false); }}
                  style={[styles.closeBtn, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border, borderWidth: 1 }]}
                >
                  <Feather name="x" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, position: 'relative' }}>
                <LeafletMap 
                  markers={markers} 
                  interactive={true} 
                  onMarkerPress={(markerId) => {
                    console.log('Marker pressed:', markerId);
                    navigation.navigate('ReportDetail', { reportId: markerId });
                    setIsMapFullVisible(false); // Fecha o modal após clicar
                  }}
                />
                
                {/* Overlay Search UI */}
                <View style={styles.mapSearchContainer}>
                  <View style={[styles.mapSearchBox, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                    <Feather name="search" size={18} color={theme.colors.textMuted} />
                    <TextInput 
                      style={[styles.mapSearchInput, { color: theme.colors.textPrimary }]}
                      placeholder="Buscar ruas ou bairros..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                </View>

                {/* Severity Filters */}
                <View style={styles.mapFiltersContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapFiltersScroll}>
                    <TouchableOpacity 
                      onPress={() => setActiveSeverity(null)}
                      style={[
                        styles.filterChip, 
                        { backgroundColor: !activeSeverity ? theme.colors.primary : theme.colors.surface1, borderColor: theme.colors.border }
                      ]}
                    >
                      <Text style={[styles.filterLabel, { color: !activeSeverity ? '#FFF' : theme.colors.textPrimary }]}>Todos</Text>
                    </TouchableOpacity>
                    {SEVERITIES.map((s, i) => (
                      <TouchableOpacity 
                        key={i} 
                        onPress={() => setActiveSeverity(s.label)}
                        style={[
                          styles.filterChip, 
                          { 
                            backgroundColor: activeSeverity === s.label ? s.color : theme.colors.surface1, 
                            borderColor: theme.colors.border 
                          }
                        ]}
                      >
                        <View style={[styles.filterDot, { backgroundColor: activeSeverity === s.label ? '#FFF' : s.color }]} />
                        <Text style={[styles.filterLabel, { color: activeSeverity === s.label ? '#FFF' : theme.colors.textPrimary }]}>{s.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Floating Map Controls */}
                <View style={styles.mapControls}>
                  <TouchableOpacity style={[styles.mapControlBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                    <Feather name="navigation" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.mapControlBtn, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                    <Feather name="layers" size={20} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.modalFooter, { backgroundColor: theme.colors.surface1, borderTopColor: theme.colors.border }]}>
                <View style={styles.footerInfo}>
                  <Feather name="info" size={14} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 6 }}>
                    Toque nos marcadores para ver detalhes de cada buraco
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </Modal>

          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, paddingHorizontal: 24, marginBottom: 12 }]}>
            Reportes recentes{processedReports.length > 0 ? ` (${processedReports.length})` : ''}
          </Text>
          {processedReports.length === 0
            ? <EmptyState theme={theme} />
            : <View style={styles.reportsList}>
              {processedReports.slice(0, 5).map(r => <ReportMini key={r.id} item={{...r, severityColor: getSeverityColor(r.severity)}} ticker={ticker} theme={theme} onPress={() => handleReportPress(r.id)} />)}
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
  mapContainer: { 
    marginHorizontal: 24, 
    height: 220, 
    borderRadius: 28, 
    overflow: 'hidden', 
    marginBottom: 24, 
    borderWidth: 1, 
    position: 'relative' 
  },
  mapGradient: {
    ...StyleSheet.absoluteFillObject,
  },
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
  mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 16 },
  expandBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  modalHeader: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter-SemiBold' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalFooter: { padding: 16, borderTopWidth: 1, paddingBottom: 24 },
  rankingSection: { marginBottom: 24 },
  rankingScroll: { paddingHorizontal: 24, gap: 12 },
  rankingCard: { width: 120, borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, position: 'relative' },
  rankBadge: { position: 'absolute', top: 4, left: 4 },
  rankText: { fontSize: 12, fontFamily: 'Inter-SemiBold' },
  rankingName: { fontSize: 13, fontFamily: 'Inter-SemiBold', marginTop: 8, marginBottom: 4, textAlign: 'center' },
  reportCountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reportCountText: { fontSize: 10, fontFamily: 'Inter-Medium', textAlign: 'center' },
  
  // Modal Map UI
  mapSearchContainer: { position: 'absolute', top: 16, left: 20, right: 20, zIndex: 10 },
  mapSearchBox: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  mapSearchPlaceholder: { marginLeft: 12, fontSize: 14, fontFamily: 'Inter-Regular' },
  mapSearchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontFamily: 'Inter-Regular', height: '100%' },
  mapFiltersContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, zIndex: 10 },
  mapFiltersScroll: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  filterDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  filterLabel: { fontSize: 12, fontFamily: 'Inter-Medium' },
  mapControls: { position: 'absolute', top: 80, right: 20, gap: 10, zIndex: 10 },
  mapControlBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  footerInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
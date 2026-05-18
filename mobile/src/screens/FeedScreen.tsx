import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useReports } from '../context/ReportsContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';
import { useTheme } from '../context/ThemeContext';
import { theme as staticTheme } from '../theme/tokens';

const { width } = Dimensions.get('window');

// Filtros baseados nos parâmetros que vêm da Home
type FilterType = 'Todos' | 'Novos' | 'Em análise' | 'Resolvidos';

// ── Vote button ───────────────────────────────────────────────────────────────
function VoteBtn({ count, onVote, theme }: { count: number; onVote: () => void; theme: any }) {
  const [voted, setVoted] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    if (!voted) {
      setVoted(true);
      onVote();
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <Pressable 
      onPress={press} 
      style={[
        styles.voteBtn, 
        { borderColor: theme.colors.border },
        voted && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '22' }
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Feather name="chevron-up" size={16} color={voted ? theme.colors.primary : theme.colors.textMuted} />
      </Animated.View>
      <Text style={[styles.voteCount, { color: voted ? theme.colors.primary : theme.colors.textMuted }]}>{count}</Text>
    </Pressable>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ theme, filter }: { theme: any; filter: string }) {
  let message = '';
  if (filter === 'Em análise') message = 'Não há reportes em análise no momento.';
  else if (filter === 'Resolvidos') message = 'Nenhum reporte foi resolvido ainda.';
  else message = 'Ninguém postou nada ainda em Caxias. Seja o primeiro a relatar um problema!';

  return (
    <View style={[styles.empty, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
      <Feather name="message-square" size={40} color={theme.colors.textMuted} style={{ marginBottom: 8 }} />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>A comunidade está quieta</Text>
      <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

// ── Feed card ─────────────────────────────────────────────────────────────────
function FeedCard({ item, delay, onVote, ticker, theme }: { item: any; delay: number; onVote: () => void; ticker: number; theme: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [anim, delay]);

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <UserAvatar user={{ name: item.userName, avatar: item.userAvatar, isCustomAvatar: item.isCustomAvatar }} size={36} />
          <View>
            <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{item.userName}</Text>
            <Text style={[styles.userTime, { color: theme.colors.textMuted }]}>{getRelativeTime(item.createdAt)} · {item.street}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.severityColor + '22', borderColor: item.severityColor + '55' }]}>
          <Text style={[styles.statusText, { color: item.severityColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={[styles.severityStripe, { backgroundColor: item.severityColor }]} />

      <Pressable onPress={() => setExpanded(!expanded)} style={styles.descContainer}>
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={expanded ? undefined : 2}>{item.description}</Text>
        {item.description.length > 80 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
            <Text style={[styles.readMore, { color: theme.colors.textMuted, marginRight: 4 }]}>{expanded ? 'Ver menos' : 'Ver mais'}</Text>
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={12} color={theme.colors.textMuted} />
          </View>
        )}
      </Pressable>

      {item.images && item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGallery}>
          {item.images.map((img: string, idx: number) => (
            <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
          ))}
        </ScrollView>
      )}

      <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
        <VoteBtn count={item.votes} onVote={onVote} theme={theme} />
        <Pressable style={styles.commentBtn}>
          <Feather name="message-square" size={16} color={theme.colors.textMuted} />
          <Text style={[styles.commentCount, { color: theme.colors.textMuted }]}>{item.comments || 0}</Text>
        </Pressable>
        <Pressable style={styles.shareBtn}>
          <Text style={[styles.shareText, { color: theme.colors.primary }]}>Compartilhar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export const FeedScreen = () => {
  const route = useRoute();
  const { reports, voteReport } = useReports();
  const { theme } = useTheme();
  const [activeFilter, setFilter] = useState<FilterType>('Todos');
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [ticker, setTicker] = useState(0);

  // ✅ Pegar o filtro dos parâmetros da rota (quando vem da HomeScreen)
  useEffect(() => {
    const params = route.params as { filter?: string };
    console.log('FeedScreen recebeu params:', params);
    
    if (params?.filter) {
      // Mapear o filtro da Home para o formato do Feed
      switch (params.filter) {
        case 'all':
          setFilter('Todos');
          break;
        case 'analyzing':
          setFilter('Em análise');
          break;
        case 'resolved':
          setFilter('Resolvidos');
          break;
        default:
          setFilter('Todos');
      }
    }
  }, [route.params]);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    const interval = setInterval(() => setTicker(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [headerAnim]);

  // ✅ Filtrar reports baseado no filtro ativo
  const getFilteredReports = () => {
    if (activeFilter === 'Todos') return reports;
    if (activeFilter === 'Novos') return reports.filter(r => r.status === 'Novo');
    if (activeFilter === 'Em análise') return reports.filter(r => r.status === 'Em análise');
    if (activeFilter === 'Resolvidos') return reports.filter(r => r.status === 'Resolvido');
    return reports;
  };

  const filteredReports = getFilteredReports();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Animated.View style={[styles.stickyHeader, { opacity: headerAnim }]}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>Comunidade</Text>
        <Text style={[styles.screenSub, { color: theme.colors.textSecondary }]}>
          {filteredReports.length} reporte{filteredReports.length !== 1 ? 's' : ''} em {activeFilter.toLowerCase()}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {['Todos', 'Novos', 'Em análise', 'Resolvidos'].map(f => (
            <Pressable 
              key={f} 
              onPress={() => setFilter(f as FilterType)} 
              style={[
                styles.filterChip, 
                { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border },
                activeFilter === f && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '22' }
              ]}
            >
              <Text style={[styles.filterText, { color: theme.colors.textSecondary }, activeFilter === f && { color: theme.colors.primary }]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        {reports.length === 0 ? (
          <EmptyState theme={theme} filter={activeFilter} />
        ) : filteredReports.length === 0 ? (
          <EmptyState theme={theme} filter={activeFilter} />
        ) : (
          filteredReports.map((item, i) => (
            <FeedCard key={item.id} item={item} delay={100 + i * 80} onVote={() => voteReport(item.id)} ticker={ticker} theme={theme} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  stickyHeader: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  screenTitle:  { fontSize: 24, fontFamily: 'Inter-SemiBold' },
  screenSub:    { fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 2, marginBottom: 16 },
  filtersRow:   { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  filterChip:   { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  filterText:   { fontFamily: 'Inter-Medium', fontSize: 12 },
  scroll:       { flex: 1 },
  feedContent:  { padding: 24, paddingTop: 16, gap: 16, paddingBottom: 32 },
  card:         { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 0 },
  userRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName:     { fontFamily: 'Inter-Medium', fontSize: 13 },
  userTime:     { fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 1 },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, borderWidth: 1 },
  statusText:   { fontSize: 10, fontFamily: 'Inter-Medium' },
  severityStripe: { height: 3, marginTop: 8 },
  descContainer:{ paddingHorizontal: 16, paddingTop: 8 },
  desc:         { fontFamily: 'Inter-Regular', fontSize: 13, lineHeight: 20 },
  readMore:     { fontSize: 11, fontFamily: 'Inter-Medium' },
  imageGallery: { paddingHorizontal: 16, paddingBottom: 16, gap: 8, marginTop: 8 },
  galleryImage: { width: width * 0.7, height: 180, borderRadius: 12 },
  actions:      { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, padding: 8, paddingHorizontal: 16, gap: 16 },
  voteBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  voteCount:    { fontFamily: 'Inter-Medium', fontSize: 12 },
  commentBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  commentCount: { fontFamily: 'Inter-Regular', fontSize: 12 },
  shareBtn:     { marginLeft: 'auto' },
  shareText:    { fontFamily: 'Inter-Medium', fontSize: 12 },
  empty:       { alignItems: 'center', padding: 32, borderRadius: 16, borderWidth: 1, gap: 8, marginTop: 40 },
  emptyTitle:  { fontFamily: 'Inter-SemiBold', fontSize: 16 },
  emptySub:    { fontFamily: 'Inter-Regular', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
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
import { theme } from '../theme/tokens';
import { useReports } from '../context/ReportsContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';

const { width } = Dimensions.get('window');
const FILTERS = ['Todos', 'Novos', 'Em análise', 'Resolvidos'];

// ── Vote button ───────────────────────────────────────────────────────────────
function VoteBtn({ count, onVote }: { count: number; onVote: () => void }) {
  const [voted, setVoted] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    if (!voted) {
      setVoted(true);
      onVote();
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <Pressable onPress={press} style={[styles.voteBtn, voted && styles.voteBtnActive]}>
      <Animated.Text style={[styles.voteIcon, { transform: [{ scale }] }, voted && styles.voteIconActive]}>▲</Animated.Text>
      <Text style={[styles.voteCount, voted && styles.voteCountActive]}>{count}</Text>
    </Pressable>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={styles.emptyTitle}>A comunidade está quieta</Text>
      <Text style={styles.emptySub}>Ninguém postou nada ainda em Caxias. Seja o primeiro a relatar um problema!</Text>
    </View>
  );
}

// ── Feed card ─────────────────────────────────────────────────────────────────
function FeedCard({ item, delay, onVote, ticker }: { item: any; delay: number; onVote: () => void; ticker: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [anim, delay]);

  return (
    <Animated.View style={[styles.card, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <UserAvatar user={{ name: item.userName, avatar: item.userAvatar, isCustomAvatar: item.isCustomAvatar }} size={36} />
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userTime}>{getRelativeTime(item.createdAt)} · {item.street}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.severityColor + '22', borderColor: item.severityColor + '55' }]}>
          <Text style={[styles.statusText, { color: item.severityColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={[styles.severityStripe, { backgroundColor: item.severityColor }]} />

      <Pressable onPress={() => setExpanded(!expanded)} style={styles.descContainer}>
        <Text style={styles.desc} numberOfLines={expanded ? undefined : 2}>{item.description}</Text>
        {item.description.length > 80 && (
          <Text style={styles.readMore}>{expanded ? 'Ver menos ↑' : 'Ver mais ↓'}</Text>
        )}
      </Pressable>

      {item.images && item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGallery}>
          {item.images.map((img: string, idx: number) => (
            <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <VoteBtn count={item.votes} onVote={onVote} />
        <Pressable style={styles.commentBtn}>
          <Text style={styles.commentIcon}>💬</Text>
          <Text style={styles.commentCount}>{item.comments}</Text>
        </Pressable>
        <Pressable style={styles.shareBtn}>
          <Text style={styles.shareText}>Compartilhar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export const FeedScreen = () => {
  const { reports, voteReport } = useReports();
  const [activeFilter, setFilter] = useState('Todos');
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    
    // Auto-refresh every 30s
    const interval = setInterval(() => setTicker(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [headerAnim]);

  const filtered = activeFilter === 'Todos'
    ? reports
    : reports.filter(r => r.status.toLowerCase() === activeFilter.toLowerCase().replace('s', ''));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View style={[styles.stickyHeader, { opacity: headerAnim }]}>
        <Text style={styles.screenTitle}>Comunidade</Text>
        <Text style={styles.screenSub}>{reports.length} reportes em Caxias</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {FILTERS.map(f => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}>
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        {reports.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((item, i) => (
            <FeedCard key={item.id} item={item} delay={100 + i * 80} onVote={() => voteReport(item.id)} ticker={ticker} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: theme.colors.background },
  stickyHeader: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm },
  screenTitle:  { fontSize: 24, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  screenSub:    { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, marginTop: 2, marginBottom: theme.spacing.md },
  filtersRow:   { flexDirection: 'row', gap: theme.spacing.sm, paddingBottom: 4 },
  filterChip:   { paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.radii.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface1 },
  filterChipActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(249,115,22,0.12)' },
  filterText:   { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, fontSize: 12 },
  filterTextActive: { color: theme.colors.primary },
  scroll:       { flex: 1 },
  feedContent:  { padding: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 32 },
  card:         { backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: theme.spacing.md, paddingBottom: 0 },
  userRow:      { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  userName:     { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 },
  userTime:     { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.regular, marginTop: 1 },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radii.full, borderWidth: 1 },
  statusText:   { fontSize: 10, fontFamily: theme.typography.fontFamily.medium },
  severityStripe: { height: 3, marginTop: theme.spacing.sm },
  descContainer:{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  desc:         { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 20 },
  readMore:     { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium, marginTop: 4, marginBottom: theme.spacing.sm },
  imageGallery: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md, gap: theme.spacing.sm },
  galleryImage: { width: width * 0.7, height: 180, borderRadius: theme.radii.lg },
  actions:      { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, padding: theme.spacing.sm, paddingHorizontal: theme.spacing.md, gap: theme.spacing.md },
  voteBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radii.full, borderWidth: 1, borderColor: theme.colors.border },
  voteBtnActive:{ borderColor: theme.colors.primary, backgroundColor: 'rgba(249,115,22,0.12)' },
  voteIcon:     { color: theme.colors.textMuted, fontSize: 11 },
  voteIconActive:{ color: theme.colors.primary },
  voteCount:    { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 12 },
  voteCountActive: { color: theme.colors.primary },
  commentBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  commentIcon:  { fontSize: 14 },
  commentCount: { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 12 },
  shareBtn:     { marginLeft: 'auto' },
  shareText:    { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 12 },
  empty:       { alignItems: 'center', padding: theme.spacing.xl, backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.sm, marginTop: 40 },
  emptyEmoji:  { fontSize: 40 },
  emptyTitle:  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold, fontSize: 16 },
  emptySub:    { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

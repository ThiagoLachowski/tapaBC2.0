import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/tokens';

// ── Mock feed data ────────────────────────────────────────────────────────────
const FEED = [
  { id: '1', user: 'Marcos S.',    avatar: '🧔', time: '20min', street: 'Av. Getúlio Vargas',    severity: 'Alta',   color: '#EF4444', votes: 22, comments: 5,  status: 'Novo',      desc: 'Buraco enorme próximo ao semáforo, risco para motos.' },
  { id: '2', user: 'Carla M.',    avatar: '👩', time: '1h',   street: 'R. Olavo Bilac',         severity: 'Média',  color: '#F97316', votes: 9,  comments: 2,  status: 'Em análise',desc: 'Dois buracos lado a lado, chuva piora bastante.' },
  { id: '3', user: 'Paulo R.',    avatar: '👨', time: '3h',   street: 'Av. Pres. Médici',       severity: 'Crítica',color: '#A855F7', votes: 34, comments: 11, status: 'Urgente',   desc: 'Buraco de mais de 30cm de profundidade, muito perigoso!' },
  { id: '4', user: 'Ana Lima',    avatar: '👩‍🦱', time: '5h',   street: 'R. da Saudade',          severity: 'Baixa',  color: '#22C55E', votes: 4,  comments: 1,  status: 'Resolvido', desc: 'Pequeno afundamento perto do colégio, já tamparam.' },
  { id: '5', user: 'João Victor', avatar: '🧑', time: '1d',   street: 'Travessa Coelho',        severity: 'Média',  color: '#F97316', votes: 7,  comments: 3,  status: 'Em análise',desc: 'Buraco com água parada, risco de dengue.' },
];

const FILTERS = ['Todos', 'Novos', 'Em análise', 'Resolvidos'];

// ── Vote button ───────────────────────────────────────────────────────────────
function VoteBtn({ count }: { count: number }) {
  const [voted, setVoted] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    setVoted(!voted);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,   duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable onPress={press} style={[styles.voteBtn, voted && styles.voteBtnActive]}>
      <Animated.Text style={[styles.voteIcon, { transform: [{ scale }] }]}>▲</Animated.Text>
      <Text style={[styles.voteCount, voted && styles.voteCountActive]}>{voted ? count + 1 : count}</Text>
    </Pressable>
  );
}

// ── Feed card ─────────────────────────────────────────────────────────────────
function FeedCard({ item, delay }: { item: typeof FEED[0]; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [anim, delay]);

  return (
    <Animated.View style={[styles.card, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <Text style={styles.userAvatar}>{item.avatar}</Text>
          <View>
            <Text style={styles.userName}>{item.user}</Text>
            <Text style={styles.userTime}>{item.time} · {item.street}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
          <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
        </View>
      </View>

      {/* Severity stripe */}
      <View style={[styles.severityStripe, { backgroundColor: item.color }]} />

      {/* Description */}
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={styles.desc} numberOfLines={expanded ? undefined : 2}>{item.desc}</Text>
        <Text style={styles.readMore}>{expanded ? 'Ver menos ↑' : 'Ver mais ↓'}</Text>
      </Pressable>

      {/* Action row */}
      <View style={styles.actions}>
        <VoteBtn count={item.votes} />
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
  const [activeFilter, setFilter] = useState('Todos');
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [headerAnim]);

  const filtered = activeFilter === 'Todos'
    ? FEED
    : FEED.filter(f => f.status.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sticky header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerAnim }]}>
        <Text style={styles.screenTitle}>Comunidade</Text>
        <Text style={styles.screenSub}>{FEED.length} reportes em Caxias</Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {FILTERS.map(f => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}>
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Feed */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        {filtered.map((item, i) => (
          <FeedCard key={item.id} item={item} delay={100 + i * 80} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
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
  userAvatar:   { fontSize: 28 },
  userName:     { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 },
  userTime:     { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.regular, marginTop: 1 },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radii.full, borderWidth: 1 },
  statusText:   { fontSize: 10, fontFamily: theme.typography.fontFamily.medium },

  severityStripe: { height: 3, marginTop: theme.spacing.sm },
  desc:         { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 20, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  readMore:     { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium, paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm },

  actions:      { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, padding: theme.spacing.sm, paddingHorizontal: theme.spacing.md, gap: theme.spacing.md },
  voteBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radii.full, borderWidth: 1, borderColor: theme.colors.border },
  voteBtnActive:{ borderColor: theme.colors.primary, backgroundColor: 'rgba(249,115,22,0.12)' },
  voteIcon:     { color: theme.colors.textMuted, fontSize: 11 },
  voteCount:    { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 12 },
  voteCountActive: { color: theme.colors.primary },
  commentBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  commentIcon:  { fontSize: 14 },
  commentCount: { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 12 },
  shareBtn:     { marginLeft: 'auto' },
  shareText:    { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 12 },
});

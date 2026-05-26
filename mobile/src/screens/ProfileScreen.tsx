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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';
import { useTheme } from '../context/ThemeContext';

// Função auxiliar para cor da severidade
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Baixa': return '#22C55E';
    case 'Média': return '#F97316';
    case 'Alta': return '#EF4444';
    case 'Crítica': return '#A855F7';
    default: return '#F97316';
  }
};

// Função auxiliar para status
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Resolvido': return '#22C55E';
    case 'Aprovado': return '#6366F1';
    case 'Em análise': return '#F97316';
    case 'Rejeitado': return '#EF4444';
    default: return '#64748B';
  }
};

// Níveis baseados na quantidade de reports
const getLevelInfo = (reportCount: number) => {
  if (reportCount >= 50) {
    return { name: 'Herói da Cidade', nextLevel: 50, currentProgress: reportCount, progressPercent: 100 };
  } else if (reportCount >= 25) {
    return { name: 'Fiscal Urbano', nextLevel: 50, currentProgress: reportCount, progressPercent: (reportCount / 50) * 100 };
  } else if (reportCount >= 10) {
    return { name: 'Guardião de Ruas', nextLevel: 25, currentProgress: reportCount, progressPercent: (reportCount / 25) * 100 };
  } else if (reportCount >= 3) {
    return { name: 'Observador', nextLevel: 10, currentProgress: reportCount, progressPercent: (reportCount / 10) * 100 };
  } else {
    return { name: 'Novato', nextLevel: 3, currentProgress: reportCount, progressPercent: (reportCount / 3) * 100 };
  }
};

const ACHIEVEMENTS = [
  { id: '1', icon: 'target', label: 'Primeiro Reporte', condition: (reports: number) => reports >= 1 },
  { id: '2', icon: 'hash', label: '10 Reportes', condition: (reports: number) => reports >= 10 },
  { id: '3', icon: 'star', label: '5 Resolvidos', condition: (reports: number, resolved: number) => resolved >= 5 },
  { id: '4', icon: 'map', label: 'Mapeou o Bairro', condition: (reports: number) => reports >= 5 },
  { id: '5', icon: 'zap', label: '50 Reportes', condition: (reports: number) => reports >= 50 },
  { id: '6', icon: 'award', label: 'Top Contribuidor', condition: (reports: number, resolved: number, rank: number) => rank === 1 },
];

function AnimRow({ children, delay }: { children: React.ReactNode; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [anim, delay]);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { reports } = useReports();
  const { theme, isDark } = useTheme();
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  // ✅ CORRIGIDO: usar user_id (campo correto do Supabase)
  const userReports = reports.filter(r => r.user_id === user.id);
  const userReportsCount = userReports.length;
  const resolvedCount = userReports.filter(r => r.status === 'Resolvido').length;

  // ✅ CORRIGIDO: Ranking baseado em user_id
  const ranking = Object.values(reports.reduce((acc, r) => {
    const userId = r.user_id;
    const userName = r.userName || 'Anônimo';
    if (!acc[userId]) {
      acc[userId] = { userId, name: userName, count: 0 };
    }
    acc[userId].count++;
    return acc;
  }, {} as Record<string, any>)).sort((a, b) => b.count - a.count);

  const userRankIndex = ranking.findIndex(r => r.userId === user.id);
  const userRank = userRankIndex === -1 ? (ranking.length > 0 ? ranking.length + 1 : '--') : userRankIndex + 1;

  // ✅ CORRIGIDO: Conquistas com base nos dados reais
  const dynamicAchievements = ACHIEVEMENTS.map(ach => {
    let done = false;
    if (ach.id === '1') done = userReportsCount >= 1;
    else if (ach.id === '2') done = userReportsCount >= 10;
    else if (ach.id === '3') done = resolvedCount >= 5;
    else if (ach.id === '4') done = userReportsCount >= 5;
    else if (ach.id === '5') done = userReportsCount >= 50;
    else if (ach.id === '6') done = userRank === 1;
    return { ...ach, done };
  });

  // ✅ CORRIGIDO: Nível baseado na quantidade de reports
  const levelInfo = getLevelInfo(userReportsCount);

  const MENU_ITEMS = [
    { icon: 'bell', label: 'Notificações', sub: 'Novidades dos seus reportes' },
    { icon: 'shield', label: 'Privacidade', sub: 'Gerencie seus dados' },
    { icon: 'message-circle', label: 'Feedback', sub: 'Nos ajude a melhorar' },
    { icon: 'help-circle', label: 'Ajuda e Suporte', sub: 'Dúvidas frequentes' },
    { icon: 'log-out', label: 'Sair', sub: 'Encerrar sessão', danger: true, onPress: logout },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <AnimRow delay={0}>
          <LinearGradient colors={[theme.colors.primary + '22', 'transparent']} style={styles.heroBg} />
          <View style={[styles.heroContent, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <UserAvatar user={user} size={64} />
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: theme.colors.textPrimary }]}>{user.name}</Text>
              <Text style={[styles.heroHandle, { color: theme.colors.textMuted }]}>{user.handle || user.email}</Text>
              <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary + '55' }]}>
                <Feather name="star" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.rankText, { color: theme.colors.primary }]}>{levelInfo.name}</Text>
              </View>
            </View>
          </View>
        </AnimRow>

        <AnimRow delay={100}>
          <View style={[styles.statsRow, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{userReportsCount}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Reportes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{resolvedCount}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Resolvidos</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>#{userRank}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Ranking</Text>
            </View>
          </View>
        </AnimRow>

        {userReportsCount > 0 && (
          <AnimRow delay={150}>
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Seus últimos reportes</Text>
              {userReports.slice(0, 3).map((r, i) => (
                <View key={r.id} style={[styles.historyRow, i < 2 && { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}>
                  <View style={[styles.historyDot, { backgroundColor: getSeverityColor(r.severity) }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyStreet, { color: theme.colors.textPrimary }]}>{r.street}</Text>
                    <Text style={[styles.historyTime, { color: theme.colors.textMuted }]}>{getRelativeTime(r.createdAt)}</Text>
                  </View>
                  <Text style={[styles.historyStatus, { color: getStatusColor(r.status) }]}>{r.status}</Text>
                </View>
              ))}
            </View>
          </AnimRow>
        )}

        <AnimRow delay={180}>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Progresso para próximo nível</Text>
            <View style={[styles.progressBg, { backgroundColor: theme.colors.surface2 }]}>
              <LinearGradient
                colors={[theme.colors.primary, isDark ? '#facc15' : '#4ade80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${levelInfo.progressPercent}%` }]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>{levelInfo.currentProgress} / {levelInfo.nextLevel} reportes</Text>
              <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>{Math.round(levelInfo.progressPercent)}%</Text>
            </View>
          </View>
        </AnimRow>

        <AnimRow delay={260}>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Conquistas</Text>
            <View style={styles.achievGrid}>
              {dynamicAchievements.map((a) => (
                <View key={a.id} style={[styles.achievBadge, !a.done && { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }, a.done && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '44' }]}>
                  <View style={[styles.achievIconWrapper, !a.done && { opacity: 0.3 }]}>
                    <Feather name={a.icon as any} size={24} color={a.done ? theme.colors.primary : theme.colors.textMuted} />
                  </View>
                  <Text style={[styles.achievLabel, { color: a.done ? theme.colors.textSecondary : theme.colors.textMuted }]}>{a.label}</Text>
                  {!a.done && (
                    <View style={styles.lockIcon}>
                      <Feather name="lock" size={10} color={theme.colors.textMuted} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </AnimRow>

        <AnimRow delay={420}>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            {MENU_ITEMS.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={[styles.menuRow, i < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
              >
                <View style={styles.menuIconWrapper}>
                  <Feather name={item.icon as any} size={20} color={item.danger ? '#EF4444' : theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: item.danger ? '#EF4444' : theme.colors.textPrimary }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: theme.colors.textMuted }]}>{item.sub}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </AnimRow>

        <View style={styles.footerRow}>
          <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>Caxias Buracos v2.0 · Feito com </Text>
          <Feather name="heart" size={10} color="#EF4444" />
          <Text style={[styles.versionText, { color: theme.colors.textMuted }]}> em Caxias</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  content: { padding: 24, paddingBottom: 40, gap: 16 },
  heroBg:    { ...StyleSheet.absoluteFillObject },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4, borderRadius: 16, padding: 24, borderWidth: 1 },
  heroInfo:  { flex: 1, gap: 4 },
  heroName:  { fontSize: 18, fontFamily: 'Inter-SemiBold' },
  heroHandle:{ fontSize: 12, fontFamily: 'Inter-Regular' },
  rankBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, marginTop: 2 },
  rankText:  { fontSize: 11, fontFamily: 'Inter-Medium' },
  statsRow:   { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  statBox:    { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue:  { fontSize: 22, fontFamily: 'Inter-SemiBold' },
  statLabel:  { fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 2 },
  statDivider:{ width: 1 },
  sectionCard:  { borderRadius: 16, padding: 24, borderWidth: 1, gap: 16 },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter-SemiBold' },
  
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyStreet: { fontSize: 13, fontFamily: 'Inter-Medium' },
  historyTime: { fontSize: 11 },
  historyStatus: { fontSize: 10, fontFamily: 'Inter-SemiBold' },

  progressBg:     { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:  { fontSize: 11, fontFamily: 'Inter-Regular' },
  achievGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achievBadge: { width: '30%', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 8, gap: 4, position: 'relative' },
  achievIconWrapper: { height: 32, justifyContent: 'center', alignItems: 'center' },
  achievLabel: { fontSize: 10, fontFamily: 'Inter-Medium', textAlign: 'center' },
  lockIcon:    { position: 'absolute', top: 4, right: 4 },
  menuRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 16 },
  menuIconWrapper: { width: 32, alignItems: 'center' },
  menuLabel:     { fontFamily: 'Inter-Medium', fontSize: 14 },
  menuSub:       { fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 1 },
  versionText: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter-Regular' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
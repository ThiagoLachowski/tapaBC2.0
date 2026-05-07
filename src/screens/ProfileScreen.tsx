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
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/tokens';

const ACHIEVEMENTS = [
  { id: '1', icon: '🏅', label: 'Primeiro Reporte',   done: false },
  { id: '2', icon: '🔟',  label: '10 Reportes',        done: false },
  { id: '3', icon: '🌟',  label: '5 Resolvidos',       done: false },
  { id: '4', icon: '🗺️', label: 'Mapeou o Bairro',    done: false },
  { id: '5', icon: '🚀',  label: '50 Reportes',        done: false },
  { id: '6', icon: '👑',  label: 'Top Contribuidor',   done: false },
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

  const userReports = reports.filter(r => r.userId === user.id);
  const userReportsCount = userReports.length;
  const resolvedCount = userReports.filter(r => r.status === 'Resolvido').length;

  const dynamicAchievements = ACHIEVEMENTS.map(ach => {
    if (ach.id === '1' && userReportsCount >= 1) return { ...ach, done: true };
    if (ach.id === '2' && userReportsCount >= 10) return { ...ach, done: true };
    if (ach.id === '3' && resolvedCount >= 5) return { ...ach, done: true };
    return ach;
  });

  const MENU_ITEMS = [
    { icon: '🔔', label: 'Notificações',       sub: 'Novidades dos seus reportes' },
    { icon: '🛡️', label: 'Privacidade',       sub: 'Gerencie seus dados' },
    { icon: '💬', label: 'Feedback',           sub: 'Nos ajude a melhorar' },
    { icon: '❓', label: 'Ajuda e Suporte',   sub: 'Dúvidas frequentes' },
    { icon: '🚪', label: 'Sair',              sub: 'Encerrar sessão', danger: true, onPress: logout },
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
              <Text style={[styles.heroHandle, { color: theme.colors.textMuted }]}>{user.handle}</Text>
              <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary + '55' }]}>
                <Text style={[styles.rankText, { color: theme.colors.primary }]}>⭐ Guardião de Ruas</Text>
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
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>#--</Text>
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
                  <View style={[styles.historyDot, { backgroundColor: r.severityColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyStreet, { color: theme.colors.textPrimary }]}>{r.street}</Text>
                    <Text style={[styles.historyTime, { color: theme.colors.textMuted }]}>{getRelativeTime(r.createdAt)}</Text>
                  </View>
                  <Text style={[styles.historyStatus, { color: r.severityColor }]}>{r.status}</Text>
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
                style={[styles.progressFill, { width: `${Math.min((userReportsCount/10)*100, 100)}%` }]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>{userReportsCount} / 10 reportes</Text>
              <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>{Math.round(Math.min((userReportsCount/10)*100, 100))}%</Text>
            </View>
          </View>
        </AnimRow>

        <AnimRow delay={260}>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Conquistas</Text>
            <View style={styles.achievGrid}>
              {dynamicAchievements.map((a) => (
                <View key={a.id} style={[styles.achievBadge, !a.done && { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }, a.done && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '44' }]}>
                  <Text style={[styles.achievIcon, !a.done && { opacity: 0.3 }]}>{a.icon}</Text>
                  <Text style={[styles.achievLabel, { color: a.done ? theme.colors.textSecondary : theme.colors.textMuted }]}>{a.label}</Text>
                  {!a.done && <Text style={styles.lockIcon}>🔒</Text>}
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
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: item.danger ? '#EF4444' : theme.colors.textPrimary }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: theme.colors.textMuted }]}>{item.sub}</Text>
                </View>
                <Text style={[styles.menuArrow, { color: theme.colors.textMuted }]}>›</Text>
              </Pressable>
            ))}
          </View>
        </AnimRow>

        <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>Caxias Buracos v2.0 · Feito com ❤️ em Caxias</Text>

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
  rankBadge: { borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, marginTop: 2 },
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
  achievBadge: { width: '30%', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 8, gap: 4 },
  achievIcon:  { fontSize: 24 },
  achievLabel: { fontSize: 10, fontFamily: 'Inter-Medium', textAlign: 'center' },
  lockIcon:    { fontSize: 10 },
  menuRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 16 },
  menuIcon:      { fontSize: 20, width: 28, textAlign: 'center' },
  menuLabel:     { fontFamily: 'Inter-Medium', fontSize: 14 },
  menuSub:       { fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 1 },
  menuArrow:     { fontSize: 20 },
  versionText: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 8 },
});

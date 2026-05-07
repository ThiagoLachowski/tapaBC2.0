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
import { theme } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { UserAvatar } from '../components/UserAvatar';
import { getRelativeTime } from '../utils/date';

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

function AchievBadge({ icon, label, done }: { icon: string; label: string; done: boolean }) {
  return (
    <View style={[styles.achievBadge, !done && styles.achievBadgeLocked]}>
      <Text style={[styles.achievIcon, !done && { opacity: 0.3 }]}>{icon}</Text>
      <Text style={[styles.achievLabel, !done && styles.achievLabelLocked]}>{label}</Text>
      {!done && <Text style={styles.lockIcon}>🔒</Text>}
    </View>
  );
}

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { reports } = useReports();
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <AnimRow delay={0}>
          <LinearGradient colors={['rgba(249,115,22,0.15)', 'transparent']} style={styles.heroBg} />
          <View style={styles.heroContent}>
            <UserAvatar user={user} size={64} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{user.name}</Text>
              <Text style={styles.heroHandle}>{user.handle}</Text>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>⭐ Guardião de Ruas</Text>
              </View>
            </View>
          </View>
        </AnimRow>

        <AnimRow delay={100}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{userReportsCount}</Text>
              <Text style={styles.statLabel}>Reportes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Resolvidos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>#--</Text>
              <Text style={styles.statLabel}>Ranking</Text>
            </View>
          </View>
        </AnimRow>

        {/* User History */}
        {userReportsCount > 0 && (
          <AnimRow delay={150}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Seus últimos reportes</Text>
              {userReports.slice(0, 3).map((r, i) => (
                <View key={r.id} style={[styles.historyRow, i < 2 && styles.historyBorder]}>
                  <View style={[styles.historyDot, { backgroundColor: r.severityColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyStreet}>{r.street}</Text>
                    <Text style={styles.historyTime}>{getRelativeTime(r.createdAt)}</Text>
                  </View>
                  <Text style={[styles.historyStatus, { color: r.severityColor }]}>{r.status}</Text>
                </View>
              ))}
            </View>
          </AnimRow>
        )}

        <AnimRow delay={180}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Progresso para próximo nível</Text>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={[theme.colors.primary, '#facc15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min((userReportsCount/10)*100, 100)}%` }]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{userReportsCount} / 10 reportes</Text>
              <Text style={styles.progressLabel}>{Math.round(Math.min((userReportsCount/10)*100, 100))}%</Text>
            </View>
          </View>
        </AnimRow>

        <AnimRow delay={260}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            <View style={styles.achievGrid}>
              {dynamicAchievements.map((a) => (
                <AchievBadge key={a.id} {...a} />
              ))}
            </View>
          </View>
        </AnimRow>

        <AnimRow delay={420}>
          <View style={styles.sectionCard}>
            {MENU_ITEMS.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, item.danger && styles.menuDanger]}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </AnimRow>

        <Text style={styles.versionText}>Caxias Buracos v2.0 · Feito com ❤️ em Caxias</Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40, gap: theme.spacing.md },
  heroBg:    { ...StyleSheet.absoluteFillObject },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xs, backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  heroInfo:  { flex: 1, gap: 4 },
  heroName:  { color: theme.colors.textPrimary, fontSize: 18, fontFamily: theme.typography.fontFamily.semiBold },
  heroHandle:{ color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.typography.fontFamily.regular },
  rankBadge: { backgroundColor: 'rgba(249,115,22,0.15)', borderRadius: theme.radii.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(249,115,22,0.35)', marginTop: 2 },
  rankText:  { color: theme.colors.primary, fontSize: 11, fontFamily: theme.typography.fontFamily.medium },
  statsRow:   { flexDirection: 'row', backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  statBox:    { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.md },
  statValue:  { fontSize: 22, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  statLabel:  { fontSize: 11, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, marginTop: 2 },
  statDivider:{ width: 1, backgroundColor: theme.colors.border },
  sectionCard:  { backgroundColor: theme.colors.surface1, borderRadius: theme.radii.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },
  sectionTitle: { fontSize: 14, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semiBold },
  
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyStreet: { color: theme.colors.textPrimary, fontSize: 13, fontFamily: theme.typography.fontFamily.medium },
  historyTime: { color: theme.colors.textMuted, fontSize: 11 },
  historyStatus: { fontSize: 10, fontFamily: theme.typography.fontFamily.semiBold },

  progressBg:     { height: 8, backgroundColor: theme.colors.surface2, borderRadius: 4, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:  { fontSize: 11, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
  achievGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  achievBadge: { width: '30%', alignItems: 'center', backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: theme.radii.lg, borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', padding: theme.spacing.sm, gap: 4 },
  achievBadgeLocked: { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
  achievIcon:  { fontSize: 24 },
  achievLabel: { fontSize: 10, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, textAlign: 'center' },
  achievLabelLocked: { color: theme.colors.textMuted },
  lockIcon:    { fontSize: 10 },
  menuRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, gap: theme.spacing.md },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  menuIcon:      { fontSize: 20, width: 28, textAlign: 'center' },
  menuLabel:     { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.medium, fontSize: 14 },
  menuDanger:    { color: '#EF4444' },
  menuSub:       { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.regular, marginTop: 1 },
  menuArrow:     { color: theme.colors.textMuted, fontSize: 20 },
  versionText: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.regular, marginTop: theme.spacing.sm },
});

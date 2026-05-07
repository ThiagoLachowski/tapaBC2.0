import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { HomeScreen }    from '../screens/HomeScreen';
import { ReportScreen }  from '../screens/ReportScreen';
import { FeedScreen }    from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/tokens';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { default: string; active: string }> = {
  Início:    { default: '🗺️', active: '🗺️' },
  Reportar:  { default: '＋',   active: '＋' },
  Comunidade:{ default: '💬',  active: '💬' },
  Perfil:    { default: '👤',  active: '👤' },
};

function TabIcon({ name, focused, theme }: { name: string; focused: boolean; theme: any }) {
  const isReport = name === 'Reportar';
  if (isReport) {
    return (
      <View style={[styles.reportFab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}>
        <Text style={styles.reportFabIcon}>＋</Text>
      </View>
    );
  }
  return <Text style={[styles.icon, focused && styles.iconActive, { color: focused ? theme.colors.primary : theme.colors.textMuted }]}>{ICONS[name]?.default ?? '●'}</Text>;
}

export function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.colors.surface1, borderTopColor: theme.colors.border }],
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} theme={theme} />,
      })}
    >
      <Tab.Screen name="Início"     component={HomeScreen}    />
      <Tab.Screen name="Comunidade" component={FeedScreen}    />
      <Tab.Screen name="Reportar"   component={ReportScreen}  options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Perfil"     component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  tabItem: { height: 56 },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: -2,
  },
  icon:     { fontSize: 22 },
  iconActive: { transform: [{ scale: 1.1 }] },
  reportFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  reportFabIcon: { color: '#FFF', fontSize: 28, lineHeight: 34, fontWeight: '300' },
});


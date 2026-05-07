import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { HomeScreen }    from '../screens/HomeScreen';
import { ReportScreen }  from '../screens/ReportScreen';
import { FeedScreen }    from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { theme } from '../theme/tokens';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { default: string; active: string }> = {
  Início:    { default: '🗺️', active: '🗺️' },
  Reportar:  { default: '＋',   active: '＋' },
  Comunidade:{ default: '💬',  active: '💬' },
  Perfil:    { default: '👤',  active: '👤' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const isReport = name === 'Reportar';
  if (isReport) {
    return (
      <View style={styles.reportFab}>
        <Text style={styles.reportFabIcon}>＋</Text>
      </View>
    );
  }
  return <Text style={[styles.icon, focused && styles.iconActive]}>{ICONS[name]?.default ?? '●'}</Text>;
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
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
    backgroundColor: '#0e0e0e',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
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
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  reportFabIcon: { color: '#FFF', fontSize: 28, lineHeight: 34, fontWeight: '300' },
});

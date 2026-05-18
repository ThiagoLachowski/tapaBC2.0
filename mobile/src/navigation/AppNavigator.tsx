import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FullMapScreen } from '../screens/FullMapScreen';
import { ReportDetailScreen } from '../screens/ReportDetailScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ Stack para Início (Home)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

// ✅ Stack para Mapa
function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={FullMapScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

// ✅ Stack para Comunidade
function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityMain" component={FeedScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

// ✅ Stack para Perfil
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

const ICONS: Record<string, string> = {
  Início: 'home',
  Mapa: 'navigation',
  Comunidade: 'message-square',
  Perfil: 'user',
  Reportar: 'plus',
};

function TabIcon({ name, focused, theme }: { name: string; focused: boolean; theme: any }) {
  const isReport = name === 'Reportar';
  const iconName = ICONS[name] as any;

  if (isReport) {
    return (
      <View style={[styles.reportFab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}>
        <Feather name="plus" size={26} color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.iconWrapper}>
      <Feather 
        name={iconName} 
        size={20} 
        color={focused ? theme.colors.primary : theme.colors.textMuted} 
      />
    </View>
  );
}

export function AppNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.surface1,
            borderTopColor: theme.colors.border,
            paddingBottom: 6 + insets.bottom,
          },
        ],
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} theme={theme} />,
        tabBarHideOnKeyboard: true,
      })}
    >
      {/* ✅ Stacks aninhados - NÃO tem ReportDetail aqui! */}
      <Tab.Screen name="Início" component={HomeStack} />
      <Tab.Screen name="Mapa" component={MapStack} />
      <Tab.Screen name="Comunidade" component={CommunityStack} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
      <Tab.Screen name="Reportar" component={ReportScreen} options={{ tabBarLabel: '' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 115,
    paddingBottom: 24,
    paddingTop: 6,
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: 0,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  reportFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
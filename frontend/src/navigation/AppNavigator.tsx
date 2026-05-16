import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { HomeScreen }    from '../screens/HomeScreen';
import { ReportScreen }  from '../screens/ReportScreen';
import { FeedScreen }    from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Início:     'map',
  Reportar:   'plus',
  Comunidade: 'message-square',
  Perfil:     'user',
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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.colors.surface1, borderTopColor: theme.colors.border }],
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} theme={theme} />,
        tabBarHideOnKeyboard: true,
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
    height: 58,
    paddingBottom: 6,
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






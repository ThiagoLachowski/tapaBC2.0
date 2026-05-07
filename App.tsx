import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ReportsProvider } from './src/context/ReportsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { theme } from './src/theme/tokens';

// ── Splash / loading fade ─────────────────────────────────────────────────────
function SplashFade({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [opacity]);
  return <Animated.View style={[{ flex: 1 }, { opacity }]}>{children}</Animated.View>;
}

// ── Root Content (decides which navigator to show) ──────────────────────────
function RootContent() {
  const { user } = useAuth();

  return (
    <SplashFade>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </SplashFade>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular':  Inter_400Regular,
    'Inter-Medium':   Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  if (!fontsLoaded) return <View style={styles.loading} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <ReportsProvider>
          <NavigationContainer>
            <RootContent />
          </NavigationContainer>
        </ReportsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: theme.colors.background },
});

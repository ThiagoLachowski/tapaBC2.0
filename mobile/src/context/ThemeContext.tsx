import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Animated } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../theme/tokens';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  transition: Animated.Value;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme !== 'light');
  const transition = useRef(new Animated.Value(isDark ? 0 : 1)).current;

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    
    Animated.timing(transition, {
      toValue: nextIsDark ? 0 : 1,
      duration: 400,
      useNativeDriver: false, // Color interpolation doesn't work with native driver in standard Animated
    }).start();
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, transition }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

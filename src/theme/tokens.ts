export const darkTheme = {
  colors: {
    background: '#050505',
    surface1: '#171717',
    surface2: '#262626',
    surface3: '#404040',
    primary: '#F97316', // Orange
    primaryMuted: 'rgba(249, 115, 22, 0.2)',
    indigo: '#6366F1',
    emerald: '#10B981',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    border: '#262626',
    borderLight: 'rgba(255,255,255,0.08)',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 64 },
  typography: {
    fontFamily: { regular: 'Inter-Regular', medium: 'Inter-Medium', semiBold: 'Inter-SemiBold' },
    sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, xxl: 30, hero: 48 },
    weights: { regular: '400' as const, medium: '500' as const, semiBold: '600' as const }
  },
  radii: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }
};

export const lightTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#FFFFFF',
    surface1: '#F5F5F5',
    surface2: '#E5E5E5',
    surface3: '#D4D4D4',
    primary: '#10B981', // Green (Emerald) for buttons in light mode
    primaryMuted: 'rgba(16, 185, 129, 0.2)',
    textPrimary: '#171717',
    textSecondary: '#525252',
    textMuted: '#737373',
    border: '#E5E5E5',
    borderLight: 'rgba(0,0,0,0.05)',
  }
};

export type Theme = typeof darkTheme;
export const theme = darkTheme;
export default theme;

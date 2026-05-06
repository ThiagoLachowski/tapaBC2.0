export const theme = {
  colors: {
    // Canvas & Surfaces
    background: '#050505',
    surface1: '#171717', // neutral-900
    surface2: '#262626', // neutral-800
    surface3: '#404040', // neutral-700
    
    // Brand Caxias Buracos x Modern
    primary: '#F97316', // Orange 500
    primaryMuted: 'rgba(249, 115, 22, 0.2)',
    
    // Accents
    indigo: '#6366F1',
    emerald: '#10B981',
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3', // neutral-400
    textMuted: '#737373', // neutral-500
    
    // Borders
    border: '#262626', // neutral-800
    borderLight: 'rgba(255,255,255,0.08)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 64,
  },
  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semiBold: 'Inter-SemiBold',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 30,
      hero: 48,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semiBold: '600' as const,
    }
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  }
};

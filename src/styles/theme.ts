// src/styles/theme.ts
import { Platform } from 'react-native';

export const colors = {
  // Backgrounds
  bg: '#FAFAFA',
  bgElevated: '#FFFFFF',

  // Textos
  text: '#0A0A0A',
  textSecondary: '#6B6B6B',
  textTertiary: '#A3A3A3',

  // Bordes y divisores
  border: '#E5E5E5',
  borderLight: '#F5F5F5',

  // Acento
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  accentLight: '#DBEAFE',

  // Estados
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.05)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }),

  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
  },

  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  h3: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
  },

  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },

  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },

  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

export const shadows = {
  // Sombras sutiles y profesionales
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export default theme;

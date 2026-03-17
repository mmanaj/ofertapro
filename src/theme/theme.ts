import { MD3LightTheme, configureFonts } from 'react-native-paper';

// OfertaPro — niebieski motyw profesjonalny
// Bazowany na Material Design 3

export const COLORS = {
  primary: '#2563EB',       // niebieski główny
  primaryContainer: '#EFF6FF',
  secondary: '#1E40AF',     // ciemniejszy niebieski
  secondaryContainer: '#DBEAFE',
  tertiary: '#7C3AED',      // fioletowy akcent (rzadko)
  success: '#16A34A',
  successContainer: '#DCFCE7',
  warning: '#D97706',
  warningContainer: '#FEF3C7',
  error: '#DC2626',
  errorContainer: '#FEE2E2',
  surface: '#FFFFFF',
  background: '#F9FAFB',
  onSurface: '#111827',
  onBackground: '#111827',
  outline: '#E5E7EB',
  outlineVariant: '#F3F4F6',
  grey50: '#F9FAFB',
  grey100: '#F3F4F6',
  grey200: '#E5E7EB',
  grey400: '#9CA3AF',
  grey600: '#6B7280',
  grey900: '#111827',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primaryContainer,
    secondary: COLORS.secondary,
    secondaryContainer: COLORS.secondaryContainer,
    tertiary: COLORS.tertiary,
    error: COLORS.error,
    errorContainer: COLORS.errorContainer,
    surface: COLORS.surface,
    background: COLORS.background,
    onSurface: COLORS.onSurface,
    onBackground: COLORS.onBackground,
    outline: COLORS.outline,
    surfaceVariant: COLORS.grey100,
    onSurfaceVariant: COLORS.grey600,
  },
  roundness: 3, // MD3 uses multiplier: 3 = 12px border radius
};

export type AppTheme = typeof theme;

export const palette = {
  navy: {
    50: '#F0F4F8',
    100: '#D9E2EC',
    200: '#BCCCDC',
    300: '#9FB3C8',
    400: '#829AB1',
    500: '#627D98',
    600: '#486581',
    700: '#334E68',
    800: '#1E3A5F',
    900: '#0D2748',
    950: '#061221',
  },
  gold: {
    50: '#FFFBEA',
    100: '#FFF3C4',
    200: '#FFE58F',
    300: '#FFD659',
    400: '#FFC82E',
    500: '#FFC107',
    600: '#D49E00',
    700: '#A87A00',
    800: '#7D5700',
    900: '#543800',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  status: {
    success: '#16A34A',
    successBg: '#DCFCE7',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    info: '#2563EB',
    infoBg: '#DBEAFE',
  },
} as const;

export interface ThemeColors {
  isDark: boolean;
  primary: string;
  primaryHover: string;
  accent: string;
  accentContrast: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textInverse: string;
  icon: string;
  card: string;
  error: string;
  errorBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  headerBackground: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  isDark: false,
  primary: palette.navy[900],
  primaryHover: palette.navy[800],
  accent: palette.gold[500],
  accentContrast: palette.navy[900],
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  text: palette.navy[900],
  textMuted: '#475569',
  textInverse: '#FFFFFF',
  icon: palette.navy[900],
  card: '#FFFFFF',
  error: palette.status.danger,
  errorBg: palette.status.dangerBg,
  success: palette.status.success,
  successBg: palette.status.successBg,
  warning: palette.status.warning,
  warningBg: palette.status.warningBg,
  headerBackground: palette.navy[900],
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: palette.navy[900],
  tabBarInactive: '#64748B',
  overlay: 'rgba(13, 39, 72, 0.7)',
};

export const darkColors: ThemeColors = {
  isDark: true,
  primary: palette.gold[500],
  primaryHover: palette.gold[400],
  accent: palette.gold[500],
  accentContrast: palette.navy[900],
  background: palette.navy[950],
  surface: palette.navy[900],
  surfaceElevated: '#133560',
  surfaceMuted: '#102E54',
  border: '#1E4273',
  borderSubtle: '#142F50',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textInverse: palette.navy[950],
  icon: palette.gold[500],
  card: palette.navy[900],
  error: '#F87171',
  errorBg: 'rgba(220, 38, 38, 0.2)',
  success: '#4ADE80',
  successBg: 'rgba(22, 163, 74, 0.2)',
  warning: '#FBBF24',
  warningBg: 'rgba(217, 119, 6, 0.2)',
  headerBackground: palette.navy[950],
  tabBarBackground: palette.navy[950],
  tabBarBorder: '#1E4273',
  tabBarActive: palette.gold[500],
  tabBarInactive: '#64748B',
  overlay: 'rgba(6, 18, 33, 0.85)',
};

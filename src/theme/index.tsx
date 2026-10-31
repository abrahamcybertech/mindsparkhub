import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, palette, type ThemeColors } from './colors';
import { fontFamilies, typography } from './typography';
import { radii, shadows, spacing } from './spacing';

export interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setScheme: (scheme: 'light' | 'dark' | 'system') => void;
  colorSchemePreference: 'light' | 'dark' | 'system';
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  palette: typeof palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<'light' | 'dark' | 'system'>('system');

  const activeDark =
    preference === 'system' ? systemScheme === 'dark' : preference === 'dark';

  const colors = activeDark ? darkColors : lightColors;

  const toggleTheme = () => {
    setPreference((current) => {
      if (current === 'system') {
        return systemScheme === 'dark' ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const setScheme = (scheme: 'light' | 'dark' | 'system') => {
    setPreference(scheme);
  };

  const value: ThemeContextValue = {
    colors,
    isDark: activeDark,
    toggleTheme,
    setScheme,
    colorSchemePreference: preference,
    typography,
    fontFamilies,
    spacing,
    radii,
    shadows,
    palette,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export * from './colors';
export * from './typography';
export * from './spacing';

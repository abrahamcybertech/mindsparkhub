import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Typography';

export interface BadgeProps {
  label: string;
  variant?: 'gold' | 'navy' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'gold',
  size = 'md',
  style,
}: BadgeProps) {
  const { colors, radii, spacing } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'gold':
        return {
          bg: colors.isDark ? 'rgba(255, 193, 7, 0.2)' : '#FEF3C7',
          text: colors.isDark ? colors.accent : '#92400E',
          border: colors.isDark ? colors.accent : '#FCD34D',
        };
      case 'navy':
        return {
          bg: colors.isDark ? '#133560' : '#E2E8F0',
          text: colors.isDark ? '#F8FAFC' : colors.primary,
          border: colors.isDark ? '#1E4273' : '#CBD5E1',
        };
      case 'success':
        return {
          bg: colors.isDark ? 'rgba(22, 163, 74, 0.2)' : colors.successBg,
          text: colors.isDark ? '#4ADE80' : colors.success,
          border: colors.isDark ? '#16A34A' : '#86EFAC',
        };
      case 'warning':
        return {
          bg: colors.isDark ? 'rgba(217, 119, 6, 0.2)' : colors.warningBg,
          text: colors.isDark ? '#FBBF24' : colors.warning,
          border: colors.isDark ? '#D97706' : '#FDE68A',
        };
      case 'danger':
        return {
          bg: colors.isDark ? 'rgba(220, 38, 38, 0.2)' : colors.errorBg,
          text: colors.isDark ? '#F87171' : colors.error,
          border: colors.isDark ? '#DC2626' : '#FCA5A5',
        };
      case 'info':
        return {
          bg: colors.isDark ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE',
          text: colors.isDark ? '#60A5FA' : '#1D4ED8',
          border: colors.isDark ? '#2563EB' : '#93C5FD',
        };
      case 'neutral':
      default:
        return {
          bg: colors.surfaceMuted,
          text: colors.textMuted,
          border: colors.border,
        };
    }
  };

  const badgeColors = getColors();
  const paddingVertical = size === 'sm' ? 2 : 4;
  const paddingHorizontal = size === 'sm' ? spacing.xs : spacing.sm;
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          borderRadius: radii.full,
          paddingVertical,
          paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        variant="captionBold"
        color={badgeColors.text}
        style={{ fontSize }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

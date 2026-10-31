import React from 'react';
import {
  Pressable,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'elevated' | 'muted' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({
  children,
  onPress,
  style,
  variant = 'surface',
  padding = 'md',
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { colors, radii, spacing, shadows } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return colors.surfaceElevated;
      case 'muted':
        return colors.surfaceMuted;
      case 'outline':
        return 'transparent';
      case 'surface':
      default:
        return colors.surface;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'lg':
        return spacing.xl;
      case 'md':
      default:
        return spacing.md;
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: radii.md,
    borderColor: colors.border,
    borderWidth: 1,
    padding: getPadding(),
    ...(variant === 'elevated' ? shadows.sm : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [
          containerStyle,
          pressed && { opacity: 0.88 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Typography';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors, radii, spacing } = useTheme();

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';
    let borderWidth = 0;
    let opacity = disabled || loading ? 0.6 : pressed ? 0.85 : 1;

    switch (variant) {
      case 'primary':
        backgroundColor = colors.accent; // Gold
        break;
      case 'secondary':
        backgroundColor = colors.isDark ? colors.surfaceElevated : colors.primary;
        break;
      case 'outline':
        borderColor = colors.isDark ? colors.accent : colors.primary;
        borderWidth = 1.5;
        backgroundColor = 'transparent';
        break;
      case 'ghost':
        backgroundColor = pressed ? (colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,39,72,0.06)') : 'transparent';
        break;
      case 'danger':
        backgroundColor = colors.error;
        break;
    }

    const paddingVertical = size === 'sm' ? spacing.xs : size === 'lg' ? spacing.md : spacing.sm;
    const paddingHorizontal = size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg;
    const minHeight = size === 'sm' ? 44 : size === 'lg' ? 54 : 48;

    return {
      backgroundColor,
      borderColor,
      borderWidth,
      borderRadius: radii.md,
      paddingVertical,
      paddingHorizontal,
      minHeight,
      opacity,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.accentContrast; // Navy on gold
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
        return colors.isDark ? colors.accent : colors.primary;
      case 'ghost':
        return colors.text;
      case 'danger':
        return '#FFFFFF';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [getContainerStyle(pressed), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' ? (
            <View style={styles.leftIcon}>{icon}</View>
          ) : null}
          <Text
            variant="button"
            color={getTextColor()}
            style={size === 'sm' ? styles.smallText : undefined}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' ? (
            <View style={styles.rightIcon}>{icon}</View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  spinner: {
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 13,
  },
});

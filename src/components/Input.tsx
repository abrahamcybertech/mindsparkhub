import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  Pressable,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Typography';
import { Eye, EyeOff } from 'lucide-react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightIcon,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  editable = true,
  style,
  ...rest
}: InputProps) {
  const { colors, radii, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword ? !showPassword : secureTextEntry;

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.accent;
    return colors.border;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text variant="subhead" color={colors.text} style={styles.label}>
            {label}
          </Text>
          {required ? (
            <Text variant="subhead" color={colors.error}>
              {' *'}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: editable ? colors.surface : colors.surfaceMuted,
            borderColor: getBorderColor(),
            borderRadius: radii.md,
            borderWidth: isFocused || error ? 1.5 : 1,
          },
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          editable={editable}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            typography.body,
            { color: colors.text },
            style,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={error ? `Error: ${error}` : undefined}
          {...rest}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text
          variant="caption"
          color={colors.error}
          style={styles.feedbackText}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          variant="caption"
          color={colors.textMuted}
          style={styles.feedbackText}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
  feedbackText: {
    marginTop: 4,
    marginLeft: 2,
  },
});

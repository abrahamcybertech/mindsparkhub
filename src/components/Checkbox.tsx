import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Typography';
import { Check } from 'lucide-react-native';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  children?: React.ReactNode;
  error?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  label,
  children,
  error,
  containerStyle,
  disabled = false,
}: CheckboxProps) {
  const { colors, radii } = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Pressable
        onPress={() => !disabled && onChange(!checked)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={label || 'Consent checkbox'}
        style={styles.touchArea}
      >
        <View
          style={[
            styles.box,
            {
              borderRadius: radii.xs,
              borderColor: error ? colors.error : checked ? colors.accent : colors.border,
              backgroundColor: checked ? colors.accent : colors.surface,
              borderWidth: checked ? 0 : 1.5,
            },
          ]}
        >
          {checked ? (
            <Check size={16} color={colors.accentContrast} strokeWidth={3} />
          ) : null}
        </View>

        <View style={styles.labelContainer}>
          {children ? (
            children
          ) : label ? (
            <Text variant="body" color={colors.text} style={styles.labelText}>
              {label}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {error ? (
        <Text
          variant="caption"
          color={colors.error}
          style={styles.errorText}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  touchArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
    paddingVertical: 4,
  },
  box: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 36,
  },
});

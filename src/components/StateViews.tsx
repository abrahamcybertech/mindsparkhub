import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { Heading, Text } from './Typography';
import { Button } from './Button';
import { AlertCircle, FolderSearch, RefreshCw } from 'lucide-react-native';

export function LoadingView({
  message = 'Loading content...',
  style,
}: {
  message?: string;
  style?: ViewStyle;
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.centered, { padding: spacing.xxl }, style]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text
        variant="callout"
        color={colors.textMuted}
        style={{ marginTop: spacing.md }}
      >
        {message}
      </Text>
    </View>
  );
}

export function EmptyState({
  title = 'No items available',
  description = 'There is currently no information to show in this section.',
  actionLabel,
  onAction,
  icon,
  style,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.centered, { padding: spacing.xl }, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        ]}
      >
        {icon || <FolderSearch size={32} color={colors.textMuted} />}
      </View>
      <Heading level={3} style={{ textAlign: 'center', marginTop: spacing.md }}>
        {title}
      </Heading>
      <Text
        variant="body"
        color={colors.textMuted}
        align="center"
        style={{ marginTop: spacing.xs, maxWidth: 320 }}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={{ marginTop: spacing.lg }}
        />
      ) : null}
    </View>
  );
}

export function ErrorView({
  title = 'Unable to load content',
  message = 'Please check your internet connection and try again.',
  onRetry,
  style,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.centered, { padding: spacing.xl }, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.errorBg, borderColor: colors.error },
        ]}
      >
        <AlertCircle size={32} color={colors.error} />
      </View>
      <Heading level={3} style={{ textAlign: 'center', marginTop: spacing.md }}>
        {title}
      </Heading>
      <Text
        variant="body"
        color={colors.textMuted}
        align="center"
        style={{ marginTop: spacing.xs, maxWidth: 320 }}
      >
        {message}
      </Text>
      {onRetry ? (
        <Button
          label="Try again"
          onPress={onRetry}
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={16} color="#FFFFFF" />}
          style={{ marginTop: spacing.lg }}
        />
      ) : null}
    </View>
  );
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const [animatedValue] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

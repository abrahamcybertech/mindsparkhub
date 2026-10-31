import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?:
    | 'display'
    | 'title1'
    | 'title2'
    | 'title3'
    | 'headline'
    | 'body'
    | 'bodyEmphasis'
    | 'callout'
    | 'subhead'
    | 'caption'
    | 'captionBold'
    | 'button'
    | 'eyebrow';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Text({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();

  const variantStyle = typography[variant] || typography.body;
  const textColor = color ?? (variant === 'eyebrow' ? colors.accent : colors.text);

  return (
    <RNText
      maxFontSizeMultiplier={1.5}
      style={[
        variantStyle,
        { color: textColor },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Heading({
  level = 1,
  children,
  style,
  ...rest
}: {
  level?: 1 | 2 | 3;
} & TextProps) {
  const variant = level === 1 ? 'title1' : level === 2 ? 'title2' : 'title3';
  return (
    <Text
      accessibilityRole="header"
      variant={variant}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Subheading({
  children,
  style,
  ...rest
}: TextProps) {
  return (
    <Text variant="headline" style={style} {...rest}>
      {children}
    </Text>
  );
}

export function Caption({
  children,
  style,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  return (
    <Text
      variant="caption"
      color={colors.textMuted}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Eyebrow({
  children,
  style,
  ...rest
}: TextProps) {
  return (
    <Text variant="eyebrow" style={style} {...rest}>
      {children}
    </Text>
  );
}

import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { useTheme } from '@/theme';
import { Text } from './Typography';

export interface SafeImageProps {
  source?: string | { uri: string } | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  altText: string;
  blurhash?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const DEFAULT_BLURHASH =
  '|02$8q00~q_3ofofWBfQof%MfQWBWBj[fQj[fQof00%MofWBWBofj[j[fQ00%Mofj[j[ofofj[fQ%MofWBoffQj[ofofWB';

export function SafeImage({
  source,
  style,
  containerStyle,
  altText,
  blurhash = DEFAULT_BLURHASH,
  contentFit = 'cover',
}: SafeImageProps) {
  const { colors, radii } = useTheme();
  const [hasError, setHasError] = useState(false);

  const uri = typeof source === 'string' ? source : source?.uri;

  if (!uri || hasError) {
    return (
      <View
        style={[
          styles.fallbackContainer,
          {
            backgroundColor: colors.primary,
            borderRadius: radii.md,
          },
          containerStyle,
          style as any,
        ]}
        accessibilityRole="image"
        accessibilityLabel={altText}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.fallbackLogo}
          contentFit="contain"
          accessibilityLabel="MindSpark Hub logo"
        />
        <Text
          variant="caption"
          color="rgba(255,255,255,0.7)"
          align="center"
          numberOfLines={2}
          style={styles.fallbackText}
        >
          {altText}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { borderRadius: radii.md, overflow: 'hidden' },
        containerStyle,
      ]}
    >
      <Image
        source={{ uri }}
        placeholder={{ blurhash }}
        contentFit={contentFit}
        transition={250}
        cachePolicy="memory-disk"
        onError={() => setHasError(true)}
        accessibilityLabel={altText}
        style={[styles.image, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackLogo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  fallbackText: {
    paddingHorizontal: 8,
  },
});

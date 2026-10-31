import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Heading, Text } from './Typography';
import { ArrowLeft, Moon, Sun } from 'lucide-react-native';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showLogo = false,
  rightAction,
  style,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: colors.headerBackground,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.leftGroup}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <ArrowLeft size={22} color="#FFFFFF" />
            </Pressable>
          ) : null}

          {showLogo ? (
            <View style={styles.logoGroup}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="MindSpark Hub logo mark"
              />
              <View style={styles.titleColumn}>
                <Text
                  variant="headline"
                  color="#FFFFFF"
                  style={styles.appName}
                >
                  MindSpark Hub
                </Text>
                <Text
                  variant="caption"
                  color={colors.accent}
                  style={styles.appSlogan}
                >
                  We spark growth and ignite Mindset
                </Text>
              </View>
            </View>
          ) : title ? (
            <View style={styles.titleColumn}>
              <Heading level={2} color="#FFFFFF" numberOfLines={1}>
                {title}
              </Heading>
              {subtitle ? (
                <Text variant="caption" color={colors.accent}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.rightGroup}>
          {rightAction}

          <Pressable
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={styles.themeToggle}
          >
            {isDark ? (
              <Sun size={20} color={colors.accent} />
            ) : (
              <Moon size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
    borderRadius: 8,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 10,
  },
  titleColumn: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  appName: {
    fontWeight: '700',
    fontSize: 17,
  },
  appSlogan: {
    fontSize: 11,
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 8,
  },
});

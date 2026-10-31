import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { API_BASE_URL } from '@/lib/api';
import { ExternalLink, Globe, Shield, Smartphone } from 'lucide-react-native';

export default function AboutAppScreen() {
  const { colors } = useTheme();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const sdkVersion = Constants.expoConfig?.sdkVersion ?? '58.0.0';

  const handleOpenWebsite = () => {
    Linking.openURL(API_BASE_URL);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="About this App" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App identity card */}
        <Card variant="elevated" padding="lg" style={styles.appCard}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="MindSpark Hub Logo"
          />

          <Heading level={1} color={colors.text} align="center" style={{ marginTop: 12 }}>
            MindSpark Hub
          </Heading>

          <Text variant="subhead" color={colors.accent} align="center" style={{ marginTop: 4 }}>
            Official Companion Application
          </Text>

          <Text variant="caption" color={colors.textMuted} align="center" style={{ marginTop: 6 }}>
            Version {appVersion} (Expo SDK {sdkVersion})
          </Text>
        </Card>

        {/* Technical details */}
        <Card variant="surface" padding="md" style={styles.sectionCard}>
          <Heading level={3} color={colors.text}>
            Platform and Compliance
          </Heading>

          <View style={styles.itemRow}>
            <Smartphone size={18} color={colors.accent} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text variant="captionBold" color={colors.textMuted}>
                Runtime Architecture
              </Text>
              <Text variant="body" color={colors.text}>
                Expo SDK 58, React Native, Strict TypeScript
              </Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Shield size={18} color={colors.accent} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text variant="captionBold" color={colors.textMuted}>
                Data Protection Standard
              </Text>
              <Text variant="body" color={colors.text}>
                Nigeria Data Protection Act 2023 (NDPA)
              </Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Globe size={18} color={colors.accent} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text variant="captionBold" color={colors.textMuted}>
                Institutional Website
              </Text>
              <Text variant="body" color={colors.text}>
                {API_BASE_URL}
              </Text>
            </View>
          </View>
        </Card>

        {/* External website link */}
        <Button
          label="Visit Canonical Website"
          variant="primary"
          fullWidth
          onPress={handleOpenWebsite}
          icon={<ExternalLink size={18} color={colors.accentContrast} />}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  appCard: {
    alignItems: 'center',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },
});

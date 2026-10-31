import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth';
import { Fingerprint, Lock, LogOut, Shield, User } from 'lucide-react-native';

export default function StaffSettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    user,
    isBiometricSupported,
    isBiometricEnabled,
    toggleBiometrics,
    logout,
  } = useAuth();

  const handleToggleBio = async (val: boolean) => {
    try {
      await toggleBiometrics(val);
    } catch {
      Alert.alert('Notice', 'Could not update biometric preferences.');
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of the staff area?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Staff Settings" subtitle="Security and Session" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account Info */}
        <Card variant="surface" padding="md" style={styles.card}>
          <Heading level={3} color={colors.text}>
            Authenticated Profile
          </Heading>

          <View style={styles.infoRow}>
            <User size={18} color={colors.accent} style={{ marginRight: 10 }} />
            <View>
              <Text variant="captionBold" color={colors.textMuted}>
                Staff Name
              </Text>
              <Text variant="body" color={colors.text}>
                {user?.name}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Shield size={18} color={colors.accent} style={{ marginRight: 10 }} />
            <View>
              <Text variant="captionBold" color={colors.textMuted}>
                Assigned Role
              </Text>
              <Text variant="body" color={colors.text}>
                {user?.role?.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Security Controls */}
        <Card variant="surface" padding="md" style={styles.card}>
          <Heading level={3} color={colors.text}>
            Device Security
          </Heading>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Fingerprint size={20} color={colors.accent} style={{ marginRight: 8 }} />
                <Text variant="headline" color={colors.text}>
                  Biometric App Unlock
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                {isBiometricSupported
                  ? 'Require Face ID or Fingerprint to reopen the staff area when backgrounded.'
                  : 'Biometric hardware is not available on this device.'}
              </Text>
            </View>

            <Switch
              disabled={!isBiometricSupported}
              value={isBiometricEnabled}
              onValueChange={handleToggleBio}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Token and Session Policy */}
        <Card variant="muted" padding="md" style={styles.card}>
          <Heading level={3} color={colors.text}>
            Session Security Rules
          </Heading>
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 6, lineHeight: 18 }}>
            • Access tokens expire automatically after 15 minutes.
          </Text>
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2, lineHeight: 18 }}>
            • Refresh tokens rotate upon every renewal with reuse detection.
          </Text>
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2, lineHeight: 18 }}>
            • Tokens are held exclusively inside hardware backed SecureStore.
          </Text>
        </Card>

        {/* Sign Out Button */}
        <Button
          label="Sign Out of Staff Area"
          variant="danger"
          fullWidth
          onPress={handleSignOut}
          icon={<LogOut size={18} color="#FFFFFF" />}
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
  card: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

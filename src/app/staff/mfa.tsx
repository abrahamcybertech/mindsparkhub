import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/lib/auth';
import { KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react-native';

export default function StaffMfaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { mfaChallenge, completeMfa, cancelMfa } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setError(null);
    if (!code || code.trim().length < 6) {
      setError('Please enter the 6 digit code from your authenticator app');
      return;
    }

    setIsLoading(true);
    try {
      await completeMfa(code.trim());
      router.replace('/staff/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please check your authenticator.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    cancelMfa();
    router.replace('/staff/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Two Step Verification" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card variant="elevated" padding="lg" style={styles.card}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.isDark ? '#133560' : 'rgba(255, 193, 7, 0.15)' },
              ]}
            >
              <KeyRound size={32} color={colors.accent} />
            </View>

            <Heading level={2} color={colors.text} align="center" style={{ marginTop: 12 }}>
              Authenticator Code
            </Heading>

            <Text
              variant="body"
              color={colors.textMuted}
              align="center"
              style={{ marginTop: 6, marginBottom: 20, lineHeight: 21 }}
            >
              Open Google Authenticator, Microsoft Authenticator, or Aegis and enter your current 6 digit verification code.
            </Text>

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.errorBg, borderColor: colors.error },
                ]}
              >
                <ShieldAlert size={16} color={colors.error} style={{ marginRight: 6 }} />
                <Text variant="caption" color={colors.error} style={{ flex: 1 }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Input
              label="6 Digit Code or Single Use Backup Code"
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoFocus
              style={styles.codeInput}
              required
            />

            <Button
              label="Verify and Access Dashboard"
              variant="primary"
              fullWidth
              loading={isLoading}
              onPress={handleVerify}
              style={{ marginTop: 8 }}
            />

            <Button
              label="Back to Sign In"
              variant="ghost"
              fullWidth
              onPress={handleCancel}
              style={{ marginTop: 10 }}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 32,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeInput: {
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
});

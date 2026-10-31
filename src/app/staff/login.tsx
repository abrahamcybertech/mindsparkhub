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
import { StaffLoginSchema } from '@/lib/validation';
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react-native';

export default function StaffLoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const startLogin = useAuth((state) => state.startLogin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);

    const validation = StaffLoginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check your entries');
      return;
    }

    setIsLoading(true);
    try {
      const res = await startLogin(email, password);
      if (res.requiresMfa) {
        router.push('/staff/mfa');
      } else {
        router.replace('/staff/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Staff Authentication" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card variant="elevated" padding="lg" style={styles.loginCard}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.isDark ? '#133560' : 'rgba(13, 39, 72, 0.08)' },
              ]}
            >
              <Lock size={32} color={colors.accent} />
            </View>

            <Heading level={2} color={colors.text} align="center" style={{ marginTop: 12 }}>
              Staff Sign In
            </Heading>

            <Text
              variant="caption"
              color={colors.textMuted}
              align="center"
              style={{ marginTop: 4, marginBottom: 20 }}
            >
              Authorised institutional administrators and editors only
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
              label="Official Institutional Email"
              placeholder="admin@mindsparkhub.org"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <Input
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              required
            />

            <Button
              label="Proceed to Two Step Verification"
              variant="primary"
              fullWidth
              loading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: 8 }}
            />

            <View style={styles.footerNote}>
              <ShieldCheck size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text variant="caption" color={colors.textMuted}>
                Multi factor authentication is mandatory on all accounts
              </Text>
            </View>
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
  loginCard: {
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
});

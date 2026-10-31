import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/theme';
import { Text } from './Typography';
import { ShieldCheck } from 'lucide-react-native';

export function PrivacyShield() {
  const { isAuthenticated, lockSession } = useAuth();
  const { colors } = useTheme();
  const [isBackgrounded, setIsBackgrounded] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'background' || nextState === 'inactive') {
          setIsBackgrounded(true);
          if (isAuthenticated) {
            lockSession();
          }
        } else if (nextState === 'active') {
          setIsBackgrounded(false);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, lockSession]);

  if (!isBackgrounded || !isAuthenticated) {
    return null;
  }

  return (
    <View style={[styles.overlay, { backgroundColor: colors.headerBackground }]}>
      <ShieldCheck size={56} color="#FFC107" />
      <Text
        variant="headline"
        color="#FFFFFF"
        style={{ marginTop: 16 }}
      >
        MindSpark Hub Secure Session
      </Text>
      <Text
        variant="caption"
        color="rgba(255,255,255,0.7)"
        style={{ marginTop: 6 }}
      >
        Screen content hidden for security and privacy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});

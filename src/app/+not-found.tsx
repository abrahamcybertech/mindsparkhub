import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/StateViews';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Page Not Found" showBack />
      <EmptyState
        title="Screen Not Found"
        description="The screen you are looking for does not exist or has been relocated."
        actionLabel="Go to Home"
        onAction={() => router.replace('/(tabs)')}
        style={{ marginTop: 60 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

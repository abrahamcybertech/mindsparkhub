import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fraunces_700Bold,
  Fraunces_600SemiBold,
  Fraunces_400Regular,
} from '@expo-google-fonts/fraunces';
import {
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_500Medium,
  Inter_400Regular,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme';
import { useAuth } from '@/lib/auth';
import { PrivacyShield } from '@/components/PrivacyShield';

// Keep the splash screen visible while fonts and initial state load
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 2,
    },
  },
});

function RootNavigation() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="events/index" options={{ headerShown: false }} />
        <Stack.Screen name="events/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="about/index" options={{ headerShown: false }} />
        <Stack.Screen name="awards/index" options={{ headerShown: false }} />
        <Stack.Screen name="get-involved/index" options={{ headerShown: false }} />
        <Stack.Screen name="contact/index" options={{ headerShown: false }} />
        <Stack.Screen name="legal/[doc]" options={{ headerShown: false }} />
        <Stack.Screen name="legal/about-app" options={{ headerShown: false }} />
        <Stack.Screen name="staff/login" options={{ headerShown: false }} />
        <Stack.Screen name="staff/mfa" options={{ headerShown: false }} />
        <Stack.Screen name="staff/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="staff/awards" options={{ headerShown: false }} />
        <Stack.Screen name="staff/submissions" options={{ headerShown: false }} />
        <Stack.Screen name="staff/events" options={{ headerShown: false }} />
        <Stack.Screen name="staff/content" options={{ headerShown: false }} />
        <Stack.Screen name="staff/audit" options={{ headerShown: false }} />
        <Stack.Screen name="staff/settings" options={{ headerShown: false }} />
      </Stack>
      <PrivacyShield />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    Fraunces_600SemiBold,
    Fraunces_400Regular,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  const initializeAuth = useAuth((state) => state.initialize);

  useEffect(() => {
    async function prepare() {
      await initializeAuth();
      if (fontsLoaded) {
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, [fontsLoaded, initializeAuth]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootNavigation />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

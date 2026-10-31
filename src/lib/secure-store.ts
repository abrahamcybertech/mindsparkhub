import * as SecureStore from 'expo-secure-store';
import type { AuthTokens, MobileUser, Permission } from '@/types';

const ACCESS_TOKEN_KEY = 'org.mindsparkhub.access_token';
const REFRESH_TOKEN_KEY = 'org.mindsparkhub.refresh_token';
const ACCESS_EXPIRY_KEY = 'org.mindsparkhub.access_expiry';
const REFRESH_EXPIRY_KEY = 'org.mindsparkhub.refresh_expiry';
const USER_KEY = 'org.mindsparkhub.user_data';
const PERMISSIONS_KEY = 'org.mindsparkhub.permissions_data';
const BIOMETRIC_KEY = 'org.mindsparkhub.biometric_enabled';
const OFFLINE_DRAFT_KEY = 'org.mindsparkhub.offline_draft';

export async function saveAuthSession(
  tokens: AuthTokens,
  user: MobileUser,
  permissions: Permission[]
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    SecureStore.setItemAsync(ACCESS_EXPIRY_KEY, tokens.accessExpiresAt),
    SecureStore.setItemAsync(REFRESH_EXPIRY_KEY, tokens.refreshExpiresAt),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    SecureStore.setItemAsync(PERMISSIONS_KEY, JSON.stringify(permissions)),
  ]);
}

export async function loadAuthSession(): Promise<{
  tokens: AuthTokens;
  user: MobileUser;
  permissions: Permission[];
} | null> {
  try {
    const [accessToken, refreshToken, accessExpiresAt, refreshExpiresAt, userRaw, permsRaw] =
      await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(ACCESS_EXPIRY_KEY),
        SecureStore.getItemAsync(REFRESH_EXPIRY_KEY),
        SecureStore.getItemAsync(USER_KEY),
        SecureStore.getItemAsync(PERMISSIONS_KEY),
      ]);

    if (!accessToken || !refreshToken || !userRaw) {
      return null;
    }

    const user = JSON.parse(userRaw) as MobileUser;
    const permissions = permsRaw ? (JSON.parse(permsRaw) as Permission[]) : [];

    return {
      tokens: {
        accessToken,
        refreshToken,
        accessExpiresAt: accessExpiresAt || '',
        refreshExpiresAt: refreshExpiresAt || '',
      },
      user,
      permissions,
    };
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(ACCESS_EXPIRY_KEY),
    SecureStore.deleteItemAsync(REFRESH_EXPIRY_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
    SecureStore.deleteItemAsync(PERMISSIONS_KEY),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? 'true' : 'false');
}

export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const val = await SecureStore.getItemAsync(BIOMETRIC_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function saveOfflineDraft(data: unknown): Promise<void> {
  await SecureStore.setItemAsync(OFFLINE_DRAFT_KEY, JSON.stringify(data));
}

export async function loadOfflineDraft<T>(): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(OFFLINE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearOfflineDraft(): Promise<void> {
  await SecureStore.deleteItemAsync(OFFLINE_DRAFT_KEY);
}

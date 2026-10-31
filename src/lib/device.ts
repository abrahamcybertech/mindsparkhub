import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'org.mindsparkhub.device_id';

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing && existing.length >= 8) {
      cachedDeviceId = existing;
      return existing;
    }

    const newId = `${Platform.OS}-${Crypto.randomUUID()}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
    cachedDeviceId = newId;
    return newId;
  } catch {
    // Fallback if SecureStore is unavailable
    const fallback = `${Platform.OS}-ephemeral-${Date.now()}`;
    cachedDeviceId = fallback;
    return fallback;
  }
}

import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from './api';
import {
  clearAuthSession,
  isBiometricEnabled as checkBiometricStore,
  loadAuthSession,
  setBiometricEnabled as saveBiometricStore,
} from './secure-store';
import type { MobileUser, Permission } from '@/types';

interface AuthState {
  user: MobileUser | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  isBiometricSupported: boolean;
  isBiometricEnabled: boolean;
  mfaChallenge: {
    challenge: string;
    expiresInSeconds: number;
  } | null;

  initialize: () => Promise<void>;
  startLogin: (email: string, password: string) => Promise<{ requiresMfa: boolean }>;
  completeMfa: (code: string) => Promise<void>;
  cancelMfa: () => void;
  logout: () => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockSession: () => void;
  hasPermission: (permission: Permission) => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  isLocked: false,
  isBiometricSupported: false,
  isBiometricEnabled: false,
  mfaChallenge: null,

  async initialize() {
    try {
      const [hardware, enrolled, bioEnabled, session] = await Promise.all([
        LocalAuthentication.hasHardwareAsync().catch(() => false),
        LocalAuthentication.isEnrolledAsync().catch(() => false),
        checkBiometricStore(),
        loadAuthSession(),
      ]);

      const biometricSupported = hardware && enrolled;

      if (session) {
        // If biometrics is enabled, lock the session initially until user authenticates
        const shouldLock = biometricSupported && bioEnabled;
        set({
          user: session.user,
          permissions: session.permissions,
          isAuthenticated: true,
          isLoading: false,
          isLocked: shouldLock,
          isBiometricSupported: biometricSupported,
          isBiometricEnabled: bioEnabled,
        });
      } else {
        set({
          user: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
          isLocked: false,
          isBiometricSupported: biometricSupported,
          isBiometricEnabled: false,
        });
      }
    } catch {
      set({
        user: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        isLocked: false,
      });
    }
  },

  async startLogin(email: string, password: string) {
    set({ isLoading: true });
    try {
      const res = await api.login(email, password);
      if (res.requiresMfa) {
        set({
          mfaChallenge: {
            challenge: res.challenge,
            expiresInSeconds: res.expiresInSeconds,
          },
          isLoading: false,
        });
        return { requiresMfa: true };
      }
      set({ isLoading: false });
      return { requiresMfa: false };
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  async completeMfa(code: string) {
    const { mfaChallenge } = get();
    if (!mfaChallenge) {
      throw new Error('No active verification challenge. Please sign in again.');
    }

    set({ isLoading: true });
    try {
      const data = await api.verifyMfa(mfaChallenge.challenge, code);
      set({
        user: data.user,
        permissions: data.permissions,
        isAuthenticated: true,
        isLoading: false,
        isLocked: false,
        mfaChallenge: null,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  cancelMfa() {
    set({ mfaChallenge: null });
  },

  async logout() {
    set({ isLoading: true });
    try {
      await api.logout();
    } finally {
      await clearAuthSession();
      set({
        user: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        isLocked: false,
        mfaChallenge: null,
      });
    }
  },

  async toggleBiometrics(enabled: boolean) {
    await saveBiometricStore(enabled);
    set({ isBiometricEnabled: enabled });
  },

  async unlockWithBiometrics() {
    const { isBiometricSupported, isBiometricEnabled } = get();
    if (!isBiometricSupported || !isBiometricEnabled) {
      set({ isLocked: false });
      return true;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock MindSpark Hub Staff Portal',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        set({ isLocked: false });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  lockSession() {
    const { isAuthenticated, isBiometricEnabled } = get();
    if (isAuthenticated && isBiometricEnabled) {
      set({ isLocked: true });
    }
  },

  hasPermission(permission: Permission) {
    const { permissions } = get();
    return permissions.includes(permission);
  },
}));

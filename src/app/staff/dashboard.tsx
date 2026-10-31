import React, { useEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Award,
  CalendarCheck,
  CheckCircle,
  ChevronRight,
  FileText,
  Fingerprint,
  Inbox,
  Lock,
  LogOut,
  Settings,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';

export default function StaffDashboardScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { user, isAuthenticated, isLocked, unlockWithBiometrics, logout, hasPermission } =
    useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/staff/login');
    }
  }, [isAuthenticated, router]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => api.getAdminSummary(),
    enabled: isAuthenticated && !isLocked,
  });

  if (isLocked) {
    return (
      <View style={[styles.lockedContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.lockCircle,
            { backgroundColor: colors.isDark ? '#133560' : 'rgba(255, 193, 7, 0.15)' },
          ]}
        >
          <Fingerprint size={48} color={colors.accent} />
        </View>

        <Heading level={2} color={colors.text} align="center" style={{ marginTop: 16 }}>
          Session Locked
        </Heading>

        <Text
          variant="body"
          color={colors.textMuted}
          align="center"
          style={{ marginTop: 6, marginBottom: 24 }}
        >
          Unlock with biometrics to continue working in the staff area.
        </Text>

        <Button
          label="Unlock with Biometrics"
          variant="primary"
          onPress={() => unlockWithBiometrics()}
          style={{ minWidth: 220 }}
        />

        <Button
          label="Sign Out"
          variant="ghost"
          onPress={async () => {
            await logout();
            router.replace('/(tabs)');
          }}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Staff Portal"
        subtitle={user?.role?.replace('_', ' ')}
        showBack
        rightAction={
          <Pressable
            onPress={() => router.push('/staff/settings')}
            accessibilityRole="button"
            accessibilityLabel="Staff settings"
            style={styles.settingsBtn}
          >
            <Settings size={20} color="#FFFFFF" />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* User Card */}
        <Card variant="elevated" padding="md" style={styles.userCard}>
          <View style={styles.userRow}>
            <View
              style={[
                styles.userAvatar,
                { backgroundColor: colors.isDark ? '#133560' : '#0D2748' },
              ]}
            >
              <UserCheck size={22} color="#FFC107" />
            </View>
            <View style={{ flex: 1 }}>
              <Heading level={3} color={colors.text}>
                {user?.name}
              </Heading>
              <Text variant="caption" color={colors.textMuted}>
                {user?.email}
              </Text>
            </View>
            <Badge label={user?.role || 'STAFF'} variant="gold" size="sm" />
          </View>
        </Card>

        {isLoading ? (
          <View style={{ padding: spacing.md }}>
            <SkeletonLoader height={100} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={140} borderRadius={12} style={{ marginBottom: 12 }} />
          </View>
        ) : isError ? (
          <ErrorView
            title="Failed to load dashboard metrics"
            message="Please check your connection."
            onRetry={refetch}
          />
        ) : (
          <>
            {/* Summary Metrics Grid */}
            <View style={styles.metricsGrid}>
              <Card variant="surface" padding="sm" style={styles.metricCard}>
                <Inbox size={20} color={colors.accent} />
                <Heading level={1} color={colors.text} style={{ marginTop: 6 }}>
                  {data?.counts?.inquiries ?? 0}
                </Heading>
                <Text variant="caption" color={colors.textMuted}>
                  Inquiries / Forms
                </Text>
              </Card>

              <Card variant="surface" padding="sm" style={styles.metricCard}>
                <CalendarCheck size={20} color={colors.accent} />
                <Heading level={1} color={colors.text} style={{ marginTop: 6 }}>
                  {data?.counts?.eventsPending ?? 0}
                </Heading>
                <Text variant="caption" color={colors.textMuted}>
                  Events Pending
                </Text>
              </Card>

              <Card variant="surface" padding="sm" style={styles.metricCard}>
                <FileText size={20} color={colors.accent} />
                <Heading level={1} color={colors.text} style={{ marginTop: 6 }}>
                  {data?.counts?.articles ?? 0}
                </Heading>
                <Text variant="caption" color={colors.textMuted}>
                  Articles
                </Text>
              </Card>
            </View>

            {/* Operational Modules */}
            <View style={styles.section}>
              <Eyebrow color={colors.accent}>Operational Management</Eyebrow>

              <Card
                variant="surface"
                padding="md"
                style={styles.actionCard}
                onPress={() => router.push('/staff/submissions')}
              >
                <View style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                    ]}
                  >
                    <Inbox size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Heading level={3} color={colors.text}>
                      Inquiries and Applications
                    </Heading>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      Review volunteer, mentor, partner, and outreach forms
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </Card>

              <Card
                variant="surface"
                padding="md"
                style={styles.actionCard}
                onPress={() => router.push('/staff/events')}
              >
                <View style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                    ]}
                  >
                    <CalendarCheck size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Heading level={3} color={colors.text}>
                      Event Approvals
                    </Heading>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      Approve or decline submitted outreach dates and venues
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </Card>

              <Card
                variant="surface"
                padding="md"
                style={styles.actionCard}
                onPress={() => router.push('/staff/content')}
              >
                <View style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                    ]}
                  >
                    <FileText size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Heading level={3} color={colors.text}>
                      Content and Gallery Publishing
                    </Heading>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      Toggle publication status for articles and photographs
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </Card>

              <Card
                variant="surface"
                padding="md"
                style={styles.actionCard}
                onPress={() => router.push('/staff/awards')}
              >
                <View style={styles.actionRow}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                    ]}
                  >
                    <Award size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Heading level={3} color={colors.text}>
                      Honors and Awards
                    </Heading>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      Add or delete recognized honorees, mentors, and partner citations
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </Card>

              {isSuperAdmin ? (
                <Card
                  variant="surface"
                  padding="md"
                  style={styles.actionCard}
                  onPress={() => router.push('/staff/audit')}
                >
                  <View style={styles.actionRow}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                      ]}
                    >
                      <ShieldCheck size={20} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Heading level={3} color={colors.text}>
                        Security and Audit Trail
                      </Heading>
                      <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                        Append only cryptographic log trail (Super Admin only)
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </View>
                </Card>
              ) : null}
            </View>

            {/* Quick Sign Out */}
            <Button
              label="Sign Out"
              variant="outline"
              fullWidth
              onPress={async () => {
                await logout();
                router.replace('/(tabs)');
              }}
              icon={<LogOut size={16} color={colors.isDark ? colors.accent : colors.primary} />}
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
  },
  section: {
    gap: 10,
  },
  actionCard: {
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});

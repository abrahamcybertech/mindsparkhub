import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react-native';

export default function StaffAuditScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => api.getAdminAudit(50),
    enabled: isSuperAdmin,
  });

  if (!isSuperAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Audit Log" showBack />
        <EmptyState
          title="Access Restricted"
          description="The cryptographic security audit trail is reserved strictly for Super Administrators."
          style={{ marginTop: 60 }}
        />
      </View>
    );
  }

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS':
        return <Badge label="Success" variant="success" size="sm" />;
      case 'FAILURE':
        return <Badge label="Failed" variant="danger" size="sm" />;
      case 'DENIED':
        return <Badge label="Denied" variant="warning" size="sm" />;
      default:
        return <Badge label={outcome} variant="neutral" size="sm" />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Security Audit Trail" subtitle="Append Only Verification" showBack />

      {isLoading ? (
        <View style={{ padding: spacing.md }}>
          <SkeletonLoader height={90} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={90} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={90} borderRadius={12} />
        </View>
      ) : isError ? (
        <ErrorView onRetry={refetch} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={data?.auditLogs || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => { refetch(); }}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListHeaderComponent={
            <Card variant="muted" padding="sm" style={styles.banner}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldCheck size={18} color={colors.accent} style={{ marginRight: 8 }} />
                <Text variant="captionBold" color={colors.text}>
                  Cryptographic Chain Integrity
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                Entries are hashed with SHA256 and linked sequentially to prevent record tampering.
              </Text>
            </Card>
          }
          ListEmptyComponent={
            <EmptyState
              title="No audit entries"
              description="No audit events have been logged yet."
              style={{ marginTop: 40 }}
            />
          }
          renderItem={({ item }) => (
            <Card variant="surface" padding="md" style={styles.card}>
              <View style={styles.cardHeader}>
                <Text variant="captionBold" color={colors.accent}>
                  {item.action}
                </Text>
                {getOutcomeBadge(item.outcome)}
              </View>

              <Text variant="body" color={colors.text} style={{ marginTop: 6 }}>
                {item.details || 'No details provided'}
              </Text>

              <View style={styles.cardFooter}>
                <Text variant="caption" color={colors.textMuted}>
                  Actor: {item.actorRole}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  {new Date(item.createdAt).toLocaleString('en-GB')}
                </Text>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    marginBottom: 14,
  },
  card: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});

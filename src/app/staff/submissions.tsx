import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import type { SubmissionRecord } from '@/types';
import { Calendar, ChevronRight, Mail, Phone, User, X } from 'lucide-react-native';

const STATUS_FILTERS = ['ALL', 'NEW', 'IN_REVIEW', 'RESPONDED', 'ARCHIVED'];

export default function StaffSubmissionsScreen() {
  const { colors, spacing } = useTheme();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<SubmissionRecord | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-submissions', selectedStatus],
    queryFn: () =>
      api.getAdminSubmissions(selectedStatus === 'ALL' ? undefined : selectedStatus),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SubmissionRecord['status'] }) =>
      api.updateSubmissionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      setSelectedRecord(null);
      Alert.alert('Status Updated', 'Submission status updated successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Update Failed', err.message || 'Could not update submission status.');
    },
  });

  const getStatusBadge = (status: SubmissionRecord['status']) => {
    switch (status) {
      case 'NEW':
        return <Badge label="New" variant="gold" size="sm" />;
      case 'IN_REVIEW':
        return <Badge label="In Review" variant="info" size="sm" />;
      case 'RESPONDED':
        return <Badge label="Responded" variant="success" size="sm" />;
      case 'ARCHIVED':
        return <Badge label="Archived" variant="neutral" size="sm" />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Submissions" subtitle="Inquiries & Applications" showBack />

      {/* Status filter bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((st) => {
            const isActive = selectedStatus === st;
            return (
              <Pressable
                key={st}
                onPress={() => setSelectedStatus(st)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.accent : colors.surface,
                    borderColor: isActive ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  variant="captionBold"
                  color={isActive ? colors.accentContrast : colors.text}
                >
                  {st.replace('_', ' ')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.md }}>
          <SkeletonLoader height={100} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={100} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={100} borderRadius={12} />
        </View>
      ) : isError ? (
        <ErrorView onRetry={refetch} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={data?.submissions || []}
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
          ListEmptyComponent={
            <EmptyState
              title="No submissions found"
              description="There are no entries under this status category."
              style={{ marginTop: 40 }}
            />
          }
          renderItem={({ item }) => (
            <Card
              variant="surface"
              padding="md"
              style={styles.card}
              onPress={() => setSelectedRecord(item)}
            >
              <View style={styles.cardHeader}>
                <Text variant="captionBold" color={colors.accent}>
                  {item.referenceCode}
                </Text>
                {getStatusBadge(item.status)}
              </View>

              <Heading level={3} color={colors.text} style={{ marginTop: 6 }}>
                {item.fullName}
              </Heading>

              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                Type: {item.type.replace(/_/g, ' ')}
              </Text>

              <Text
                variant="body"
                color={colors.text}
                numberOfLines={2}
                style={{ marginTop: 6 }}
              >
                {item.message}
              </Text>

              <View style={styles.cardFooter}>
                <Text variant="caption" color={colors.textMuted}>
                  {new Date(item.createdAt).toLocaleDateString('en-GB')}
                </Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            </Card>
          )}
        />
      )}

      {/* Submission Detail & Action Modal */}
      <Modal
        visible={Boolean(selectedRecord)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRecord(null)}
      >
        <View style={styles.modalBackdrop}>
          <Card variant="elevated" padding="lg" style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="captionBold" color={colors.accent}>
                  {selectedRecord?.referenceCode}
                </Text>
                <Heading level={2} color={colors.text} style={{ marginTop: 2 }}>
                  {selectedRecord?.fullName}
                </Heading>
              </View>
              <Pressable
                onPress={() => setSelectedRecord(null)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 380, marginVertical: 12 }}>
              <View style={styles.infoLine}>
                <Mail size={16} color={colors.accent} style={{ marginRight: 8 }} />
                <Text variant="body" color={colors.text}>
                  {selectedRecord?.email}
                </Text>
              </View>

              {selectedRecord?.phone ? (
                <View style={styles.infoLine}>
                  <Phone size={16} color={colors.accent} style={{ marginRight: 8 }} />
                  <Text variant="body" color={colors.text}>
                    {selectedRecord.phone}
                  </Text>
                </View>
              ) : null}

              {selectedRecord?.organization ? (
                <Text variant="caption" color={colors.textMuted} style={{ marginTop: 6 }}>
                  Organisation: {selectedRecord.organization}
                </Text>
              ) : null}

              <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

              <Text variant="captionBold" color={colors.textMuted}>
                Message:
              </Text>
              <Text variant="body" color={colors.text} style={{ marginTop: 6, lineHeight: 22 }}>
                {selectedRecord?.message}
              </Text>
            </ScrollView>

            <View style={styles.statusActionGroup}>
              <Text variant="captionBold" color={colors.textMuted} style={{ marginBottom: 8 }}>
                Change Processing Status:
              </Text>
              <View style={styles.btnRow}>
                <Button
                  label="In Review"
                  variant="outline"
                  size="sm"
                  loading={updateMutation.isPending}
                  onPress={() =>
                    selectedRecord &&
                    updateMutation.mutate({ id: selectedRecord.id, status: 'IN_REVIEW' })
                  }
                  style={{ flex: 1, marginRight: 4 }}
                />
                <Button
                  label="Responded"
                  variant="primary"
                  size="sm"
                  loading={updateMutation.isPending}
                  onPress={() =>
                    selectedRecord &&
                    updateMutation.mutate({ id: selectedRecord.id, status: 'RESPONDED' })
                  }
                  style={{ flex: 1, marginHorizontal: 4 }}
                />
                <Button
                  label="Archive"
                  variant="secondary"
                  size="sm"
                  loading={updateMutation.isPending}
                  onPress={() =>
                    selectedRecord &&
                    updateMutation.mutate({ id: selectedRecord.id, status: 'ARCHIVED' })
                  }
                  style={{ flex: 1, marginLeft: 4 }}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
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
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeBtn: {
    padding: 6,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  modalDivider: {
    height: 1,
    marginVertical: 12,
  },
  statusActionGroup: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  btnRow: {
    flexDirection: 'row',
  },
});

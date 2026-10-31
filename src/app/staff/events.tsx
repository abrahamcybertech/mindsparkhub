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
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { EventItem } from '@/types';
import { Calendar, CheckCircle2, Clock, MapPin, X, XCircle } from 'lucide-react-native';

const STATUSES = ['ALL', 'PENDING_APPROVAL', 'APPROVED', 'DRAFT', 'CANCELLED'];

export default function StaffEventsScreen() {
  const { colors, spacing } = useTheme();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const canApprove = hasPermission('events:approve');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-events', selectedStatus],
    queryFn: () =>
      api.getAdminEvents(selectedStatus === 'ALL' ? undefined : selectedStatus),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventItem['status'] }) =>
      api.updateEventStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      setSelectedEvent(null);
      Alert.alert('Status Updated', 'Event status has been updated.');
    },
    onError: (err: any) => {
      Alert.alert('Update Failed', err.message || 'Could not update event status.');
    },
  });

  const getStatusBadge = (status: EventItem['status']) => {
    switch (status) {
      case 'APPROVED':
        return <Badge label="Approved" variant="success" size="sm" />;
      case 'PENDING_APPROVAL':
        return <Badge label="Pending Review" variant="warning" size="sm" />;
      case 'DRAFT':
        return <Badge label="Draft" variant="neutral" size="sm" />;
      case 'CANCELLED':
        return <Badge label="Declined" variant="danger" size="sm" />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Event Approvals" subtitle="Operational Review" showBack />

      {/* Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUSES.map((st) => {
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
          <SkeletonLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={120} borderRadius={12} />
        </View>
      ) : isError ? (
        <ErrorView onRetry={refetch} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={data?.events || []}
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
              title="No events under this status"
              description="There are currently no events matching this filter."
              style={{ marginTop: 40 }}
            />
          }
          renderItem={({ item }) => (
            <Card
              variant="surface"
              padding="md"
              style={styles.card}
              onPress={() => setSelectedEvent(item)}
            >
              <View style={styles.cardHeader}>
                <Badge
                  label={item.programmeTitle || 'MindSpark Event'}
                  variant="gold"
                  size="sm"
                />
                {getStatusBadge(item.status)}
              </View>

              <Heading level={2} color={colors.text} style={{ marginTop: 8 }}>
                {item.title}
              </Heading>

              <View style={styles.metaRow}>
                <Calendar size={14} color={colors.accent} style={{ marginRight: 6 }} />
                <Text variant="caption" color={colors.text}>
                  {new Date(item.startDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <MapPin size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text variant="caption" color={colors.textMuted}>
                  {item.venue}, {item.city}
                </Text>
              </View>
            </Card>
          )}
        />
      )}

      {/* Review Modal */}
      <Modal
        visible={Boolean(selectedEvent)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalBackdrop}>
          <Card variant="elevated" padding="lg" style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Badge
                  label={selectedEvent?.programmeTitle || 'Event'}
                  variant="gold"
                  size="sm"
                />
                <Heading level={2} color={colors.text} style={{ marginTop: 4 }}>
                  {selectedEvent?.title}
                </Heading>
              </View>
              <Pressable
                onPress={() => setSelectedEvent(null)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
              <Text variant="body" color={colors.text} style={{ lineHeight: 22 }}>
                {selectedEvent?.description || 'No detailed description provided.'}
              </Text>
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 8 }}>
                Venue: {selectedEvent?.venue}, {selectedEvent?.city}, {selectedEvent?.state}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Date: {selectedEvent?.startDate}
              </Text>
            </ScrollView>

            {canApprove ? (
              <View style={styles.actionRow}>
                <Button
                  label="Decline"
                  variant="danger"
                  loading={updateMutation.isPending}
                  onPress={() =>
                    selectedEvent &&
                    updateMutation.mutate({ id: selectedEvent.id, status: 'CANCELLED' })
                  }
                  style={{ flex: 1, marginRight: 6 }}
                />
                <Button
                  label="Approve & Publish"
                  variant="primary"
                  loading={updateMutation.isPending}
                  onPress={() =>
                    selectedEvent &&
                    updateMutation.mutate({ id: selectedEvent.id, status: 'APPROVED' })
                  }
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>
            ) : (
              <Text variant="caption" color={colors.textMuted} align="center">
                Your role does not include event approval permissions.
              </Text>
            )}
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeBtn: {
    padding: 6,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

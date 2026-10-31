import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import { Calendar, ChevronRight, Clock, MapPin } from 'lucide-react-native';

export default function EventsListScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.getEvents(),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Events and Schedule" subtitle="Confirmed Sessions" showBack />

      {isLoading ? (
        <View style={{ padding: spacing.md }}>
          <SkeletonLoader height={140} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={140} borderRadius={12} style={{ marginBottom: 12 }} />
        </View>
      ) : isError ? (
        <ErrorView onRetry={refetch} style={{ marginTop: 40 }} />
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
          ListHeaderComponent={
            <View style={styles.headerNotice}>
              <Text variant="body" color={colors.textMuted}>
                Every event listed below is approved by MindSpark Hub leadership. Dates and venues are confirmed.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="No upcoming confirmed events"
              description="New outreach dates and campus schedules will appear here once officially confirmed by administrators."
              style={{ marginTop: 40 }}
            />
          }
          renderItem={({ item }) => (
            <Card
              variant="surface"
              padding="md"
              style={styles.eventCard}
              onPress={() => router.push(`/events/${item.id}` as any)}
            >
              <View style={styles.cardTop}>
                <Badge
                  label={item.programmeTitle || 'MindSpark Event'}
                  variant="gold"
                  size="sm"
                />
                <Badge label="Confirmed" variant="success" size="sm" />
              </View>

              <Heading level={2} color={colors.text} style={styles.eventTitle}>
                {item.title}
              </Heading>

              {item.tagline ? (
                <Text variant="subhead" color={colors.accent} style={{ marginTop: 2 }}>
                  {item.tagline}
                </Text>
              ) : null}

              <View style={styles.infoRow}>
                <Calendar size={16} color={colors.accent} style={{ marginRight: 6 }} />
                <Text variant="body" color={colors.text}>
                  {new Date(item.startDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text variant="caption" color={colors.textMuted}>
                  {item.venue}, {item.city}, {item.state}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text variant="button" color={colors.isDark ? colors.accent : colors.primary}>
                  View Details and Reminders
                </Text>
                <ChevronRight size={18} color={colors.isDark ? colors.accent : colors.primary} />
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
  headerNotice: {
    marginBottom: 16,
  },
  eventCard: {
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    marginTop: 4,
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});

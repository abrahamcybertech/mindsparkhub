import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import { addEventToCalendar } from '@/lib/calendar';
import { scheduleEventReminder } from '@/lib/notifications';
import {
  Bell,
  Calendar,
  CalendarPlus,
  CheckCircle,
  Clock,
  Layers,
  MapPin,
  Share2,
} from 'lucide-react-native';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const [calendarLoading, setCalendarLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.getEvents(),
  });

  const event = data?.events?.find((e) => e.id === id);

  const handleAddToCalendar = async () => {
    if (!event) return;
    setCalendarLoading(true);
    const result = await addEventToCalendar(event);
    setCalendarLoading(false);
    Alert.alert(result.success ? 'Calendar Updated' : 'Calendar Notice', result.message);
  };

  const handleScheduleReminder = async () => {
    if (!event) return;
    setReminderLoading(true);
    const result = await scheduleEventReminder(event);
    setReminderLoading(false);
    Alert.alert(result.success ? 'Reminder Set' : 'Reminder Notice', result.message);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Event Details" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={{ padding: spacing.md }}>
            <SkeletonLoader height={180} borderRadius={12} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={140} borderRadius={12} />
          </View>
        ) : isError || !event ? (
          <ErrorView
            title="Event Not Found"
            message="This event could not be found or may have been modified by administrators."
            onRetry={refetch}
          />
        ) : (
          <>
            <Card variant="elevated" padding="lg" style={styles.heroCard}>
              <View style={styles.badgeRow}>
                <Badge
                  label={event.programmeTitle || 'MindSpark Event'}
                  variant="gold"
                  size="sm"
                />
                <Badge label="Confirmed" variant="success" size="sm" />
              </View>

              <Heading level={1} color={colors.text} style={styles.title}>
                {event.title}
              </Heading>

              {event.tagline ? (
                <Text variant="subhead" color={colors.accent} style={{ marginTop: 4 }}>
                  {event.tagline}
                </Text>
              ) : null}

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.detailRow}>
                <Calendar size={18} color={colors.accent} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text variant="captionBold" color={colors.textMuted}>
                    Date
                  </Text>
                  <Text variant="body" color={colors.text}>
                    {new Date(event.startDate).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Clock size={18} color={colors.accent} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text variant="captionBold" color={colors.textMuted}>
                    Time
                  </Text>
                  <Text variant="body" color={colors.text}>
                    {new Date(event.startDate).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <MapPin size={18} color={colors.accent} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text variant="captionBold" color={colors.textMuted}>
                    Venue and Location
                  </Text>
                  <Text variant="body" color={colors.text}>
                    {event.venue}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    {event.city}, {event.state}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Quick Actions Card */}
            <Card variant="surface" padding="md" style={styles.actionCard}>
              <Heading level={3} color={colors.text} style={{ marginBottom: 12 }}>
                Add to Schedule
              </Heading>

              <View style={styles.btnRow}>
                <Button
                  label="Add to Calendar"
                  variant="primary"
                  loading={calendarLoading}
                  onPress={handleAddToCalendar}
                  icon={<CalendarPlus size={18} color={colors.accentContrast} />}
                  style={{ flex: 1, marginRight: 6 }}
                />
                <Button
                  label="Set Reminder"
                  variant="secondary"
                  loading={reminderLoading}
                  onPress={handleScheduleReminder}
                  icon={<Bell size={18} color="#FFFFFF" />}
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>
            </Card>

            {/* Description Card */}
            {event.description ? (
              <Card variant="surface" padding="md" style={styles.sectionCard}>
                <Heading level={3} color={colors.text}>
                  Session Overview
                </Heading>
                <Text
                  variant="body"
                  color={colors.text}
                  style={{ marginTop: 8, lineHeight: 22 }}
                >
                  {event.description}
                </Text>
              </Card>
            ) : null}

            {/* Link to programme */}
            {event.programmeSlug ? (
              <Button
                label="Explore Programme Details"
                variant="outline"
                fullWidth
                onPress={() => router.push(`/(tabs)/programmes/${event.programmeSlug}` as any)}
                icon={<Layers size={18} color={colors.isDark ? colors.accent : colors.primary} />}
                style={{ marginTop: 8 }}
              />
            ) : null}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    marginTop: 4,
    lineHeight: 32,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  actionCard: {
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
  },
  sectionCard: {
    marginBottom: 16,
  },
});

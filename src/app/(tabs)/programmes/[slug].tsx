import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SafeImage } from '@/components/SafeImage';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
} from 'lucide-react-native';

export default function ProgrammeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['programme', slug],
    queryFn: () => api.getProgramme(slug || ''),
    enabled: Boolean(slug),
  });

  const prog = data?.programme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={prog?.title || 'Programme Details'}
        showBack
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
        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <SkeletonLoader height={140} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={200} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={140} borderRadius={16} />
          </View>
        ) : isError || !prog ? (
          <ErrorView
            title="Programme Not Found"
            message="We could not find the details for this programme."
            onRetry={refetch}
          />
        ) : (
          <>
            {/* Header Hero Card */}
            <Card variant="elevated" padding="lg" style={styles.heroCard}>
              <Eyebrow color={colors.accent}>Impact Vehicle</Eyebrow>
              <Heading level={1} color={colors.text} style={{ marginTop: 4 }}>
                {prog.title}
              </Heading>
              <Text
                variant="title3"
                color={colors.accent}
                style={{ marginTop: 6 }}
              >
                {prog.tagline}
              </Text>

              {prog.audience ? (
                <View style={styles.audienceBox}>
                  <Text variant="captionBold" color={colors.textMuted}>
                    Target Audience: {prog.audience}
                  </Text>
                </View>
              ) : null}
            </Card>

            {/* Introduction / Description */}
            {prog.description ? (
              <Card variant="surface" padding="md" style={styles.sectionCard}>
                <Heading level={3} color={colors.text}>
                  About This Programme
                </Heading>
                <Text
                  variant="body"
                  color={colors.text}
                  style={{ marginTop: 8, lineHeight: 22 }}
                >
                  {prog.description}
                </Text>
              </Card>
            ) : null}

            {/* Core Objectives */}
            {prog.objectives && prog.objectives.length > 0 ? (
              <Card variant="surface" padding="md" style={styles.sectionCard}>
                <Heading level={3} color={colors.text}>
                  Core Objectives
                </Heading>
                <View style={styles.bulletList}>
                  {prog.objectives.map((obj, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <CheckCircle2
                        size={18}
                        color={colors.accent}
                        style={{ marginTop: 2, marginRight: 10 }}
                      />
                      <Text
                        variant="body"
                        color={colors.text}
                        style={{ flex: 1, lineHeight: 21 }}
                      >
                        {obj}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}

            {/* Session Structure */}
            {prog.structure && prog.structure.length > 0 ? (
              <Card variant="surface" padding="md" style={styles.sectionCard}>
                <Heading level={3} color={colors.text}>
                  Programme Structure
                </Heading>
                <View style={styles.structureList}>
                  {prog.structure.map((item, i) => (
                    <View
                      key={i}
                      style={[
                        styles.structureItem,
                        { borderColor: colors.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.structureNumber,
                          { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                        ]}
                      >
                        <Text variant="captionBold" color={colors.accent}>
                          {i + 1}
                        </Text>
                      </View>
                      <Text
                        variant="body"
                        color={colors.text}
                        style={{ flex: 1 }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}

            {/* Schedule Summary */}
            {prog.scheduleSummary ? (
              <Card variant="muted" padding="md" style={styles.sectionCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={20} color={colors.accent} style={{ marginRight: 8 }} />
                  <Heading level={3} color={colors.text}>
                    Operating Schedule
                  </Heading>
                </View>
                <Text
                  variant="body"
                  color={colors.text}
                  style={{ marginTop: 8 }}
                >
                  {prog.scheduleSummary}
                </Text>
              </Card>
            ) : null}

            {/* Related Confirmed Events */}
            {data?.relatedEvents && data.relatedEvents.length > 0 ? (
              <View style={styles.relatedSection}>
                <Heading level={3} color={colors.text} style={{ marginBottom: 12 }}>
                  Confirmed Events
                </Heading>
                {data.relatedEvents.map((evt) => (
                  <Card
                    key={evt.id}
                    variant="surface"
                    padding="md"
                    style={styles.eventCard}
                    onPress={() => router.push(`/events/${evt.id}` as any)}
                  >
                    <Heading level={3} color={colors.text}>
                      {evt.title}
                    </Heading>
                    <View style={styles.eventMeta}>
                      <MapPin size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text variant="caption" color={colors.textMuted}>
                        {evt.venue}, {evt.city}
                      </Text>
                    </View>
                    <View style={styles.eventMeta}>
                      <Calendar size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text variant="caption" color={colors.accent}>
                        {new Date(evt.startDate).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}

            {/* Call to action */}
            <View style={styles.ctaBox}>
              <Button
                label="Participate or Partner"
                variant="primary"
                fullWidth
                onPress={() => router.push('/get-involved')}
              />
            </View>
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
    borderLeftColor: '#FFC107',
  },
  audienceBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  sectionCard: {
    marginBottom: 16,
  },
  bulletList: {
    marginTop: 10,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  structureList: {
    marginTop: 10,
    gap: 8,
  },
  structureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  structureNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  relatedSection: {
    marginBottom: 16,
  },
  eventCard: {
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ctaBox: {
    marginTop: 16,
    marginBottom: 20,
  },
});

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import { ChevronRight, GraduationCap, School, Users } from 'lucide-react-native';

const PROGRAMME_ICONS: Record<string, any> = {
  ssi: School,
  cs: GraduationCap,
  ce: Users,
};

export default function ProgrammesScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['programmes'],
    queryFn: () => api.getProgrammes(),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Our Programmes" subtitle="Three Impact Vehicles" />

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
        <View style={styles.introBox}>
          <Text variant="body" color={colors.textMuted}>
            MindSpark Hub operates three targeted impact programmes designed to reach Nigerians across vital stages of education, leadership, and adult civic life.
          </Text>
        </View>

        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <SkeletonLoader height={140} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={140} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={140} borderRadius={16} />
          </View>
        ) : isError ? (
          <ErrorView onRetry={refetch} style={{ marginTop: 32 }} />
        ) : (
          <View style={styles.list}>
            {data?.programmes?.map((prog) => {
              const Icon = PROGRAMME_ICONS[prog.slug] || School;
              return (
                <Card
                  key={prog.slug}
                  variant="surface"
                  padding="lg"
                  style={styles.card}
                  onPress={() => router.push(`/(tabs)/programmes/${prog.slug}` as any)}
                >
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                      ]}
                    >
                      <Icon size={24} color={colors.accent} />
                    </View>
                    <Badge
                      label={prog.slug.toUpperCase()}
                      variant="gold"
                      size="sm"
                    />
                  </View>

                  <Heading level={2} color={colors.text} style={{ marginTop: 12 }}>
                    {prog.title}
                  </Heading>

                  <Text
                    variant="headline"
                    color={colors.accent}
                    style={{ marginTop: 4 }}
                  >
                    {prog.tagline}
                  </Text>

                  {prog.audience ? (
                    <Text
                      variant="caption"
                      color={colors.textMuted}
                      style={{ marginTop: 8 }}
                    >
                      Focus: {prog.audience}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text variant="button" color={colors.isDark ? colors.accent : colors.primary}>
                      View Programme Structure
                    </Text>
                    <ChevronRight size={18} color={colors.isDark ? colors.accent : colors.primary} />
                  </View>
                </Card>
              );
            })}
          </View>
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
  introBox: {
    marginBottom: 16,
  },
  list: {
    gap: 16,
  },
  card: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});

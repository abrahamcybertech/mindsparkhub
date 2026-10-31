import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { SafeImage } from '@/components/SafeImage';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import type { AwardItem } from '@/types';
import { Award, Calendar, CheckCircle2 } from 'lucide-react-native';

export default function AwardsScreen() {
  const { colors, spacing, radii } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['awards', selectedCategory],
    queryFn: () => api.getAwards({ category: selectedCategory }),
  });

  const categories = ['ALL', ...(data?.categories || [])];
  const awards = data?.awards || [];

  const renderAwardCard = ({ item }: { item: AwardItem }) => (
    <Card variant="elevated" padding="lg" style={styles.awardCard}>
      {/* Badges Row */}
      <View style={styles.badgeRow}>
        <Badge label={item.category} variant="gold" size="sm" />
        <View style={[styles.yearBadge, { backgroundColor: colors.surfaceMuted }]}>
          <Calendar size={12} color={colors.accent} style={{ marginRight: 4 }} />
          <Text variant="captionBold" color={colors.text}>
            {String(item.year)}
          </Text>
        </View>
      </View>

      {/* Recipient Profile */}
      <View style={styles.profileRow}>
        <SafeImage
          source={item.imageUrl}
          altText={item.recipientName}
          style={[styles.avatar, { width: 64, height: 64, borderRadius: 32 }]}
        />
        <View style={styles.profileText}>
          <Heading level={3} color={colors.text} numberOfLines={2}>
            {item.recipientName}
          </Heading>
          <Text variant="subhead" color={colors.accent} style={{ marginTop: 2 }}>
            {item.awardTitle}
          </Text>
        </View>
      </View>

      {/* Citation Box */}
      <View
        style={[
          styles.citationBox,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
          },
        ]}
      >
        <Text variant="captionBold" color={colors.accent} style={{ marginBottom: 4 }}>
          Official Citation
        </Text>
        <Text variant="body" color={colors.text} style={styles.citationText}>
          "{item.citation}"
        </Text>
      </View>

      {/* Footer Verified Stamp */}
      <View style={styles.cardFooter}>
        <View style={styles.verifiedRow}>
          <CheckCircle2 size={13} color={colors.accent} style={{ marginRight: 4 }} />
          <Text variant="caption" color={colors.textMuted}>
            MindSpark Hub Secretariat
          </Text>
        </View>
        <Text variant="captionBold" color={colors.accent}>
          Verified Honor
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Honors and Awards" subtitle="MindSpark Recognition" showBack />

      <FlatList
        data={awards}
        keyExtractor={(item) => item.id}
        renderItem={renderAwardCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Hero Card */}
            <Card variant="elevated" padding="lg" style={styles.heroCard}>
              <Eyebrow color={colors.accent}>Institutional Recognition</Eyebrow>
              <Heading level={2} color={colors.text} style={{ marginTop: 4 }}>
                MindSpark Honors and Awards
              </Heading>
              <Text variant="headline" color={colors.accent} style={{ marginTop: 4 }}>
                "We spark growth and ignite Mindset"
              </Text>
              <Text
                variant="body"
                color={colors.textMuted}
                style={{ marginTop: 8, lineHeight: 22 }}
              >
                Recognizing exceptional educators, student ambassadors, field mentors, and institutional partners whose dedicated contributions advance youth enlightenment, moral character, and academic excellence across Nigeria.
              </Text>
            </Card>

            {/* Category Filter Pills */}
            <View style={styles.categoryFilterContainer}>
              <Text
                variant="captionBold"
                color={colors.textMuted}
                style={{ marginBottom: 8, paddingHorizontal: 4 }}
              >
                Filter by Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const label = cat === 'ALL' ? 'All Categories' : cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : colors.surface,
                          borderColor: isSelected
                            ? colors.accent
                            : colors.border,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter by ${label}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        variant="captionBold"
                        color={isSelected ? '#0D2748' : colors.text}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: spacing.lg }}>
              <SkeletonLoader height={160} borderRadius={16} style={{ marginBottom: 16 }} />
              <SkeletonLoader height={160} borderRadius={16} style={{ marginBottom: 16 }} />
              <SkeletonLoader height={160} borderRadius={16} />
            </View>
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              title="No Honorees in this Category"
              description="No awards found under the selected category. Select another category or view all."
              actionLabel="View All Categories"
              onAction={() => setSelectedCategory('ALL')}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  headerArea: {
    padding: 16,
  },
  heroCard: {
    marginBottom: 16,
  },
  categoryFilterContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  categoryScroll: {
    paddingRight: 16,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  awardCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    marginRight: 14,
  },
  profileText: {
    flex: 1,
  },
  citationBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  citationText: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

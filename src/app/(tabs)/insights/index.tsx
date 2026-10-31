import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Heading, Text } from '@/components/Typography';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import { BookOpen, Calendar, Clock, Search } from 'lucide-react-native';

const ARTICLE_CATEGORIES = [
  { id: 'ALL', label: 'All Articles' },
  { id: 'Education', label: 'Education' },
  { id: 'Youth Development', label: 'Youth' },
  { id: 'Skills', label: 'Skills' },
  { id: 'Leadership', label: 'Leadership' },
];

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['articles', selectedCategory, searchQuery],
    queryFn: () =>
      api.getArticles({
        category: selectedCategory,
        search: searchQuery || undefined,
      }),
  });

  const renderHeader = () => (
    <View style={styles.headerBox}>
      <Input
        placeholder="Search insights and publications..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<Search size={18} color={colors.textMuted} />}
        containerStyle={{ marginBottom: 12 }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {ARTICLE_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isActive ? colors.accent : colors.surfaceMuted,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                variant="captionBold"
                color={isActive ? colors.accentContrast : colors.text}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Insights" subtitle="Publications and Reflections" />

      {isLoading ? (
        <View style={{ padding: spacing.md }}>
          {renderHeader()}
          <SkeletonLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={120} borderRadius={12} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <ErrorView onRetry={refetch} style={{ marginTop: 32 }} />
        </View>
      ) : (
        <FlatList
          data={data?.articles || []}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
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
              title="No articles found"
              description="No articles match your search or selected filter."
              style={{ marginTop: 32 }}
            />
          }
          renderItem={({ item }) => (
            <Card
              variant="surface"
              padding="md"
              style={styles.articleCard}
              onPress={() => router.push(`/(tabs)/insights/${item.slug}` as any)}
            >
              <View style={styles.cardHeader}>
                <Badge label={item.category} variant="gold" size="sm" />
                <View style={styles.readTime}>
                  <Clock size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                  <Text variant="caption" color={colors.textMuted}>
                    {item.readingTimeMinutes} min read
                  </Text>
                </View>
              </View>

              <Heading level={2} color={colors.text} style={styles.articleTitle}>
                {item.title}
              </Heading>

              <Text
                variant="body"
                color={colors.textMuted}
                numberOfLines={3}
                style={styles.articleExcerpt}
              >
                {item.excerpt}
              </Text>

              <View style={styles.cardFooter}>
                {item.authorName ? (
                  <Text variant="captionBold" color={colors.text}>
                    By {item.authorName}
                  </Text>
                ) : (
                  <Text variant="caption" color={colors.textMuted}>
                    MindSpark Editorial
                  </Text>
                )}

                <Text variant="caption" color={colors.textMuted}>
                  {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
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
  headerBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  articleCard: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleTitle: {
    marginTop: 10,
    lineHeight: 26,
  },
  articleExcerpt: {
    marginTop: 8,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});

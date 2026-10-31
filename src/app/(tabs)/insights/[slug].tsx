import React from 'react';
import {
  ScrollView,
  Share,
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
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api, API_BASE_URL } from '@/lib/api';
import type { ArticleBlock } from '@/types';
import { BookOpen, Calendar, Clock, Share2, User } from 'lucide-react-native';

export default function ArticleReaderScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { colors, spacing, radii } = useTheme();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.getArticle(slug || ''),
    enabled: Boolean(slug),
  });

  const article = data?.article;

  const handleShare = async () => {
    if (!article) return;
    const url = `${API_BASE_URL}/insights/${article.slug}`;
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\nRead on MindSpark Hub: ${url}`,
        url,
      });
    } catch {
      // User cancelled share
    }
  };

  const renderBlock = (block: ArticleBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <Heading
            key={index}
            level={block.level === 2 ? 2 : 3}
            color={colors.text}
            style={styles.blockHeading}
          >
            {block.text}
          </Heading>
        );

      case 'paragraph':
        return (
          <Text
            key={index}
            variant="body"
            color={colors.text}
            style={styles.blockParagraph}
          >
            {block.text}
          </Text>
        );

      case 'quote':
        return (
          <View
            key={index}
            style={[
              styles.blockQuote,
              {
                backgroundColor: colors.surfaceMuted,
                borderLeftColor: colors.accent,
              },
            ]}
          >
            <Text
              variant="bodyEmphasis"
              color={colors.text}
              style={{ fontStyle: 'italic', lineHeight: 24 }}
            >
              "{block.text}"
            </Text>
          </View>
        );

      case 'list':
        return (
          <View key={index} style={styles.blockList}>
            {block.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.listItemRow}>
                <Text variant="captionBold" color={colors.accent} style={{ marginRight: 8, marginTop: 2 }}>
                  {block.ordered ? `${itemIdx + 1}.` : '•'}
                </Text>
                <Text variant="body" color={colors.text} style={{ flex: 1, lineHeight: 22 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'divider':
        return (
          <View
            key={index}
            style={[styles.blockDivider, { backgroundColor: colors.border }]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Article"
        showBack
        rightAction={
          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share article"
            style={styles.shareHeaderBtn}
          >
            <Share2 size={20} color="#FFFFFF" />
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
        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <SkeletonLoader height={32} borderRadius={8} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={24} width="70%" borderRadius={8} style={{ marginBottom: 20 }} />
            <SkeletonLoader height={16} borderRadius={6} style={{ marginBottom: 10 }} />
            <SkeletonLoader height={16} borderRadius={6} style={{ marginBottom: 10 }} />
            <SkeletonLoader height={16} borderRadius={6} style={{ marginBottom: 20 }} />
            <SkeletonLoader height={100} borderRadius={12} />
          </View>
        ) : isError || !article ? (
          <ErrorView
            title="Article Not Found"
            message="We could not retrieve this article. It may have been unpublished or removed."
            onRetry={refetch}
          />
        ) : (
          <View style={styles.articleBody}>
            {/* Metadata header */}
            <View style={styles.metaTop}>
              <Badge label={article.category} variant="gold" size="sm" />
              <View style={styles.metaRow}>
                <Clock size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                <Text variant="caption" color={colors.textMuted}>
                  {article.readingTimeMinutes} min read
                </Text>
              </View>
            </View>

            <Heading level={1} color={colors.text} style={styles.articleTitle}>
              {article.title}
            </Heading>

            <View style={[styles.authorCard, { backgroundColor: colors.surfaceMuted }]}>
              <User size={18} color={colors.accent} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text variant="subhead" color={colors.text}>
                  {article.authorName ? article.authorName : 'MindSpark Hub Editorial'}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Published {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {/* Blocks content */}
            <View style={styles.contentBlocks}>
              {article.blocks && article.blocks.length > 0 ? (
                article.blocks.map((block, idx) => renderBlock(block, idx))
              ) : (
                <Text variant="body" color={colors.text} style={styles.fallbackBody}>
                  {article.excerpt}
                </Text>
              )}
            </View>

            {/* Share CTA */}
            <Card variant="surface" padding="md" style={styles.shareCard}>
              <Heading level={3} color={colors.text}>
                Enjoyed this reflection?
              </Heading>
              <Text variant="body" color={colors.textMuted} style={{ marginTop: 4 }}>
                Share this article with fellow students, colleagues, or educators.
              </Text>
              <Button
                label="Share Article"
                variant="primary"
                onPress={handleShare}
                icon={<Share2 size={16} color={colors.accentContrast} />}
                style={{ marginTop: 12 }}
              />
            </Card>

            {/* Related Articles */}
            {data?.related && data.related.length > 0 ? (
              <View style={styles.relatedSection}>
                <Heading level={3} color={colors.text} style={{ marginBottom: 12 }}>
                  Related Articles
                </Heading>
                {data.related.map((rel) => (
                  <Card
                    key={rel.id}
                    variant="surface"
                    padding="md"
                    style={{ marginBottom: 10 }}
                    onPress={() => router.push(`/(tabs)/insights/${rel.slug}` as any)}
                  >
                    <Heading level={3} color={colors.text}>
                      {rel.title}
                    </Heading>
                    <Text
                      variant="caption"
                      color={colors.textMuted}
                      numberOfLines={2}
                      style={{ marginTop: 4 }}
                    >
                      {rel.excerpt}
                    </Text>
                  </Card>
                ))}
              </View>
            ) : null}
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
    paddingBottom: 40,
  },
  shareHeaderBtn: {
    padding: 8,
    borderRadius: 8,
  },
  articleBody: {
    padding: 16,
  },
  metaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleTitle: {
    lineHeight: 34,
    marginBottom: 16,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  contentBlocks: {
    marginBottom: 24,
  },
  blockHeading: {
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 28,
  },
  blockParagraph: {
    marginBottom: 14,
    lineHeight: 24,
    fontSize: 16,
  },
  blockQuote: {
    borderLeftWidth: 4,
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  blockList: {
    marginVertical: 12,
    gap: 8,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  blockDivider: {
    height: 1,
    marginVertical: 24,
  },
  fallbackBody: {
    lineHeight: 24,
    fontSize: 16,
  },
  shareCard: {
    marginBottom: 24,
  },
  relatedSection: {
    marginTop: 8,
  },
});

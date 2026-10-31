import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { SafeImage } from '@/components/SafeImage';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Article, GalleryItem } from '@/types';
import { BookOpen, Image as ImageIcon } from 'lucide-react-native';

export default function StaffContentScreen() {
  const { colors, spacing } = useTheme();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'articles' | 'gallery'>('articles');

  const canPublishArticles = hasPermission('articles:publish');
  const canPublishGallery = hasPermission('gallery:manage');

  const {
    data: articlesData,
    isLoading: articlesLoading,
    isError: articlesError,
    refetch: refetchArticles,
    isRefetching: articlesRefetching,
  } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => api.getAdminArticles(),
    enabled: activeTab === 'articles',
  });

  const {
    data: galleryData,
    isLoading: galleryLoading,
    isError: galleryError,
    refetch: refetchGallery,
    isRefetching: galleryRefetching,
  } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => api.getAdminGallery(),
    enabled: activeTab === 'gallery',
  });

  const articleMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.updateArticlePublish(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      Alert.alert('Updated', 'Article publication status updated.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Could not update publication status.');
    },
  });

  const galleryMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.updateGalleryPublish(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      Alert.alert('Updated', 'Gallery publication status updated.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Could not update publication status.');
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Content & Media" subtitle="Publishing Controls" showBack />

      {/* Segmented Switcher */}
      <View style={styles.segmentContainer}>
        <Pressable
          onPress={() => setActiveTab('articles')}
          style={[
            styles.segmentBtn,
            activeTab === 'articles' && {
              backgroundColor: colors.accent,
            },
          ]}
        >
          <BookOpen
            size={16}
            color={activeTab === 'articles' ? colors.accentContrast : colors.text}
            style={{ marginRight: 6 }}
          />
          <Text
            variant="captionBold"
            color={activeTab === 'articles' ? colors.accentContrast : colors.text}
          >
            Articles
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('gallery')}
          style={[
            styles.segmentBtn,
            activeTab === 'gallery' && {
              backgroundColor: colors.accent,
            },
          ]}
        >
          <ImageIcon
            size={16}
            color={activeTab === 'gallery' ? colors.accentContrast : colors.text}
            style={{ marginRight: 6 }}
          />
          <Text
            variant="captionBold"
            color={activeTab === 'gallery' ? colors.accentContrast : colors.text}
          >
            Gallery
          </Text>
        </Pressable>
      </View>

      {activeTab === 'articles' ? (
        articlesLoading ? (
          <View style={{ padding: spacing.md }}>
            <SkeletonLoader height={100} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={100} borderRadius={12} />
          </View>
        ) : articlesError ? (
          <ErrorView onRetry={refetchArticles} style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={articlesData?.articles || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={articlesRefetching}
                onRefresh={() => { refetchArticles(); }}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            }
            renderItem={({ item }) => (
              <Card variant="surface" padding="md" style={styles.card}>
                <View style={styles.cardHeader}>
                  <Badge label={item.category} variant="gold" size="sm" />
                  <View style={styles.toggleRow}>
                    <Text variant="caption" color={colors.textMuted} style={{ marginRight: 8 }}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </Text>
                    <Switch
                      value={Boolean(item.isPublished)}
                      disabled={!canPublishArticles || articleMutation.isPending}
                      onValueChange={(val) =>
                        articleMutation.mutate({ id: item.id, isPublished: val })
                      }
                      trackColor={{ false: colors.border, true: colors.accent }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                <Heading level={3} color={colors.text} style={{ marginTop: 8 }}>
                  {item.title}
                </Heading>

                <Text
                  variant="caption"
                  color={colors.textMuted}
                  numberOfLines={2}
                  style={{ marginTop: 4 }}
                >
                  {item.excerpt}
                </Text>
              </Card>
            )}
          />
        )
      ) : galleryLoading ? (
        <View style={{ padding: spacing.md }}>
          <SkeletonLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={120} borderRadius={12} />
        </View>
      ) : galleryError ? (
        <ErrorView onRetry={refetchGallery} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={galleryData?.items || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={galleryRefetching}
              onRefresh={() => { refetchGallery(); }}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          renderItem={({ item }) => (
            <Card variant="surface" padding="md" style={styles.card}>
              <View style={styles.galleryCardRow}>
                <SafeImage
                  source={item.imageUrl}
                  altText={item.title}
                  style={styles.galleryThumb}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Heading level={3} color={colors.text} numberOfLines={1}>
                    {item.title}
                  </Heading>
                  <Text variant="caption" color={colors.accent} style={{ marginTop: 2 }}>
                    Category: {item.category}
                  </Text>
                  <View style={styles.toggleRowInline}>
                    <Text variant="caption" color={colors.textMuted} style={{ marginRight: 6 }}>
                      {item.isPublished ? 'Live' : 'Hidden'}
                    </Text>
                    <Switch
                      value={Boolean(item.isPublished)}
                      disabled={!canPublishGallery || galleryMutation.isPending}
                      onValueChange={(val) =>
                        galleryMutation.mutate({ id: item.id, isPublished: val })
                      }
                      trackColor={{ false: colors.border, true: colors.accent }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
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
  segmentContainer: {
    flexDirection: 'row',
    margin: 16,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 16,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryThumb: {
    width: 68,
    height: 68,
    borderRadius: 8,
  },
  toggleRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

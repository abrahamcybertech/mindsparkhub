import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { SafeImage } from '@/components/SafeImage';
import { ImageViewer } from '@/components/ImageViewer';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import type { GalleryItem } from '@/types';

const CATEGORIES = [
  { id: 'ALL', label: 'All Photos' },
  { id: 'OUTREACH', label: 'Outreach' },
  { id: 'SEMINAR', label: 'Seminars' },
  { id: 'WORKSHOP', label: 'Workshops' },
  { id: 'CAMPUS', label: 'Campus' },
  { id: 'COMMUNITY', label: 'Community' },
];

export default function GalleryScreen() {
  const { colors, spacing, radii } = useTheme();
  const { width } = useWindowDimensions();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const numColumns = width > 600 ? 3 : 2;
  const imageSize = (width - 32 - (numColumns - 1) * 12) / numColumns;

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['gallery', selectedCategory],
    queryFn: () => api.getGallery(selectedCategory),
  });

  const renderHeader = () => (
    <View style={styles.headerBox}>
      <Text variant="body" color={colors.textMuted} style={styles.leadText}>
        Authentic photographic record of MindSpark Hub secondary school invasions, campus seminars, and community outreaches.
      </Text>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
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
                  backgroundColor: isActive
                    ? colors.accent
                    : colors.surfaceMuted,
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
      <Header title="Impact Gallery" subtitle="Verified Field Moments" />

      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {renderHeader()}
          <View style={styles.skeletonRow}>
            <SkeletonLoader width={imageSize} height={imageSize} borderRadius={12} />
            <SkeletonLoader width={imageSize} height={imageSize} borderRadius={12} />
          </View>
          <View style={[styles.skeletonRow, { marginTop: 12 }]}>
            <SkeletonLoader width={imageSize} height={imageSize} borderRadius={12} />
            <SkeletonLoader width={imageSize} height={imageSize} borderRadius={12} />
          </View>
        </View>
      ) : isError ? (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <ErrorView onRetry={refetch} style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
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
              title="No photos in this category"
              description="No confirmed outreach photographs have been published under this category yet."
              style={{ marginTop: 32 }}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedItem(item)}
              accessibilityRole="button"
              accessibilityLabel={`View ${item.title}`}
              style={[
                styles.gridItem,
                { width: imageSize, height: imageSize },
              ]}
            >
              <SafeImage
                source={item.imageUrl}
                altText={item.altText || item.title}
                style={{ width: '100%', height: '100%', borderRadius: 12 }}
              />
              <View style={styles.itemTitleOverlay}>
                <Text
                  variant="captionBold"
                  color="#FFFFFF"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Lightbox Image Viewer */}
      <ImageViewer
        item={selectedItem}
        visible={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
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
  leadText: {
    marginBottom: 14,
    lineHeight: 21,
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
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(13, 39, 72, 0.75)',
  },
  skeletonGrid: {
    paddingHorizontal: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

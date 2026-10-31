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
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { EmptyState, ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import type { AwardItem } from '@/types';
import { Award, Plus, Trash2, Calendar, X, CheckCircle2 } from 'lucide-react-native';

const CATEGORIES = [
  'Mentorship Excellence',
  'Academic Distinction',
  'Youth Leadership',
  'Community Impact',
  'Institutional Partnership',
];

const PHOTO_PRESETS = [
  { label: 'Official Emblem', url: 'https://mindspark-hub.vercel.app/brand/mindspark.jpg' },
  { label: 'Daniel Joseph (Exco)', url: 'https://mindspark-hub.vercel.app/exco/daniel_joseph_ayomide.jpg' },
  { label: 'Adakole Agene (Exco)', url: 'https://mindspark-hub.vercel.app/exco/adakole_agene_michael.jpg' },
  { label: 'Chukwuebuka James (Exco)', url: 'https://mindspark-hub.vercel.app/exco/chukwuebuka_james_obochi.jpg' },
  { label: 'Omomayowa Eunice (Exco)', url: 'https://mindspark-hub.vercel.app/exco/omomayowa_eunice_adewuyi.jpg' },
  { label: 'Bekwapu Lucy (Exco)', url: 'https://mindspark-hub.vercel.app/exco/bekwapu_lucy_beshiunim.jpg' },
  { label: 'FGC Wukari Assembly', url: 'https://mindspark-hub.vercel.app/gallery/ssi_fgc_wukari_panoramic.jpg' },
];

export default function StaffAwardsScreen() {
  const { colors, spacing } = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || 'Mentorship Excellence');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [citation, setCitation] = useState('');
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0]?.url || '');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-awards'],
    queryFn: () => api.getAdminAwards(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      recipientName: string;
      awardTitle: string;
      category: string;
      year: number;
      citation: string;
      imageUrl?: string;
    }) => api.createAdminAward(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-awards'] });
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      setModalVisible(false);
      setRecipientName('');
      setAwardTitle('');
      setCitation('');
      Alert.alert('Honoree Added', 'The award record has been published successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Save Failed', err.message || 'Could not save award.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAdminAward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-awards'] });
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      Alert.alert('Deleted', 'Award record removed from system.');
    },
    onError: (err: any) => {
      Alert.alert('Delete Failed', err.message || 'Could not delete award.');
    },
  });

  const handleConfirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to delete the honor for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const handleSave = () => {
    if (!recipientName.trim() || !awardTitle.trim() || !citation.trim()) {
      Alert.alert('Validation Error', 'Please complete recipient name, title and citation.');
      return;
    }
    const numYear = Number(year);
    if (!numYear || numYear < 2020 || numYear > 2050) {
      Alert.alert('Validation Error', 'Please enter a valid year between 2020 and 2050.');
      return;
    }

    createMutation.mutate({
      recipientName: recipientName.trim(),
      awardTitle: awardTitle.trim(),
      category: category || CATEGORIES[0] || 'Mentorship Excellence',
      year: numYear,
      citation: citation.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  const awards = data?.awards || [];

  const renderAwardCard = ({ item }: { item: AwardItem }) => (
    <Card variant="elevated" padding="md" style={styles.awardCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Badge label={item.category} variant="gold" size="sm" />
            <Text variant="captionBold" color={colors.textMuted} style={{ marginLeft: 8 }}>
              Year {String(item.year)}
            </Text>
          </View>
          <Heading level={3} color={colors.text} style={{ marginTop: 6 }}>
            {item.recipientName}
          </Heading>
          <Text variant="subhead" color={colors.accent} style={{ marginTop: 2 }}>
            {item.awardTitle}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleConfirmDelete(item.id, item.recipientName)}
          style={[styles.deleteBtn, { backgroundColor: colors.errorBg }]}
          accessibilityRole="button"
          accessibilityLabel={`Delete award for ${item.recipientName}`}
        >
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={[styles.citationBox, { backgroundColor: colors.surfaceMuted }]}>
        <Text variant="caption" color={colors.text} numberOfLines={3} style={{ fontStyle: 'italic' }}>
          "{item.citation}"
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Manage Awards" subtitle="Honors and Recognition" showBack />

      <View style={styles.actionHeader}>
        <View style={{ flex: 1 }}>
          <Eyebrow color={colors.accent}>Awards Management</Eyebrow>
          <Heading level={2} color={colors.text}>
            Honored Leaders and Mentors
          </Heading>
          <Text variant="caption" color={colors.textMuted}>
            Add or delete honorees directly from the mobile console.
          </Text>
        </View>

        <Button
          label="Add Honoree"
          variant="primary"
          size="sm"
          onPress={() => setModalVisible(true)}
          style={{ alignSelf: 'center' }}
        />
      </View>

      <FlatList
        data={awards}
        keyExtractor={(item) => item.id}
        renderItem={renderAwardCard}
        contentContainerStyle={styles.listContent}
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
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: spacing.lg }}>
              <SkeletonLoader height={140} borderRadius={16} style={{ marginBottom: 12 }} />
              <SkeletonLoader height={140} borderRadius={16} />
            </View>
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              title="No Awards Found"
              description="No honorees found. Tap Add Honoree to record the first award."
              actionLabel="Add Honoree"
              onAction={() => setModalVisible(true)}
            />
          )
        }
      />

      {/* Add Honoree Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Eyebrow color={colors.accent}>Admin Action</Eyebrow>
                <Heading level={2} color={colors.text}>
                  Add New Honoree
                </Heading>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close form"
              >
                <X size={22} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Input
                label="Recipient Full Name *"
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="e.g. Samuel Daberechukwu"
              />

              <Input
                label="Award Title *"
                value={awardTitle}
                onChangeText={setAwardTitle}
                placeholder="e.g. Outstanding Youth Mentor Award"
              />

              <View style={styles.fieldGroup}>
                <Text variant="captionBold" color={colors.text} style={{ marginBottom: 6 }}>
                  Category *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: isSelected ? colors.accent : colors.surfaceMuted,
                            borderColor: isSelected ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          variant="captionBold"
                          color={isSelected ? '#0D2748' : colors.text}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <Input
                label="Year *"
                value={year}
                onChangeText={setYear}
                placeholder="2026"
                keyboardType="numeric"
              />

              <Input
                label="Official Citation *"
                value={citation}
                onChangeText={setCitation}
                placeholder="Detailed reason for honoring this person..."
                multiline
                numberOfLines={4}
              />

              <View style={styles.fieldGroup}>
                <Text variant="captionBold" color={colors.text} style={{ marginBottom: 6 }}>
                  Photo Preset
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PHOTO_PRESETS.map((preset) => {
                    const isSelected = imageUrl === preset.url;
                    return (
                      <TouchableOpacity
                        key={preset.url}
                        onPress={() => setImageUrl(preset.url)}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                            borderColor: isSelected ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          variant="caption"
                          color={isSelected ? '#FFFFFF' : colors.text}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  label={createMutation.isPending ? 'Saving...' : 'Publish Award'}
                  variant="primary"
                  size="md"
                  loading={createMutation.isPending}
                  onPress={handleSave}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  awardCard: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  citationBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalScroll: {
    paddingTop: 16,
    paddingBottom: 30,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
});

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/theme';
import { Heading, Text } from './Typography';
import { Button } from './Button';
import { Input } from './Input';
import { Checkbox } from './Checkbox';
import { api } from '@/lib/api';
import type { GalleryItem } from '@/types';
import { Flag, X } from 'lucide-react-native';

export interface ImageViewerProps {
  item: GalleryItem | null;
  visible: boolean;
  onClose: () => void;
}

export function ImageViewer({ item, visible, onClose }: ImageViewerProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [isReporting, setIsReporting] = useState(false);
  const [reportReason] = useState<'SAFEGUARDING' | 'CONSENT_WITHDRAWAL' | 'COPYRIGHT' | 'INACCURATE' | 'OTHER'>('SAFEGUARDING');
  const [reportDetails, setReportDetails] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const handleReportSubmit = async () => {
    if (!reportEmail || !reportEmail.includes('@')) {
      setError('Please provide a valid contact email');
      return;
    }
    if (!consent) {
      setError('You must give consent to submit this request');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.reportImage({
        galleryItemId: item.id,
        reason: reportReason,
        details: reportDetails,
        contactEmail: reportEmail,
        consent,
      });

      Alert.alert(
        'Takedown Request Received',
        `Your request has been received with reference number: ${res.reportId}. Our administrative safeguarding team will review it promptly.`
      );
      setIsReporting(false);
      setReportDetails('');
      setReportEmail('');
      setConsent(false);
    } catch (err: any) {
      setError(err.message || 'Unable to submit takedown request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close image viewer"
            style={styles.closeButton}
          >
            <X size={24} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={() => setIsReporting(true)}
            accessibilityRole="button"
            accessibilityLabel="Report this image"
            style={styles.reportHeaderButton}
          >
            <Flag size={18} color="#FFC107" />
            <Text variant="captionBold" color="#FFC107" style={styles.reportText}>
              Report image
            </Text>
          </Pressable>
        </View>

        <View style={styles.imageContainer}>
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.zoomContainer}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.fullImage}
              contentFit="contain"
              accessibilityLabel={item.altText || item.title}
            />
          </ScrollView>
        </View>

        <View style={[styles.captionCard, { backgroundColor: colors.surface }]}>
          <Text variant="headline" color={colors.text}>
            {item.title}
          </Text>
          {item.caption ? (
            <Text
              variant="body"
              color={colors.textMuted}
              style={{ marginTop: 4 }}
            >
              {item.caption}
            </Text>
          ) : null}
          {item.altText ? (
            <Text
              variant="caption"
              color={colors.textMuted}
              style={{ marginTop: 6 }}
            >
              Description: {item.altText}
            </Text>
          ) : null}
        </View>

        {/* Reporting Modal */}
        <Modal
          visible={isReporting}
          transparent
          animationType="slide"
          onRequestClose={() => setIsReporting(false)}
        >
          <View style={styles.reportBackdrop}>
            <View
              style={[
                styles.reportSheet,
                { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 20) },
              ]}
            >
              <View style={styles.reportHeader}>
                <Heading level={2} color={colors.text}>
                  Report this photograph
                </Heading>
                <Pressable
                  onPress={() => setIsReporting(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close report dialog"
                  style={styles.closeButtonSmall}
                >
                  <X size={20} color={colors.text} />
                </Pressable>
              </View>

              <Text variant="body" color={colors.textMuted} style={{ marginBottom: 16 }}>
                MindSpark Hub enforces strict minor safeguarding and privacy rights under the Nigeria Data Protection Act.
              </Text>

              {error ? (
                <Text variant="callout" color={colors.error} style={{ marginBottom: 12 }}>
                  {error}
                </Text>
              ) : null}

              <Input
                label="Your official or personal email"
                placeholder="name@example.com"
                value={reportEmail}
                onChangeText={setReportEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <Input
                label="Reason for takedown request"
                placeholder="Explain why this image should be reviewed or removed"
                value={reportDetails}
                onChangeText={setReportDetails}
                multiline
                numberOfLines={3}
              />

              <Checkbox
                checked={consent}
                onChange={setConsent}
                label="I consent to MindSpark Hub processing my contact details to evaluate and respond to this takedown request."
              />

              <View style={styles.reportActionRow}>
                <Button
                  label="Cancel"
                  variant="outline"
                  onPress={() => setIsReporting(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  label="Submit request"
                  variant="primary"
                  loading={isSubmitting}
                  onPress={handleReportSubmit}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 33, 0.95)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  reportHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
  },
  reportText: {
    marginLeft: 6,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    minWidth: 320,
    minHeight: 320,
  },
  captionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  reportBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  reportSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButtonSmall: {
    padding: 6,
  },
  reportActionRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import { CheckCircle2, ShieldCheck } from 'lucide-react-native';

export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc: 'privacy' | 'terms' | 'security' }>();
  const { colors, spacing } = useTheme();

  const validDoc = (doc === 'privacy' || doc === 'terms' || doc === 'security') ? doc : 'privacy';

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['legal', validDoc],
    queryFn: () => api.getLegalDocument(validDoc),
  });

  const legalDoc = data?.document;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={legalDoc?.title || 'Legal Document'}
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
          <View style={{ padding: spacing.md }}>
            <SkeletonLoader height={120} borderRadius={12} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={180} borderRadius={12} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={180} borderRadius={12} />
          </View>
        ) : isError || !legalDoc ? (
          <ErrorView
            title="Unable to Load Document"
            message="We could not fetch the latest legal guidelines from the server."
            onRetry={refetch}
          />
        ) : (
          <View style={styles.content}>
            <Card variant="elevated" padding="lg" style={styles.headerCard}>
              <Eyebrow color={colors.accent}>{legalDoc.eyebrow}</Eyebrow>
              <Heading level={1} color={colors.text} style={{ marginTop: 4 }}>
                {legalDoc.title}
              </Heading>
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                Last updated: {legalDoc.updated}
              </Text>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text variant="body" color={colors.text} style={{ lineHeight: 22 }}>
                {legalDoc.summary}
              </Text>
            </Card>

            {legalDoc.sections?.map((sec, sIdx) => (
              <Card
                key={sIdx}
                variant="surface"
                padding="md"
                style={styles.sectionCard}
              >
                <Heading level={2} color={colors.text} style={styles.sectionHeading}>
                  {sec.heading}
                </Heading>

                {sec.paragraphs?.map((p, pIdx) => (
                  <Text
                    key={pIdx}
                    variant="body"
                    color={colors.text}
                    style={styles.paragraph}
                  >
                    {p}
                  </Text>
                ))}

                {sec.bullets && sec.bullets.length > 0 ? (
                  <View style={styles.bulletList}>
                    {sec.bullets.map((b, bIdx) => (
                      <View key={bIdx} style={styles.bulletRow}>
                        <CheckCircle2
                          size={16}
                          color={colors.accent}
                          style={{ marginTop: 3, marginRight: 8 }}
                        />
                        <Text
                          variant="body"
                          color={colors.text}
                          style={{ flex: 1, lineHeight: 22 }}
                        >
                          {b}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Card>
            ))}
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
  content: {
    gap: 16,
  },
  headerCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  sectionCard: {
    marginBottom: 4,
  },
  sectionHeading: {
    marginBottom: 10,
    lineHeight: 28,
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 23,
    fontSize: 15,
  },
  bulletList: {
    marginTop: 6,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

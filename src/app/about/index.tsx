import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SafeImage } from '@/components/SafeImage';
import { Badge } from '@/components/Badge';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import {
  Award,
  BookOpen,
  Building,
  CheckCircle,
  Compass,
  FileText,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['structure'],
    queryFn: () => api.getStructure(),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="About MindSpark Hub" subtitle="Organisation and Structure" showBack />

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
        {/* Core Identity Card */}
        <Card variant="elevated" padding="lg" style={styles.identityCard}>
          <Eyebrow color={colors.accent}>Who We Are</Eyebrow>
          <Heading level={1} color={colors.text} style={styles.mainTitle}>
            MindSpark Hub
          </Heading>
          <Text variant="headline" color={colors.accent} style={{ marginTop: 4 }}>
            "We spark growth and ignite Mindset"
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text variant="body" color={colors.text} style={styles.bodyText}>
            MindSpark Hub is an institutional youth development platform founded to raise a new generation of disciplined, purposeful, and skilled Nigerians. We strive to defeat mediocrity, ignite intellectual ambition, and anchor young minds upon unshakeable ethical principles.
          </Text>

          <View style={styles.mottoBox}>
            <Text variant="captionBold" color={colors.textMuted}>
              Motto:
            </Text>
            <Text variant="bodyEmphasis" color={colors.text} style={{ marginLeft: 6 }}>
              We spark growth and ignite Mindset.
            </Text>
          </View>
        </Card>

        {/* Vision & Mission */}
        <View style={styles.section}>
          <Card variant="surface" padding="md" style={styles.visionCard}>
            <Eyebrow color={colors.accent}>Our Vision</Eyebrow>
            <Text variant="bodyEmphasis" color={colors.text} style={{ marginTop: 6 }}>
              To build a Nigeria where citizens excel, innovate and lead positive change.
            </Text>
          </Card>

          <Card variant="surface" padding="md" style={styles.missionCard}>
            <Eyebrow color={colors.accent}>Our Mission</Eyebrow>
            <Text variant="body" color={colors.text} style={{ marginTop: 6 }}>
              Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions.
            </Text>
          </Card>
        </View>

        {isLoading ? (
          <View style={{ padding: spacing.md }}>
            <SkeletonLoader height={140} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={220} borderRadius={12} />
          </View>
        ) : isError ? (
          <ErrorView onRetry={refetch} style={{ marginTop: 24 }} />
        ) : (
          <>
            {/* The Eight Operational Units */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Eyebrow color={colors.accent}>Organisational Structure</Eyebrow>
                <Heading level={2} color={colors.text}>
                  The Eight Operational Units
                </Heading>
              </View>

              {data?.units?.map((unit, idx) => (
                <Card
                  key={idx}
                  variant="surface"
                  padding="md"
                  style={styles.unitCard}
                >
                  <View style={styles.unitHeader}>
                    <View
                      style={[
                        styles.unitNumberBox,
                        { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                      ]}
                    >
                      <Text variant="captionBold" color={colors.accent}>
                        {idx + 1}
                      </Text>
                    </View>
                    <Heading level={3} color={colors.text} style={styles.unitName}>
                      {unit.name}
                    </Heading>
                  </View>

                  <Text variant="caption" color={colors.accent} style={{ marginTop: 6 }}>
                    Focus: {unit.focus}
                  </Text>

                  {unit.responsibilities && unit.responsibilities.length > 0 ? (
                    <View style={styles.respList}>
                      {unit.responsibilities.map((resp, rIdx) => (
                        <View key={rIdx} style={styles.respRow}>
                          <CheckCircle size={14} color={colors.accent} style={{ marginTop: 2, marginRight: 6 }} />
                          <Text variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
                            {resp}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </Card>
              ))}
            </View>

            {/* Secretariat and Financial Department */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Eyebrow color={colors.accent}>Central Administration</Eyebrow>
                <Heading level={2} color={colors.text}>
                  Administrative Organs
                </Heading>
              </View>

              <Card variant="muted" padding="md" style={styles.organCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Building size={18} color={colors.accent} style={{ marginRight: 8 }} />
                  <Heading level={3} color={colors.text}>
                    {data?.secretariat?.title || 'The Secretariat'}
                  </Heading>
                </View>
                <Text variant="body" color={colors.textMuted} style={{ marginTop: 8 }}>
                  {data?.secretariat?.description ||
                    'Coordinates institutional documentation, inter unit logistics, regulatory correspondence, and outreach records.'}
                </Text>
              </Card>

              <Card variant="muted" padding="md" style={styles.organCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Award size={18} color={colors.accent} style={{ marginRight: 8 }} />
                  <Heading level={3} color={colors.text}>
                    {data?.financialDepartment?.title || 'Financial Department'}
                  </Heading>
                </View>
                <Text variant="body" color={colors.textMuted} style={{ marginTop: 8 }}>
                  {data?.financialDepartment?.description ||
                    'Maintains rigorous accounting integrity, audit trail accountability, and resource stewardship.'}
                </Text>
              </Card>
            </View>

            {/* Verified Executive Council */}
            {data?.leadership && data.leadership.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Eyebrow color={colors.accent}>Leadership Team</Eyebrow>
                  <Heading level={2} color={colors.text}>
                    Executive Council Members
                  </Heading>
                  <Text variant="caption" color={colors.textMuted}>
                    Verified appointed leaders and directors
                  </Text>
                </View>

                <View style={styles.leadershipGrid}>
                  {data.leadership.map((leader, lIdx) => (
                    <Card
                      key={lIdx}
                      variant="surface"
                      padding="md"
                      style={styles.leaderCard}
                    >
                      <View style={styles.leaderRow}>
                        <SafeImage
                          source={leader.image}
                          altText={leader.name}
                          style={styles.leaderPhoto}
                        />
                        <View style={styles.leaderInfo}>
                          <Heading level={3} color={colors.text}>
                            {leader.name}
                          </Heading>
                          <Text variant="subhead" color={colors.accent} style={{ marginTop: 2 }}>
                            {leader.role}
                          </Text>
                          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                            {leader.unit}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Honors and Awards Link Card */}
            <Card variant="surface" padding="md" style={styles.awardsPromoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Award size={20} color={colors.accent} style={{ marginRight: 8 }} />
                <Heading level={3} color={colors.text}>
                  MindSpark Honors and Awards
                </Heading>
              </View>
              <Text variant="body" color={colors.textMuted} style={{ marginBottom: 12 }}>
                Discover our recognized mentors, exemplary students, and partner institutions celebrated for distinguished service.
              </Text>
              <Button
                label="View All Honorees"
                variant="outline"
                size="sm"
                onPress={() => router.push('/awards')}
              />
            </Card>

            {/* Headquarters notice */}
            <Card variant="muted" padding="md" style={styles.hqCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={18} color={colors.accent} style={{ marginRight: 8 }} />
                <Heading level={3} color={colors.text}>
                  Headquarters
                </Heading>
              </View>
              <Text variant="body" color={colors.textMuted} style={{ marginTop: 6 }}>
                {data?.headquarters || 'Wukari, Taraba State, Nigeria.'}
              </Text>
            </Card>
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
  identityCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  mainTitle: {
    marginTop: 4,
    lineHeight: 34,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  bodyText: {
    lineHeight: 22,
  },
  mottoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  visionCard: {
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  missionCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#0D2748',
  },
  unitCard: {
    marginBottom: 10,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitNumberBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  unitName: {
    flex: 1,
  },
  respList: {
    marginTop: 8,
    gap: 4,
  },
  respRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  organCard: {
    marginBottom: 10,
  },
  leadershipGrid: {
    gap: 12,
  },
  leaderCard: {
    marginBottom: 2,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  leaderInfo: {
    flex: 1,
  },
  awardsPromoCard: {
    marginVertical: 14,
  },
  hqCard: {
    marginTop: 8,
  },
});

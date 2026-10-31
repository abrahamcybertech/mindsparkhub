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
import { Eyebrow, Heading, Subheading, Text } from '@/components/Typography';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SafeImage } from '@/components/SafeImage';
import { ErrorView, SkeletonLoader } from '@/components/StateViews';
import { api } from '@/lib/api';
import {
  BookOpen,
  Calendar,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react-native';

const APPROACH_PILLARS = [
  {
    title: 'Academic Excellence',
    description: 'Promoting structured study habits, intellectual curiosity, and rigorous discipline.',
    icon: GraduationCap,
  },
  {
    title: 'Skills Acquisition',
    description: 'Equipping youths with in demand practical and digital capabilities for the modern economy.',
    icon: Lightbulb,
  },
  {
    title: 'Character Development',
    description: 'Instilling integrity, resilience, moral courage, and high personal standards.',
    icon: ShieldCheck,
  },
  {
    title: 'Leadership Development',
    description: 'Cultivating visionary, accountable leaders ready to serve and uplift their communities.',
    icon: Compass,
  },
  {
    title: 'Purpose Discovery',
    description: 'Guiding youths to align their innate talents with meaningful life missions.',
    icon: Sparkles,
  },
  {
    title: 'Moral and Spiritual Growth',
    description: 'Building grounded values that anchor decision making and ethical conduct.',
    icon: BookOpen,
  },
  {
    title: 'Community Responsibility',
    description: 'Fostering civic ownership and proactive service to solve pressing societal challenges.',
    icon: HeartHandshake,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors, spacing, radii } = useTheme();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['home'],
    queryFn: () => api.getHome(),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showLogo />

      <ScrollView
        showsVerticalScrollIndicator={false}
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
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: colors.headerBackground }]}>
          <Eyebrow color={colors.accent}>
            Youth Development and Enlightenment
          </Eyebrow>
          <Heading level={1} color="#FFFFFF" style={styles.heroHeadline}>
            Igniting Minds. Sparking Purpose. Transforming Lives.
          </Heading>
          <Text
            variant="body"
            color="rgba(255, 255, 255, 0.85)"
            style={styles.heroSupporting}
          >
            MindSpark Hub is a dynamic platform committed to equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.
          </Text>

          <View style={styles.heroActionRow}>
            <Button
              label="Discover Our Impact"
              variant="primary"
              size="md"
              onPress={() => router.push('/(tabs)/gallery')}
              style={styles.heroBtn}
            />
            <Button
              label="Explore Our Programmes"
              variant="outline"
              size="md"
              onPress={() => router.push('/(tabs)/programmes')}
              style={styles.heroBtn}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <SkeletonLoader height={180} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={120} borderRadius={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader height={220} borderRadius={16} />
          </View>
        ) : isError ? (
          <ErrorView onRetry={refetch} style={{ marginVertical: 32 }} />
        ) : (
          <>
            {/* Vision and Mission Cards */}
            <View style={styles.section}>
              <Card variant="elevated" style={styles.visionCard}>
                <Eyebrow color={colors.accent}>Our Vision</Eyebrow>
                <Heading level={3} color={colors.text} style={{ marginTop: 4 }}>
                  To build a Nigeria where citizens excel, innovate and lead positive change.
                </Heading>
              </Card>

              <Card variant="elevated" style={styles.missionCard}>
                <Eyebrow color={colors.accent}>Our Mission</Eyebrow>
                <Text variant="body" color={colors.text} style={{ marginTop: 4 }}>
                  Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions.
                </Text>
              </Card>
            </View>

            {/* Three Impact Vehicles */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Eyebrow color={colors.accent}>Core Vehicles</Eyebrow>
                <Heading level={2} color={colors.text}>
                  Our Three Impact Programmes
                </Heading>
              </View>

              {data?.programmes?.map((prog) => (
                <Card
                  key={prog.slug}
                  variant="surface"
                  padding="md"
                  style={styles.programmeCard}
                  onPress={() => router.push(`/(tabs)/programmes/${prog.slug}` as any)}
                >
                  <View style={styles.programmeRow}>
                    <View style={styles.programmeInfo}>
                      <Heading level={3} color={colors.text}>
                        {prog.title}
                      </Heading>
                      <Text
                        variant="subhead"
                        color={colors.accent}
                        style={{ marginTop: 2 }}
                      >
                        {prog.tagline}
                      </Text>
                      {prog.audience ? (
                        <Text
                          variant="caption"
                          color={colors.textMuted}
                          style={{ marginTop: 6 }}
                        >
                          Target: {prog.audience}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))}
            </View>

            {/* Verified Impact Photography Strip */}
            {data?.gallery && data.gallery.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Eyebrow color={colors.accent}>Field Activities</Eyebrow>
                  <Heading level={2} color={colors.text}>
                    Verified Outreach Impact
                  </Heading>
                  <Text variant="caption" color={colors.textMuted}>
                    Authentic seminar and campus moments
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryStrip}
                >
                  {data.gallery.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push('/(tabs)/gallery')}
                      style={styles.galleryStripItem}
                    >
                      <SafeImage
                        source={item.imageUrl}
                        altText={item.altText || item.title}
                        style={styles.stripImage}
                      />
                      <Text
                        variant="captionBold"
                        color={colors.text}
                        numberOfLines={1}
                        style={{ marginTop: 6 }}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Our Seven Pillars Approach */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Eyebrow color={colors.accent}>Strategic Pillars</Eyebrow>
                <Heading level={2} color={colors.text}>
                  Our Seven Pillars Approach
                </Heading>
              </View>

              <View style={styles.pillarsGrid}>
                {APPROACH_PILLARS.map((pillar) => {
                  const IconComponent = pillar.icon;
                  return (
                    <Card
                      key={pillar.title}
                      variant="muted"
                      padding="sm"
                      style={styles.pillarCard}
                    >
                      <View style={styles.pillarHeader}>
                        <View
                          style={[
                            styles.pillarIconBox,
                            { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                          ]}
                        >
                          <IconComponent size={20} color={colors.accent} />
                        </View>
                        <Heading level={3} color={colors.text} style={styles.pillarTitle}>
                          {pillar.title}
                        </Heading>
                      </View>
                      <Text
                        variant="caption"
                        color={colors.textMuted}
                        style={{ marginTop: 6 }}
                      >
                        {pillar.description}
                      </Text>
                    </Card>
                  );
                })}
              </View>
            </View>

            {/* Closing institutional message */}
            <View
              style={[
                styles.closingBanner,
                { backgroundColor: colors.isDark ? '#133560' : colors.primary },
              ]}
            >
              <Heading level={2} color="#FFFFFF" align="center">
                The future is not waiting. We are building it.
              </Heading>
              <Text
                variant="body"
                color="rgba(255, 255, 255, 0.85)"
                align="center"
                style={{ marginTop: 8 }}
              >
                Join hands with MindSpark Hub as we equip students, campus youths, and community members across Nigeria.
              </Text>
              <Button
                label="Get Involved Today"
                variant="primary"
                onPress={() => router.push('/get-involved')}
                style={{ marginTop: 16, alignSelf: 'center' }}
              />
            </View>
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
    paddingBottom: 40,
  },
  hero: {
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroHeadline: {
    marginTop: 8,
    lineHeight: 34,
  },
  heroSupporting: {
    marginTop: 12,
    lineHeight: 22,
  },
  heroActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  heroBtn: {
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  visionCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  missionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0D2748',
  },
  programmeCard: {
    marginBottom: 12,
  },
  programmeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  programmeInfo: {
    flex: 1,
  },
  galleryStrip: {
    paddingVertical: 4,
    gap: 12,
  },
  galleryStripItem: {
    width: 200,
  },
  stripImage: {
    width: 200,
    height: 130,
    borderRadius: 12,
  },
  pillarsGrid: {
    gap: 10,
  },
  pillarCard: {
    marginBottom: 4,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pillarTitle: {
    fontSize: 16,
    flex: 1,
  },
  closingBanner: {
    margin: 16,
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
});

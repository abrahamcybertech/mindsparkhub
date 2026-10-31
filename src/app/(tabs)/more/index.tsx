import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/lib/auth';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  HandHeart,
  HelpCircle,
  Info,
  Lock,
  Mail,
  Scale,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';

export default function MoreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const menuSections = [
    {
      title: 'Engage and Participate',
      items: [
        {
          label: 'Events and Schedule',
          subtitle: 'Confirmed seminars and dates',
          icon: Calendar,
          route: '/events',
        },
        {
          label: 'Get Involved',
          subtitle: 'Volunteer, mentor, or partner with us',
          icon: HandHeart,
          route: '/get-involved',
        },
        {
          label: 'Contact Us',
          subtitle: 'Institutional enquiries and coordination',
          icon: Mail,
          route: '/contact',
        },
      ],
    },
    {
      title: 'Organisation and Governance',
      items: [
        {
          label: 'About and Structure',
          subtitle: 'Vision, philosophy, 8 units, and excos',
          icon: Info,
          route: '/about',
        },
        {
          label: 'Honors and Awards',
          subtitle: 'Recognized mentors, students and partners',
          icon: Award,
          route: '/awards',
        },
      ],
    },
    {
      title: 'Legal and Data Protection',
      items: [
        {
          label: 'Privacy Policy',
          subtitle: 'Nigeria Data Protection Act compliance',
          icon: ShieldCheck,
          route: '/legal/privacy',
        },
        {
          label: 'Terms of Use',
          subtitle: 'Platform and participation guidelines',
          icon: Scale,
          route: '/legal/terms',
        },
        {
          label: 'Security and Disclosure',
          subtitle: 'Responsible vulnerability reporting',
          icon: Shield,
          route: '/legal/security',
        },
        {
          label: 'About this App',
          subtitle: 'Version details and institutional links',
          icon: HelpCircle,
          route: '/legal/about-app',
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="More" subtitle="Institutional Resources" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Staff Portal Banner Card */}
        <Card
          variant="elevated"
          padding="md"
          style={[
            styles.staffCard,
            {
              backgroundColor: colors.isDark ? '#133560' : colors.primary,
              borderColor: colors.accent,
            },
          ]}
          onPress={() =>
            isAuthenticated ? router.push('/staff/dashboard') : router.push('/staff/login')
          }
        >
          <View style={styles.staffHeader}>
            <View style={styles.staffIconBox}>
              <Lock size={22} color="#FFC107" />
            </View>
            <View style={{ flex: 1 }}>
              <Heading level={3} color="#FFFFFF">
                {isAuthenticated ? 'Staff Dashboard' : 'Staff Portal'}
              </Heading>
              <Text variant="caption" color="rgba(255,255,255,0.8)" style={{ marginTop: 2 }}>
                {isAuthenticated
                  ? `Signed in as ${user?.name} (${user?.role})`
                  : 'Restricted administrative access with multi factor authentication'}
              </Text>
            </View>
            <ChevronRight size={20} color="#FFC107" />
          </View>
        </Card>

        {/* Menu Sections */}
        {menuSections.map((sec, secIdx) => (
          <View key={secIdx} style={styles.section}>
            <Text
              variant="eyebrow"
              color={colors.accent}
              style={styles.sectionTitle}
            >
              {sec.title}
            </Text>

            <Card variant="surface" padding="none" style={styles.menuCard}>
              {sec.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isLast = itemIdx === sec.items.length - 1;
                return (
                  <Pressable
                    key={itemIdx}
                    onPress={() => router.push(item.route as any)}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    style={({ pressed }) => [
                      styles.menuItem,
                      !isLast && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderSubtle,
                      },
                      pressed && { backgroundColor: colors.surfaceMuted },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemIconBox,
                        { backgroundColor: colors.isDark ? '#133560' : '#E2E8F0' },
                      ]}
                    >
                      <Icon size={18} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="headline" color={colors.text}>
                        {item.label}
                      </Text>
                      <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))}
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
  staffCard: {
    marginBottom: 20,
    borderWidth: 1.5,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: 56,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});

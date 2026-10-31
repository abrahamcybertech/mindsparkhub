import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Eyebrow, Heading, Text } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Checkbox } from '@/components/Checkbox';
import { api } from '@/lib/api';
import { deleteFormDraft, getFormDraft, saveFormDraft } from '@/lib/offline';
import { SubmissionFormSchema } from '@/lib/validation';
import type { SubmissionType } from '@/types';
import {
  CheckCircle,
  Copy,
  FileCheck,
  FolderDown,
  HandHeart,
  Save,
  ShieldCheck,
} from 'lucide-react-native';

const FORM_TYPES: { id: SubmissionType; label: string; desc: string }[] = [
  {
    id: 'VOLUNTEER_APPLICATION',
    label: 'Volunteer',
    desc: 'Join the field team for school invasions and campus operations.',
  },
  {
    id: 'MENTOR_APPLICATION',
    label: 'Mentor',
    desc: 'Guide secondary school and campus youths in career and academic paths.',
  },
  {
    id: 'PARTNERSHIP_PROPOSAL',
    label: 'Partner',
    desc: 'Collaborate as an institution, school, or corporate organisation.',
  },
  {
    id: 'SCHOOL_OUTREACH_REQUEST',
    label: 'School Request',
    desc: 'Invite the Secondary Schools Invasion team to your secondary school.',
  },
  {
    id: 'RESOURCE_CONTRIBUTION',
    label: 'Contribute Resources',
    desc: 'Provide educational books, venue space, or technical learning materials.',
  },
  {
    id: 'PROGRAMME_PARTICIPATION',
    label: 'Participate',
    desc: 'Register to attend upcoming seminars or campus sparking cohorts.',
  },
];

export default function GetInvolvedScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const [selectedType, setSelectedType] = useState<SubmissionType>('VOLUNTEER_APPLICATION');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [organization, setOrganization] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    async function checkDraft() {
      const draft = await getFormDraft();
      if (draft && draft.formData) {
        setHasDraft(true);
      }
    }
    checkDraft();
  }, []);

  const handleRestoreDraft = async () => {
    const draft = await getFormDraft();
    if (draft && draft.formData) {
      const d = draft.formData;
      if (d.type) setSelectedType(d.type);
      if (d.fullName) setFullName(d.fullName);
      if (d.email) setEmail(d.email);
      if (d.phone) setPhone(d.phone);
      if (d.state) setState(d.state);
      if (d.city) setCity(d.city);
      if (d.organization) setOrganization(d.organization);
      if (d.skills) setSkills(d.skills);
      if (d.message) setMessage(d.message);
      Alert.alert('Draft Restored', 'Your saved draft entries have been restored.');
    }
  };

  const handleSaveDraft = async () => {
    await saveFormDraft({
      type: selectedType,
      fullName,
      email,
      phone,
      state,
      city,
      organization,
      skills,
      message,
    });
    setHasDraft(true);
    Alert.alert('Draft Saved', 'Your form entries have been safely saved on this device.');
  };

  const handleSubmit = async () => {
    setErrors({});

    const formData = {
      type: selectedType,
      fullName,
      email,
      phone: phone || undefined,
      state: state || undefined,
      city: city || undefined,
      organization: organization || undefined,
      skills: skills || undefined,
      message,
      consent,
    };

    const parsed = SubmissionFormSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) fieldErrors[path.toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitForm({
        type: selectedType,
        fullName,
        email,
        phone: phone || undefined,
        state: state || undefined,
        city: city || undefined,
        organization: organization || undefined,
        skills: skills || undefined,
        message,
        consent,
      });

      await deleteFormDraft();
      setHasDraft(false);
      setReferenceCode(res.referenceCode);
    } catch (err: any) {
      Alert.alert(
        'Submission Error',
        err.message || 'Unable to submit your application. Please check your network connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReferenceCode(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setState('');
    setCity('');
    setOrganization('');
    setSkills('');
    setMessage('');
    setConsent(false);
  };

  const activeTypeMeta = FORM_TYPES.find((t) => t.id === selectedType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Get Involved" subtitle="Participation and Partnership" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category selector */}
        <View style={styles.selectorSection}>
          <Eyebrow color={colors.accent}>Select Pathway</Eyebrow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typePills}
          >
            {FORM_TYPES.map((t) => {
              const isSelected = selectedType === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setSelectedType(t.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    variant="captionBold"
                    color={isSelected ? colors.accentContrast : colors.text}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {activeTypeMeta ? (
            <Card variant="muted" padding="sm" style={styles.typeDescCard}>
              <Text variant="caption" color={colors.text}>
                {activeTypeMeta.desc}
              </Text>
            </Card>
          ) : null}
        </View>

        {/* Draft banner if draft exists */}
        {hasDraft ? (
          <View style={[styles.draftBanner, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text variant="captionBold" color={colors.text}>
                Unfinished draft available
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                You have previously saved details on this device.
              </Text>
            </View>
            <Button
              label="Restore"
              variant="outline"
              size="sm"
              onPress={handleRestoreDraft}
            />
          </View>
        ) : null}

        {/* The Form Fields */}
        <Card variant="surface" padding="md" style={styles.formCard}>
          <Heading level={3} color={colors.text} style={{ marginBottom: 16 }}>
            Application and Inquiry Details
          </Heading>

          <Input
            label="Full Name"
            placeholder="Chukwuebuka Daniel"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            required
          />

          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            required
          />

          <Input
            label="Telephone Contact"
            placeholder="08012345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
            helperText="Optional Nigerian mobile line"
          />

          <View style={styles.row}>
            <Input
              label="State"
              placeholder="Taraba"
              value={state}
              onChangeText={setState}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="City or Town"
              placeholder="Wukari"
              value={city}
              onChangeText={setCity}
              containerStyle={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          <Input
            label="School, Campus, or Organisation"
            placeholder="Federal Government College Wukari"
            value={organization}
            onChangeText={setOrganization}
            helperText="Leave empty if applying as an individual"
          />

          <Input
            label="Relevant Skills or Area of Specialisation"
            placeholder="Public speaking, graphics, logistics, student counselling"
            value={skills}
            onChangeText={setSkills}
            helperText="What capabilities do you bring?"
          />

          <Input
            label="Message or Proposal"
            placeholder="Explain your motivation, institutional request, or how you wish to collaborate"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            error={errors.message}
            required
          />

          {/* Privacy and consent */}
          <View style={[styles.privacyBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <ShieldCheck size={16} color={colors.accent} style={{ marginRight: 6 }} />
              <Text variant="captionBold" color={colors.text}>
                Data Protection Commitment
              </Text>
            </View>
            <Text variant="caption" color={colors.textMuted} style={{ lineHeight: 18 }}>
              MindSpark Hub collects only the minimum personal information required to review your submission under the Nigeria Data Protection Act 2023. We never sell or share your contact details.
            </Text>
          </View>

          <Checkbox
            checked={consent}
            onChange={setConsent}
            error={errors.consent}
          >
            <Text variant="caption" color={colors.text} style={{ lineHeight: 18 }}>
              I freely give consent for MindSpark Hub to process my information to evaluate and respond to this request in line with the{' '}
              <Text
                variant="captionBold"
                color={colors.accent}
                onPress={() => router.push('/legal/privacy')}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </Checkbox>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Button
              label="Save Draft"
              variant="outline"
              size="sm"
              onPress={handleSaveDraft}
              icon={<Save size={16} color={colors.isDark ? colors.accent : colors.primary} />}
              style={{ marginRight: 8 }}
            />
            <Button
              label="Submit Form"
              variant="primary"
              size="md"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Success Modal with Reference Code */}
      <Modal
        visible={Boolean(referenceCode)}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <Card variant="elevated" padding="lg" style={styles.successModalCard}>
            <View
              style={[
                styles.successIconCircle,
                { backgroundColor: colors.isDark ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7' },
              ]}
            >
              <CheckCircle size={40} color="#16A34A" />
            </View>

            <Heading level={2} color={colors.text} align="center" style={{ marginTop: 12 }}>
              Submission Confirmed
            </Heading>

            <Text
              variant="body"
              color={colors.textMuted}
              align="center"
              style={{ marginTop: 8, lineHeight: 22 }}
            >
              Thank you for connecting with MindSpark Hub. Your submission has been securely registered in our system.
            </Text>

            <View style={[styles.refCodeBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.accent }]}>
              <Text variant="captionBold" color={colors.accent}>
                Reference Code
              </Text>
              <Heading level={2} color={colors.text} style={{ marginTop: 4, letterSpacing: 1.5 }}>
                {referenceCode}
              </Heading>
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                Keep this code for any future follow up
              </Text>
            </View>

            <Button
              label="Done"
              variant="primary"
              fullWidth
              onPress={resetForm}
              style={{ marginTop: 16 }}
            />
          </Card>
        </View>
      </Modal>
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
  selectorSection: {
    marginBottom: 16,
  },
  typePills: {
    gap: 8,
    marginTop: 8,
    paddingBottom: 4,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeDescCard: {
    marginTop: 10,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  formCard: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  privacyBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 33, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refCodeBox: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 16,
  },
});

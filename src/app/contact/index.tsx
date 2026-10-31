import React, { useState } from 'react';
import {
  Alert,
  Modal,
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
import { CheckCircle, Mail, MapPin, ShieldCheck } from 'lucide-react-native';

export default function ContactScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!fullName || fullName.trim().length < 3) errs.fullName = 'Please enter your full name';
    if (!email || !email.includes('@')) errs.email = 'Please enter a valid email address';
    if (!message || message.trim().length < 10) errs.message = 'Please provide details of your inquiry (min 10 characters)';
    if (!consent) errs.consent = 'You must give consent to process your contact inquiry';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitForm({
        type: 'GENERAL_INQUIRY',
        fullName,
        email,
        phone: phone || undefined,
        message,
        consent,
      });

      setReferenceCode(res.referenceCode);
    } catch (err: any) {
      Alert.alert(
        'Inquiry Error',
        err.message || 'Unable to deliver your inquiry. Please try again shortly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setReferenceCode(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setConsent(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Contact Us" subtitle="Direct Institutional Coordination" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact info cards */}
        <Card variant="elevated" padding="lg" style={styles.infoCard}>
          <Eyebrow color={colors.accent}>Headquarters and Channels</Eyebrow>
          <Heading level={2} color={colors.text} style={{ marginTop: 4 }}>
            Official Channels
          </Heading>
          <Text variant="body" color={colors.textMuted} style={{ marginTop: 6, lineHeight: 22 }}>
            Reach out to MindSpark Hub leadership for institutional partnerships, academic invitations, or general questions.
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.contactRow}>
            <Mail size={18} color={colors.accent} style={{ marginRight: 10, marginTop: 2 }} />
            <View>
              <Text variant="captionBold" color={colors.textMuted}>
                General Inquiries
              </Text>
              <Text variant="body" color={colors.text}>
                info@mindsparkhub.org
              </Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Mail size={18} color={colors.accent} style={{ marginRight: 10, marginTop: 2 }} />
            <View>
              <Text variant="captionBold" color={colors.textMuted}>
                Secretariat
              </Text>
              <Text variant="body" color={colors.text}>
                secretariat@mindsparkhub.org
              </Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <MapPin size={18} color={colors.accent} style={{ marginRight: 10, marginTop: 2 }} />
            <View>
              <Text variant="captionBold" color={colors.textMuted}>
                Headquarters
              </Text>
              <Text variant="body" color={colors.text}>
                Wukari, Taraba State, Nigeria
              </Text>
            </View>
          </View>
        </Card>

        {/* Contact Form */}
        <Card variant="surface" padding="md" style={styles.formCard}>
          <Heading level={3} color={colors.text} style={{ marginBottom: 16 }}>
            Send Us a Message
          </Heading>

          <Input
            label="Full Name"
            placeholder="Your official name"
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
            label="Telephone Number"
            placeholder="08012345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            helperText="Optional contact line"
          />

          <Input
            label="Inquiry Details"
            placeholder="Describe your inquiry, request, or proposal"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            error={errors.message}
            required
          />

          <Checkbox
            checked={consent}
            onChange={setConsent}
            error={errors.consent}
          >
            <Text variant="caption" color={colors.text} style={{ lineHeight: 18 }}>
              I agree to allow MindSpark Hub to process this contact inquiry in compliance with the{' '}
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

          <Button
            label="Send Message"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit}
            style={{ marginTop: 16 }}
          />
        </Card>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={Boolean(referenceCode)}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <Card variant="elevated" padding="lg" style={styles.modalCard}>
            <View style={styles.successIconBox}>
              <CheckCircle size={40} color="#16A34A" />
            </View>

            <Heading level={2} color={colors.text} align="center" style={{ marginTop: 12 }}>
              Message Received
            </Heading>

            <Text variant="body" color={colors.textMuted} align="center" style={{ marginTop: 8 }}>
              Your message has been assigned reference code:
            </Text>

            <View style={[styles.codeBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.accent }]}>
              <Heading level={2} color={colors.text}>
                {referenceCode}
              </Heading>
            </View>

            <Button
              label="Done"
              variant="primary"
              fullWidth
              onPress={handleDone}
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
  infoCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  formCard: {
    marginBottom: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 33, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    marginVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
});

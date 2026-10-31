import { z } from 'zod';

export const PublicInquirySchema = z.object({
  type: z.enum(['general', 'programme', 'partnership', 'join', 'volunteer', 'mentor', 'support']),
  fullName: z.string().trim().min(2, 'Full name must contain at least 2 characters').max(100),
  email: z.string().trim().email('Please provide a valid email address'),
  phoneNumber: z.string().trim().max(30).optional().or(z.literal('')),
  interests: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long').max(3000),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'You must review and agree to the privacy notice before submitting.',
  }),
  isAdultConfirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm that you are 18 years of age or older.',
  }),
  website_url_check: z.string().max(0, 'Automated submission detected').optional(),
  submissionTimestamp: z.number().refine((ts) => Date.now() - ts >= 2500, {
    message: 'Submission was completed unnaturally quickly. Please review your message and submit again.',
  }),
});

export const AdminLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid official email address'),
  password: z.string().min(12, 'Password must be at least 12 characters long'),
  mfaCode: z.string().trim().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(12, 'Current password must be at least 12 characters long'),
  newPassword: z.string().min(12, 'New password must be at least 12 characters long').max(200),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid official email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().trim().min(32, 'Reset token is invalid').max(128),
  newPassword: z.string().min(12, 'New password must be at least 12 characters long').max(200),
});

export const SupabaseResetPasswordSchema = z.object({
  accessToken: z.string().trim().min(20, 'Reset session is invalid').max(4096),
  newPassword: z.string().min(12, 'New password must be at least 12 characters long').max(200),
});

export const MfaSetupSchema = z.object({
  currentPassword: z.string().min(12, 'Current password must be at least 12 characters long'),
});

export const MfaVerifySchema = z.object({
  code: z.string().trim().min(6, 'Enter the 6 digit code from Google Authenticator').max(20),
});

export const EventSchema = z.object({
  programmeSlug: z.enum(['ssi', 'cs', 'ce']),
  title: z.string().trim().min(5).max(150),
  venue: z.string().trim().min(3).max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().trim().min(10).max(2000),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED', 'CANCELLED']),
});

export const ArticleSchema = z.object({
  title: z.string().trim().min(5).max(200),
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lower case alphanumeric with technical hyphens only'),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().min(50),
  authorName: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(50),
  featuredImage: z.string().trim().min(1),
  readingTimeMins: z.number().int().min(1).max(60),
  isPublished: z.boolean(),
});

export const TeamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  roleTitle: z.string().trim().min(2).max(150),
  unitSlug: z.string().trim().max(80).optional().or(z.literal('')),
  bio: z.string().trim().min(10).max(1000),
  imageUrl: z.string().trim().min(1).max(500),
  orderIndex: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
});

export const GalleryItemSchema = z.object({
  title: z.string().trim().min(3).max(150),
  caption: z.string().trim().min(5).max(500),
  altText: z.string().trim().min(5).max(300),
  category: z.enum(['ssi', 'cs', 'ce', 'seminar', 'mentorship', 'outreach']),
  imageUrl: z.string().trim().min(1),
  isMinorDepicted: z.boolean(),
  consentVerified: z.boolean(),
  consentReference: z.string().trim().optional().or(z.literal('')),
  isPublished: z.boolean(),
}).refine((data) => {
  // Safeguarding Rule: If a minor is depicted, consent must be verified and consent reference must be supplied
  if (data.isMinorDepicted && data.isPublished) {
    return data.consentVerified && Boolean(data.consentReference && data.consentReference.length >= 3);
  }
  return true;
}, {
  message: 'Child Safeguarding Gate: You cannot publish photographs depicting minors without confirmed institutional consent and a verified reference code.',
  path: ['consentVerified'],
});

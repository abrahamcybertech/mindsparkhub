import { z } from 'zod';

const deviceId = z
  .string()
  .trim()
  .min(8, 'Device identifier is invalid')
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/, 'Device identifier is invalid');

const identifier = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9._:-]+$/, 'Identifier is invalid');

export const MobileChallengeSchema = z
  .object({
    deviceId,
  })
  .strict();

export const MobileLoginSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid official email address'),
    password: z.string().min(12, 'Password must be at least 12 characters long').max(200),
    deviceId,
  })
  .strict();

export const MobileMfaSchema = z
  .object({
    challenge: z.string().trim().min(20).max(200),
    code: z.string().trim().min(6, 'Enter the 6 digit code from your authenticator app').max(20),
    deviceId,
  })
  .strict();

export const MobileRefreshSchema = z
  .object({
    refreshToken: z.string().trim().min(40).max(300),
    deviceId,
  })
  .strict();

export const MobileLogoutSchema = z
  .object({
    refreshToken: z.string().trim().min(40).max(300).optional(),
  })
  .strict();

export const MobileSubmissionSchema = z
  .object({
    type: z.enum(['general', 'programme', 'partnership', 'join', 'volunteer', 'mentor', 'support']),
    fullName: z.string().trim().min(2, 'Full name must contain at least 2 characters').max(100),
    email: z.string().trim().email('Please provide a valid email address'),
    phoneNumber: z.string().trim().max(30).optional().or(z.literal('')),
    interests: z.string().trim().max(200).optional().or(z.literal('')),
    message: z.string().trim().min(10, 'Message must be at least 10 characters long').max(3000),
    consentGiven: z.boolean().refine((value) => value === true, {
      message: 'You must review and agree to the privacy notice before submitting.',
    }),
    isAdultConfirmed: z.boolean().refine((value) => value === true, {
      message: 'You must confirm that you are 18 years of age or older.',
    }),
    website_url_check: z.string().max(0, 'Automated submission detected').optional(),
    challenge: z.string().trim().min(20).max(200),
    deviceId,
  })
  .strict();

export const MobileImageReportSchema = z
  .object({
    galleryItemId: identifier,
    reason: z.enum(['privacy', 'safeguarding', 'consent', 'inaccurate', 'other']),
    details: z.string().trim().min(10, 'Please describe the concern in at least 10 characters').max(1000),
    contactEmail: z.string().trim().email('Please provide a valid email address').optional().or(z.literal('')),
    challenge: z.string().trim().min(20).max(200),
    deviceId,
  })
  .strict();

export const StaffSubmissionUpdateSchema = z
  .object({
    id: identifier,
    status: z.enum(['NEW', 'UNDER_REVIEW', 'CONTACTED', 'ARCHIVED']).optional(),
    internalNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  })
  .strict();

export const StaffEventUpdateSchema = z
  .object({
    id: identifier,
    status: z.enum(['APPROVED', 'CANCELLED', 'COMPLETED']),
  })
  .strict();

export const StaffArticleUpdateSchema = z
  .object({
    id: identifier,
    isPublished: z.boolean(),
  })
  .strict();

export const StaffGalleryUpdateSchema = z
  .object({
    id: identifier,
    action: z.enum(['publish', 'unpublish', 'takedown']),
  })
  .strict();

import { z } from 'zod';

export const SubmissionFormSchema = z.object({
  type: z.enum([
    'GENERAL_INQUIRY',
    'VOLUNTEER_APPLICATION',
    'MENTOR_APPLICATION',
    'PARTNERSHIP_PROPOSAL',
    'SCHOOL_OUTREACH_REQUEST',
    'RESOURCE_CONTRIBUTION',
    'PROGRAMME_PARTICIPATION',
  ]),
  fullName: z
    .string()
    .trim()
    .min(3, 'Please enter your full name')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(120, 'Email address is too long'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .trim()
    .max(60, 'State name is too long')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .max(60, 'City name is too long')
    .optional()
    .or(z.literal('')),
  organization: z
    .string()
    .trim()
    .max(120, 'Organisation name is too long')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Please write a message with at least 10 characters')
    .max(2500, 'Message cannot exceed 2500 characters'),
  areaOfInterest: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('')),
  skills: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal('')),
  availability: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('')),
  consent: z.literal(true, {
    message: 'You must give consent to process your information',
  }),
  honeypot: z.string().max(0).optional(),
});

export const ReportImageSchema = z.object({
  galleryItemId: z.string().trim().min(1, 'Item identifier is required'),
  reason: z.enum(['SAFEGUARDING', 'CONSENT_WITHDRAWAL', 'COPYRIGHT', 'INACCURATE', 'OTHER']),
  details: z
    .string()
    .trim()
    .max(1000, 'Details cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  contactEmail: z.string().trim().email('Please enter a valid contact email address'),
  consent: z.literal(true, {
    message: 'You must give consent to receive our response',
  }),
  honeypot: z.string().max(0).optional(),
});

export const StaffLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid official email address'),
  password: z.string().min(12, 'Password must be at least 12 characters long').max(200),
});

export const StaffMfaSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, 'Enter the 6 digit code from your authenticator app')
    .max(16, 'Code is invalid'),
});

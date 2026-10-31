export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'PROGRAMME_MANAGER';

export type Permission =
  | 'content:read'
  | 'programmes:manage'
  | 'events:draft'
  | 'events:approve'
  | 'articles:manage'
  | 'articles:publish'
  | 'gallery:manage'
  | 'gallery:safeguard_approve'
  | 'gallery:takedown'
  | 'awards:manage'
  | 'inquiries:view'
  | 'inquiries:manage'
  | 'inquiries:export'
  | 'inquiries:delete'
  | 'users:manage'
  | 'audit:view'
  | 'security:manage';

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mfaEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
}

export interface AuthSession {
  user: MobileUser;
  tokens: AuthTokens;
  permissions: Permission[];
}

export interface Programme {
  slug: string;
  title: string;
  tagline: string;
  audience?: string;
  description?: string;
  objectives?: string[];
  structure?: string[];
  scheduleSummary?: string;
  isActive?: boolean;
}

export interface EventItem {
  id: string;
  programmeSlug: string;
  programmeTitle?: string;
  title: string;
  tagline?: string;
  description?: string;
  venue: string;
  city: string;
  state: string;
  startDate: string;
  endDate?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'CANCELLED';
  capacity?: number;
  isPublic: boolean;
}

export interface GalleryItem {
  id: string;
  programmeSlug?: string;
  title: string;
  caption: string;
  altText: string;
  category: 'OUTREACH' | 'SEMINAR' | 'WORKSHOP' | 'CAMPUS' | 'COMMUNITY';
  imageUrl: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  isMinorDepicted: boolean;
  consentVerified: boolean;
  takenAt?: string;
}

export interface AwardItem {
  id: string;
  recipientName: string;
  awardTitle: string;
  category: string;
  year: number;
  citation: string;
  imageUrl?: string;
  orderIndex?: number;
  createdAt?: string;
}

export type ArticleBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'divider' };

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName?: string;
  readingTimeMinutes: number;
  publishedAt: string;
  isPublished: boolean;
  coverImageUrl?: string;
  blocks?: ArticleBlock[];
}

export interface ExcoMember {
  name: string;
  role: string;
  unit: string;
  image: string;
}

export interface StructureUnit {
  name: string;
  focus: string;
  responsibilities: string[];
}

export interface GovernanceStructure {
  motto: string;
  slogan: string;
  philosophy: string;
  headquarters: string;
  contact: {
    email: string;
    privacyEmail: string;
    securityEmail: string;
    secretariatEmail: string;
    address: string;
  };
  leadership: ExcoMember[];
  units: StructureUnit[];
  secretariat: {
    title: string;
    description: string;
  };
  financialDepartment: {
    title: string;
    description: string;
  };
}

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: 'privacy' | 'terms' | 'security';
  title: string;
  eyebrow: string;
  updated: string;
  summary: string;
  sections: LegalSection[];
}

export type SubmissionType =
  | 'GENERAL_INQUIRY'
  | 'VOLUNTEER_APPLICATION'
  | 'MENTOR_APPLICATION'
  | 'PARTNERSHIP_PROPOSAL'
  | 'SCHOOL_OUTREACH_REQUEST'
  | 'RESOURCE_CONTRIBUTION'
  | 'PROGRAMME_PARTICIPATION';

export interface SubmissionPayload {
  type: SubmissionType;
  fullName: string;
  email: string;
  phone?: string;
  state?: string;
  city?: string;
  organization?: string;
  message: string;
  areaOfInterest?: string;
  skills?: string;
  availability?: string;
  consent: boolean;
  honeypot?: string;
  challengeToken: string;
  deviceId: string;
}

export interface ReportPayload {
  galleryItemId: string;
  reason: 'SAFEGUARDING' | 'CONSENT_WITHDRAWAL' | 'COPYRIGHT' | 'INACCURATE' | 'OTHER';
  details?: string;
  contactEmail: string;
  consent: boolean;
  honeypot?: string;
  challengeToken: string;
  deviceId: string;
}

export interface SubmissionRecord {
  id: string;
  referenceCode: string;
  type: SubmissionType;
  fullName: string;
  email: string;
  phone?: string;
  state?: string;
  city?: string;
  organization?: string;
  message: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESPONDED' | 'ARCHIVED';
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details?: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
  ipAddress?: string;
  currentHash?: string;
  createdAt: string;
}

export interface AdminSummaryData {
  counts: {
    inquiries: number;
    eventsPending: number;
    articles: number;
    gallery: number;
    auditLogs: number;
  };
  recentAudit: AuditLogRecord[];
}

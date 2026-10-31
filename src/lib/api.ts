import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { getDeviceId } from './device';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
} from './secure-store';
import type {
  AdminSummaryData,
  Article,
  AuditLogRecord,
  AuthTokens,
  AwardItem,
  EventItem,
  GalleryItem,
  GovernanceStructure,
  LegalDocument,
  MobileUser,
  Permission,
  Programme,
  ReportPayload,
  SubmissionPayload,
  SubmissionRecord,
} from '@/types';
import {
  FALLBACK_ARTICLES,
  FALLBACK_AWARDS,
  FALLBACK_EVENTS,
  FALLBACK_GALLERY,
  FALLBACK_HOME,
  FALLBACK_LEGAL,
  FALLBACK_PROGRAMMES,
  FALLBACK_SITE,
  FALLBACK_STRUCTURE,
} from '@/content/fallback';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://mindspark-hub.vercel.app';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
  retries?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    timeoutMs = 15000,
    skipAuth = false,
    retries = options.method === undefined || options.method === 'GET' ? 1 : 0,
    headers: customHeaders,
    ...rest
  } = options;

  const deviceId = await getDeviceId();
  const requestId = Crypto.randomUUID();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-app-version': APP_VERSION,
    'x-device-id': deviceId,
    'x-request-id': requestId,
    ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${path}`;

  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...rest,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Handle 401: try refreshing token if we had one
      if (response.status === 401 && !skipAuth && !path.includes('/auth/')) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const newToken = await getAccessToken();
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            const retryRes = await fetch(url, {
              ...rest,
              headers,
            });
            if (retryRes.ok) {
              return (await retryRes.json()) as T;
            }
          }
        }
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: 'Invalid response from server' };
      }

      if (!response.ok) {
        const message =
          data.error ||
          (response.status === 404
            ? 'The requested content was not found.'
            : response.status === 429
            ? 'Too many requests. Please slow down and try again shortly.'
            : response.status === 426
            ? 'A newer version of the MindSpark Hub app is required.'
            : 'An unexpected error occurred. Please try again.');
        throw new ApiError(response.status, message, data.code);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timer);

      if (err instanceof ApiError) {
        throw err;
      }

      const isNetworkError =
        err.name === 'AbortError' ||
        err.message?.includes('Network request failed') ||
        err.message?.includes('Failed to fetch');

      if (isNetworkError && attempt <= retries) {
        await new Promise((res) => setTimeout(res, attempt * 1000));
        continue;
      }

      if (err.name === 'AbortError') {
        throw new ApiError(408, 'The connection timed out. Please check your internet.', 'TIMEOUT');
      }

      throw new ApiError(
        0,
        'Unable to connect to MindSpark Hub. Please check your network connection.',
        'NETWORK_ERROR'
      );
    }
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        await clearAuthSession();
        return false;
      }

      const deviceId = await getDeviceId();
      const res = await request<{
        tokens: AuthTokens;
        user: MobileUser;
        permissions: Permission[];
      }>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken, deviceId }),
        skipAuth: true,
      });

      if (res && res.tokens) {
        await saveAuthSession(res.tokens, res.user, res.permissions);
        return true;
      }

      await clearAuthSession();
      return false;
    } catch {
      await clearAuthSession();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const api = {
  // Public challenge generator for anti-bot form protection
  async getChallenge(): Promise<{
    challengeToken: string;
    issuedAt: string;
    expiresInSeconds: number;
  }> {
    const deviceId = await getDeviceId();
    return request('/api/v1/challenge', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
      skipAuth: true,
    });
  },

  // Home screen content with resilient offline fallback
  async getHome(): Promise<{
    site: any;
    home: any;
    about: any;
    programmes: Programme[];
    gallery: GalleryItem[];
  }> {
    try {
      return await request('/api/v1/home');
    } catch {
      return {
        site: FALLBACK_SITE,
        home: FALLBACK_HOME,
        about: {
          eyebrow: 'About MindSpark Hub',
          headline: 'An Institution for National Transformation',
          supporting:
            'Equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.',
        },
        programmes: FALLBACK_PROGRAMMES,
        gallery: FALLBACK_GALLERY.slice(0, 3),
      };
    }
  },

  // Programmes with resilient offline fallback
  async getProgrammes(): Promise<{ programmes: Programme[] }> {
    try {
      return await request('/api/v1/programmes');
    } catch {
      return { programmes: FALLBACK_PROGRAMMES };
    }
  },

  async getProgramme(slug: string): Promise<{
    programme: Programme;
    relatedEvents: EventItem[];
    relatedGallery: GalleryItem[];
  }> {
    try {
      return await request(`/api/v1/programmes/${slug}`);
    } catch {
      const prog =
        FALLBACK_PROGRAMMES.find((p) => p.slug === slug) ?? FALLBACK_PROGRAMMES[0]!;
      const relatedEvents = FALLBACK_EVENTS.filter((e) => e.programmeSlug === slug);
      const relatedGallery = FALLBACK_GALLERY.filter((g) => g.programmeSlug === slug);
      return {
        programme: prog,
        relatedEvents,
        relatedGallery,
      };
    }
  },

  // Events with resilient offline fallback
  async getEvents(): Promise<{ events: EventItem[] }> {
    try {
      return await request('/api/v1/events');
    } catch {
      return { events: FALLBACK_EVENTS };
    }
  },

  // Gallery with resilient offline fallback
  async getGallery(category?: string): Promise<{ items: GalleryItem[] }> {
    try {
      const query = category && category !== 'ALL' ? `?category=${encodeURIComponent(category)}` : '';
      return await request(`/api/v1/gallery${query}`);
    } catch {
      const filtered =
        !category || category === 'ALL'
          ? FALLBACK_GALLERY
          : FALLBACK_GALLERY.filter(
              (item) =>
                item.category.toLowerCase() === category.toLowerCase() ||
                item.programmeSlug?.toLowerCase() === category.toLowerCase()
            );
      return { items: filtered };
    }
  },

  // Articles with resilient offline fallback
  async getArticles(options?: {
    category?: string;
    search?: string;
    page?: number;
  }): Promise<{
    articles: Article[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.category && options.category !== 'ALL') params.set('category', options.category);
      if (options?.search) params.set('search', options.search);
      if (options?.page) params.set('page', String(options.page));
      const query = params.toString() ? `?${params.toString()}` : '';
      return await request(`/api/v1/articles${query}`);
    } catch {
      let list = FALLBACK_ARTICLES;
      if (options?.category && options.category !== 'ALL') {
        const cat = options.category.toLowerCase();
        list = list.filter((a) => a.category.toLowerCase().includes(cat));
      }
      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
        );
      }
      return {
        articles: list,
        pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
      };
    }
  },

  async getArticle(slug: string): Promise<{
    article: Article;
    related: Article[];
  }> {
    try {
      return await request(`/api/v1/articles/${slug}`);
    } catch {
      const found =
        FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? FALLBACK_ARTICLES[0]!;
      const related = FALLBACK_ARTICLES.filter((a) => a.slug !== found.slug);
      return {
        article: found,
        related,
      };
    }
  },

  // About and Structure with normalization and resilient offline fallback
  async getStructure(): Promise<GovernanceStructure> {
    try {
      const res = await request<any>('/api/v1/structure');
      if (res && (res.units || res.leadership || res.people)) {
        const leadership = (res.leadership || res.people || []).map((p: any) => ({
          name: p.name,
          role: p.role || p.roleTitle || 'Executive Member',
          unit: p.unit || p.unitSlug || 'Advocacy Unit',
          image: p.image || p.imageUrl || '',
        }));
        const units = (res.units || []).map((u: any) => ({
          name: u.name,
          focus: u.focus || u.description || '',
          responsibilities: u.responsibilities || u.coreFunctions || [],
        }));
        return {
          ...FALLBACK_STRUCTURE,
          units: units.length > 0 ? units : FALLBACK_STRUCTURE.units,
          leadership:
            leadership.length > 0 ? leadership : FALLBACK_STRUCTURE.leadership,
        };
      }
      return FALLBACK_STRUCTURE;
    } catch {
      return FALLBACK_STRUCTURE;
    }
  },

  // Legal documents with resilient offline fallback
  async getLegalDocument(doc: 'privacy' | 'terms' | 'security'): Promise<{
    document: LegalDocument;
  }> {
    try {
      return await request(`/api/v1/legal/${doc}`);
    } catch {
      return { document: FALLBACK_LEGAL[doc] || FALLBACK_LEGAL.privacy };
    }
  },

  // Honors and Awards with resilient offline fallback
  async getAwards(options?: {
    category?: string;
    year?: number;
  }): Promise<{ awards: AwardItem[]; categories: string[] }> {
    try {
      const params = new URLSearchParams();
      if (options?.category && options.category !== 'ALL') params.set('category', options.category);
      if (options?.year) params.set('year', String(options.year));
      const query = params.toString() ? `?${params.toString()}` : '';
      return await request(`/api/v1/awards${query}`);
    } catch {
      let list = FALLBACK_AWARDS;
      if (options?.category && options.category !== 'ALL') {
        const cat = options.category.toLowerCase();
        list = list.filter((a) => a.category.toLowerCase() === cat);
      }
      if (options?.year) {
        list = list.filter((a) => a.year === options.year);
      }
      const categories = Array.from(new Set(FALLBACK_AWARDS.map((a) => a.category))).sort();
      return { awards: list, categories };
    }
  },

  // Form Submissions
  async submitForm(payload: Omit<SubmissionPayload, 'deviceId' | 'challengeToken'>): Promise<{
    referenceCode: string;
    message: string;
  }> {
    const [challengeRes, deviceId] = await Promise.all([this.getChallenge(), getDeviceId()]);

    const fullPayload: SubmissionPayload = {
      ...payload,
      challengeToken: challengeRes.challengeToken,
      deviceId,
    };

    return request('/api/v1/submissions', {
      method: 'POST',
      body: JSON.stringify(fullPayload),
      skipAuth: true,
    });
  },

  // Image Takedown Report
  async reportImage(payload: Omit<ReportPayload, 'deviceId' | 'challengeToken'>): Promise<{
    reportId: string;
    message: string;
  }> {
    const [challengeRes, deviceId] = await Promise.all([this.getChallenge(), getDeviceId()]);

    const fullPayload: ReportPayload = {
      ...payload,
      challengeToken: challengeRes.challengeToken,
      deviceId,
    };

    return request('/api/v1/reports', {
      method: 'POST',
      body: JSON.stringify(fullPayload),
      skipAuth: true,
    });
  },

  // Staff Authentication
  async login(
    email: string,
    password: string
  ): Promise<{
    requiresMfa: boolean;
    challenge: string;
    expiresInSeconds: number;
    message: string;
  }> {
    const deviceId = await getDeviceId();
    return request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceId }),
      skipAuth: true,
    });
  },

  async verifyMfa(
    challenge: string,
    code: string
  ): Promise<{
    tokens: AuthTokens;
    user: MobileUser;
    permissions: Permission[];
  }> {
    const deviceId = await getDeviceId();
    const data = await request<{
      tokens: AuthTokens;
      user: MobileUser;
      permissions: Permission[];
    }>('/api/v1/auth/mfa', {
      method: 'POST',
      body: JSON.stringify({ challenge, code, deviceId }),
      skipAuth: true,
    });

    await saveAuthSession(data.tokens, data.user, data.permissions);
    return data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await getRefreshToken();
      await request('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      await clearAuthSession();
    }
  },

  async getMe(): Promise<{ user: MobileUser; permissions: Permission[] }> {
    return request('/api/v1/auth/me');
  },

  // Staff Administration Actions
  async getAdminSummary(): Promise<AdminSummaryData> {
    return request('/api/v1/admin/summary');
  },

  async getAdminSubmissions(status?: string): Promise<{ submissions: SubmissionRecord[] }> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/api/v1/admin/submissions${query}`);
  },

  async updateSubmissionStatus(
    id: string,
    status: SubmissionRecord['status']
  ): Promise<{ success: boolean }> {
    return request('/api/v1/admin/submissions', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
  },

  async getAdminEvents(status?: string): Promise<{ events: EventItem[] }> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/api/v1/admin/events${query}`);
  },

  async updateEventStatus(
    id: string,
    status: EventItem['status']
  ): Promise<{ success: boolean; event: EventItem }> {
    return request('/api/v1/admin/events', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
  },

  async getAdminGallery(): Promise<{ items: GalleryItem[] }> {
    return request('/api/v1/admin/gallery');
  },

  async updateGalleryPublish(
    id: string,
    isPublished: boolean
  ): Promise<{ success: boolean }> {
    return request('/api/v1/admin/gallery', {
      method: 'PATCH',
      body: JSON.stringify({ id, isPublished }),
    });
  },

  async getAdminArticles(): Promise<{ articles: Article[] }> {
    return request('/api/v1/admin/articles');
  },

  async updateArticlePublish(
    id: string,
    isPublished: boolean
  ): Promise<{ success: boolean }> {
    return request('/api/v1/admin/articles', {
      method: 'PATCH',
      body: JSON.stringify({ id, isPublished }),
    });
  },

  async getAdminAudit(limit = 50): Promise<{ auditLogs: AuditLogRecord[] }> {
    return request(`/api/v1/admin/audit?limit=${limit}`);
  },

  // Staff Awards Management
  async getAdminAwards(): Promise<{ awards: AwardItem[] }> {
    try {
      return await request('/api/v1/admin/awards');
    } catch {
      return { awards: FALLBACK_AWARDS };
    }
  },

  async createAdminAward(payload: {
    recipientName: string;
    awardTitle: string;
    category: string;
    year: number;
    citation: string;
    imageUrl?: string;
    orderIndex?: number;
  }): Promise<{ award: AwardItem }> {
    return request('/api/v1/admin/awards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminAward(id: string): Promise<{ success: boolean; id: string }> {
    return request(`/api/v1/admin/awards?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

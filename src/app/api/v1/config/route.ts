import { NextRequest } from 'next/server';
import { apiJson } from '@/lib/api/http';
import { getMinimumSupportedVersion, guardMobileRequest, isKillSwitchOn } from '@/lib/api/version';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req, { allowDuringKillSwitch: true });
  if (guard) return guard;

  return apiJson(
    {
      apiVersion: 'v1',
      minimumAppVersion: getMinimumSupportedVersion(),
      servicePaused: isKillSwitchOn(),
      siteUrl: SITE.siteUrl,
      supportEmail: SITE.contact.email,
      privacyEmail: SITE.contact.privacyEmail,
      securityEmail: SITE.contact.securityEmail,
      legal: {
        privacy: `${SITE.siteUrl}/privacy`,
        terms: `${SITE.siteUrl}/terms`,
        security: `${SITE.siteUrl}/security`,
      },
      features: {
        remotePush: false,
        localNotifications: true,
        calendar: true,
        biometricUnlock: true,
      },
    },
    { cache: 'public, s-maxage=300, stale-while-revalidate=600' }
  );
}

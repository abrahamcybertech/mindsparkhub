import { NextRequest } from 'next/server';
import { apiError } from './http';

const DEFAULT_MINIMUM_VERSION = '1.0.0';

function parseVersion(value: string): number[] | null {
  const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareVersions(left: string, right: string): number {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return 0;
  for (let index = 0; index < 3; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }
  return 0;
}

export function getMinimumSupportedVersion(): string {
  return process.env.MIN_SUPPORTED_APP_VERSION || DEFAULT_MINIMUM_VERSION;
}

export function isKillSwitchOn(): boolean {
  return process.env.MOBILE_KILL_SWITCH === 'true';
}

export function guardMobileRequest(req: NextRequest, options?: { allowDuringKillSwitch?: boolean }) {
  if (isKillSwitchOn() && !options?.allowDuringKillSwitch) {
    return apiError(
      503,
      'The mobile service is temporarily paused for maintenance. Please try again later.',
      'SERVICE_PAUSED'
    );
  }

  const appVersion = req.headers.get('x-app-version');
  if (appVersion) {
    const minimum = getMinimumSupportedVersion();
    if (compareVersions(appVersion, minimum) < 0) {
      return apiError(
        426,
        'A newer version of the MindSpark Hub app is required to continue.',
        'APP_UPDATE_REQUIRED'
      );
    }
  }

  return null;
}

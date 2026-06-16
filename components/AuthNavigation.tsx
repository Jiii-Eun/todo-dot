import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useUserContext } from '@/contexts/UserProvider';

const MAIN_ROUTE = '/home' as const;
const WELCOME_ROUTE = '/' as const;

function isAppRoute(segment: string | undefined): boolean {
  return segment === '(main)' || segment === 'focus';
}

/**
 * Keeps the user on / (welcome) or /home (main) based on auth state.
 * Welcome and main must use different paths — both used to be "/" and logout showed a blank screen.
 */
export function AuthNavigation() {
  const { user, isLoading } = useUserContext();
  const segments = useSegments();
  const router = useRouter();
  const segmentKey = segments.join('/');

  useEffect(() => {
    if (isLoading) return;

    const shouldBeInApp = Boolean(user);
    const inApp = isAppRoute(segments[0]);

    if (shouldBeInApp && !inApp) {
      router.replace(MAIN_ROUTE);
      return;
    }

    if (!shouldBeInApp && inApp) {
      router.replace(WELCOME_ROUTE);
    }
  }, [user, isLoading, segmentKey, router, segments]);

  return null;
}

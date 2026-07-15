import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';

import { useAuthStore } from '@/features/auth/store/auth-store';
import { fetchCurrentUserProfile, getCurrentSession, onAuthStateChanged } from '@/features/auth/services/auth-service';

async function resolveProfileForSession(session: Session | null) {
  if (!session?.user) {
    return null;
  }

  return fetchCurrentUserProfile(session.user);
}

export function AuthProvider() {
  const setLoading = useAuthStore((state) => state.setLoading);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    let isMounted = true;

    async function syncSession(session: Session | null) {
      if (!isMounted) {
        return;
      }

      setLoading();

      try {
        const profile = await resolveProfileForSession(session);

        if (!isMounted) {
          return;
        }

        setSession(session, profile);
      } catch (error) {
        if (__DEV__) {
          console.error('[AuthProvider] Unable to resolve auth session', {
            error,
          });
        }

        if (!isMounted) {
          return;
        }

        setSession(session, null);
      }
    }

    void getCurrentSession()
      .then((session) => syncSession(session))
      .catch((error) => {
        if (__DEV__) {
          console.error('[AuthProvider] Unable to load initial auth session', {
            error,
          });
        }

        if (isMounted) {
          setSession(null, null);
        }
      });

    const subscription = onAuthStateChanged((_event, session) => {
      void syncSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setLoading, setSession]);

  return null;
}

import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store/auth-store';
import { fetchCurrentUserProfile, getCurrentSession, onAuthStateChanged } from '@/features/auth/services/auth-service';
import type { AppAuthSession } from '@/features/auth/types';

async function resolveProfileForSession(session: AppAuthSession | null) {
  if (!session?.userId) {
    return null;
  }

  return fetchCurrentUserProfile(session);
}

export function AuthProvider() {
  const setLoading = useAuthStore((state) => state.setLoading);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    let isMounted = true;

    async function syncSession(session: AppAuthSession | null) {
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

    const subscription = onAuthStateChanged((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setSession(null, null);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        const currentState = useAuthStore.getState();
        const isSameUser = currentState.session?.userId && currentState.session.userId === session?.userId;

        if (isSameUser) {
          setSession(session, currentState.profile);
          return;
        }
      }

      void syncSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setLoading, setSession]);

  return null;
}

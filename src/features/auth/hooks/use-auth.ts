import { useMemo } from 'react';

import { useAuthStore } from '@/features/auth/store/auth-store';

export function useAuth() {
  const status = useAuthStore((state) => state.status);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);

  return useMemo(
    () => ({
      status,
      session,
      profile,
      isLoading: status === 'loading',
      isAuthenticated: Boolean(session?.userId),
      isGuest: !session?.userId,
    }),
    [profile, session, status],
  );
}

import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { AppUserProfile } from '@/features/auth/types';

type AuthStatus = 'loading' | 'ready';

type AuthStoreState = {
  status: AuthStatus;
  session: Session | null;
  profile: AppUserProfile | null;
  setLoading: () => void;
  setSession: (session: Session | null, profile: AppUserProfile | null) => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  status: 'loading',
  session: null,
  profile: null,
  setLoading: () =>
    set((current) => ({
      ...current,
      status: 'loading',
    })),
  setSession: (session, profile) =>
    set({
      status: 'ready',
      session,
      profile,
    }),
}));

import type { AuthChangeEvent, Session, Subscription, User } from '@supabase/supabase-js';

import type { AppUserProfile } from '@/features/auth/types';
import { getSupabaseClient } from '@/services/supabase/client';

type UserProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: string;
};

function mapFallbackProfile(user: User): AppUserProfile {
  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      (typeof user.user_metadata?.display_name === 'string' && user.user_metadata.display_name) ||
      (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
      null,
    avatarUrl:
      (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) ||
      (typeof user.user_metadata?.picture === 'string' && user.user_metadata.picture) ||
      null,
    status: 'active',
  };
}

export async function sendEmailOtp(email: string) {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw error;
  }
}

export async function verifyEmailOtp(email: string, token: string) {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = token.trim();

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  if (!normalizedToken) {
    throw new Error('Verification code is required.');
  }

  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: 'email',
  });

  if (error) {
    throw error;
  }
}

export async function signOutUser() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function onAuthStateChanged(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): Subscription {
  const supabase = getSupabaseClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);

  return subscription;
}

export async function fetchCurrentUserProfile(user: User): Promise<AppUserProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, avatar_url, status')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = (data ?? null) as UserProfileRow | null;

  if (!row) {
    return mapFallbackProfile(user);
  }

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    status: row.status,
  };
}

import type { AuthChangeEvent, Session, Subscription, User } from '@supabase/supabase-js';

import type { AppAuthSession, AppUserProfile, AuthErrorCode } from '@/features/auth/types';
import { getSupabaseClient } from '@/services/supabase/client';

type UserProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: string;
};

export type AppAuthChangeEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'PASSWORD_RECOVERY'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED';

export class AppAuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AppAuthError';
    this.code = code;
  }
}

function mapAppSession(user: User): AppAuthSession {
  return {
    userId: user.id,
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
    provider:
      typeof user.app_metadata?.provider === 'string' ? user.app_metadata.provider : null,
  };
}

function mapFallbackProfile(session: AppAuthSession): AppUserProfile {
  return {
    id: session.userId,
    email: session.email,
    displayName: session.displayName,
    avatarUrl: session.avatarUrl,
    status: 'active',
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeCode(token: string) {
  return token.trim();
}

function resolveMessage(
  error: unknown,
  fallbackCode: AuthErrorCode,
  fallbackMessage: string,
): AppAuthError {
  const providerMessage =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (providerMessage.includes('rate limit')) {
    return new AppAuthError(
      'rate_limited',
      'Too many attempts. Please wait a little and try again.',
    );
  }

  if (providerMessage.includes('verification code') || providerMessage.includes('token')) {
    return new AppAuthError('invalid_code', 'The sign-in code is invalid or expired.');
  }

  if (providerMessage.includes('email')) {
    return new AppAuthError('invalid_email', 'Please enter a valid email address.');
  }

  return new AppAuthError(fallbackCode, fallbackMessage);
}

export async function sendEmailOtp(email: string) {
  const supabase = getSupabaseClient();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new AppAuthError('invalid_email', 'Email is required.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw resolveMessage(error, 'sign_in_failed', 'Unable to send a sign-in code right now.');
  }
}

export async function verifyEmailOtp(email: string, token: string) {
  const supabase = getSupabaseClient();
  const normalizedEmail = normalizeEmail(email);
  const normalizedToken = normalizeCode(token);

  if (!normalizedEmail) {
    throw new AppAuthError('invalid_email', 'Email is required.');
  }

  if (!normalizedToken) {
    throw new AppAuthError('invalid_code', 'Verification code is required.');
  }

  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: 'email',
  });

  if (error) {
    throw resolveMessage(error, 'invalid_code', 'Unable to verify your sign-in code.');
  }
}

export async function signOutUser() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw resolveMessage(error, 'sign_out_failed', 'Unable to sign out right now.');
  }
}

export async function getCurrentSession(): Promise<AppAuthSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw resolveMessage(error, 'session_unavailable', 'Unable to load your account session.');
  }

  return data.session?.user ? mapAppSession(data.session.user) : null;
}

export function onAuthStateChanged(
  callback: (event: AppAuthChangeEvent, session: AppAuthSession | null) => void,
): Subscription {
  const supabase = getSupabaseClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    callback(event as AppAuthChangeEvent, session?.user ? mapAppSession(session.user) : null);
  });

  return subscription;
}

export async function fetchCurrentUserProfile(session: AppAuthSession): Promise<AppUserProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, avatar_url, status')
    .eq('id', session.userId)
    .maybeSingle();

  if (error) {
    throw resolveMessage(error, 'unknown', 'Unable to load your account profile.');
  }

  const row = (data ?? null) as UserProfileRow | null;

  if (!row) {
    return mapFallbackProfile(session);
  }

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    status: row.status,
  };
}

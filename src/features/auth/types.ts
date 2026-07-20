export type AppAuthSession = {
  userId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  provider: string | null;
};

export type AppUserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: 'active' | 'blocked' | 'deleted' | string;
};

export type AuthErrorCode =
  | 'invalid_email'
  | 'invalid_code'
  | 'rate_limited'
  | 'sign_in_failed'
  | 'sign_out_failed'
  | 'session_unavailable'
  | 'unknown';

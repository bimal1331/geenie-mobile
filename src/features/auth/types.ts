export type AppUserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: 'active' | 'blocked' | 'deleted' | string;
};

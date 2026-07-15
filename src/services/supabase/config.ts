function readPublicEnv(name: string, value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    throw new Error(`${name} is not configured.`);
  }

  return trimmed;
}

export function getSupabaseConfig() {
  return {
    url: readPublicEnv('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
    anonKey: readPublicEnv(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

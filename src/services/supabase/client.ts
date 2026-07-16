import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from '@/services/supabase/config';
import { authStorageAdapter } from '@/services/supabase/storage';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { url, anonKey } = getSupabaseConfig();

  supabaseClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: authStorageAdapter,
    },
  });

  return supabaseClient;
}

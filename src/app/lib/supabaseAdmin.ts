// src/app/lib/supabaseAdmin.ts
import 'server-only'; // evita que se empaquete al browser
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let supabaseAdminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (supabaseAdminClient) return supabaseAdminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // <- NO CAMBIO NOMBRE
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // <- NO CAMBIO NOMBRE

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseAdminClient;
}

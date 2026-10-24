import { createClient } from '@supabase/supabase-js';

export const AUTHORIZED_ADMIN_EMAIL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_EMAIL)
  ? import.meta.env.VITE_ADMIN_EMAIL.toLowerCase().trim()
  : 'admin@innovrush.nbkrist.org';

const STORAGE_KEY_URL = 'innovrush_supabase_url';
const STORAGE_KEY_KEY = 'innovrush_supabase_key';

export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { url: '', key: '', isConfigured: false, adminEmail: AUTHORIZED_ADMIN_EMAIL };
  }

  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  return {
    url,
    key,
    adminEmail: AUTHORIZED_ADMIN_EMAIL,
    isConfigured: Boolean(url && key && url.startsWith('http'))
  };
}

export function saveSupabaseConfig(url, key) {
  if (typeof window === 'undefined') return;
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  cachedClient = null;
}

let cachedClient = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Test connectivity with Supabase Cloud
 */
export async function testSupabaseConnection(overrideUrl, overrideKey) {
  const url = overrideUrl || getSupabaseConfig().url;
  const key = overrideKey || getSupabaseConfig().key;

  if (!url || !key) {
    return { success: false, message: 'Supabase URL and Anon Key are required.' };
  }

  try {
    const tempClient = createClient(url, key);
    const { data, error } = await tempClient.from('problems').select('problemId').limit(1);

    if (error && error.code === '42P01') {
      return {
        success: true,
        message: 'Connected to Supabase! (Tables can be created using the SQL Schema button)'
      };
    }

    if (error && error.message) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected to Supabase Cloud!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}

/**
 * Authenticate via Supabase Auth with Single-Admin Authorization Enforcement
 */
export async function supabaseAdminLogin(email, password) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const normalizedEmail = (email || '').toLowerCase().trim();
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    throw new Error(`Access Denied: Only the designated single administrator (${AUTHORIZED_ADMIN_EMAIL}) is authorized.`);
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password
  });

  if (error) {
    throw error;
  }

  if (!data?.user?.email || data.user.email.toLowerCase().trim() !== AUTHORIZED_ADMIN_EMAIL) {
    await client.auth.signOut();
    throw new Error('Access Denied: User account is not the authorized single administrator.');
  }

  return data;
}

/**
 * Sign-ups are permanently disabled for all users
 */
export async function supabaseSignUp() {
  throw new Error('Public registration is strictly disabled. Only the designated single administrator is permitted.');
}

/**
 * Sync data table to Supabase
 */
export async function syncTableToSupabase(tableName, rows) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured yet. Set credentials in Admin Settings.');
  }

  const { data, error } = await client
    .from(tableName)
    .upsert(rows, { onConflict: 'problemId' });

  if (error) throw error;
  return data;
}

/**
 * Returns PostgreSQL definitions for Supabase SQL Editor
 * Includes strict Single-Admin Row-Level Security (RLS)
 */
export function getSupabaseSchemaSQL() {
  return `-- ==============================================================
-- INNOVRUSH 2K26 · STRICT SINGLE-ADMIN SUPABASE DATABASE SCHEMA
-- Paste and Run in Supabase Dashboard -> SQL Editor
-- ==============================================================

-- 1. Problems Table
CREATE TABLE IF NOT EXISTS public.problems (
    "problemId" TEXT PRIMARY KEY,
    "domainId" TEXT NOT NULL,
    "domainName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "tagline" TEXT,
    "difficulty" TEXT NOT NULL,
    "estimatedDuration" TEXT,
    "description" TEXT,
    "problemStatement" TEXT,
    "publicationStatus" TEXT DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Constraints Table
CREATE TABLE IF NOT EXISTS public.constraints (
    "constraintId" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "publicationStatus" TEXT DEFAULT 'STAGED',
    "releasedAt" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    "id" BIGSERIAL PRIMARY KEY,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Public Read Policies (Only published problems & released constraints)
DROP POLICY IF EXISTS "Public Read Published Problems" ON public.problems;
CREATE POLICY "Public Read Published Problems" ON public.problems
    FOR SELECT USING (
        "publicationStatus" = 'PUBLISHED' OR 
        (auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}'
    );

DROP POLICY IF EXISTS "Public Read Released Constraints" ON public.constraints;
CREATE POLICY "Public Read Released Constraints" ON public.constraints
    FOR SELECT USING (
        "publicationStatus" = 'RELEASED' OR 
        (auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}'
    );

-- 6. STRICT SINGLE-ADMIN WRITE POLICIES
-- Only the single authorized administrator can insert, update, or delete.
DROP POLICY IF EXISTS "Single Admin Full Control Problems" ON public.problems;
CREATE POLICY "Single Admin Full Control Problems" ON public.problems
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}')
    WITH CHECK ((auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}');

DROP POLICY IF EXISTS "Single Admin Full Control Constraints" ON public.constraints;
CREATE POLICY "Single Admin Full Control Constraints" ON public.constraints
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}')
    WITH CHECK ((auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}');

DROP POLICY IF EXISTS "Single Admin Full Control Audit" ON public.audit_logs;
CREATE POLICY "Single Admin Full Control Audit" ON public.audit_logs
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}')
    WITH CHECK ((auth.jwt() ->> 'email') = '${AUTHORIZED_ADMIN_EMAIL}');
`;
}

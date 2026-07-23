// Supabase client for server-side operations
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

// Lazy proxy: the client is only created on first actual use, so importing
// this module (e.g. during build-time page data collection) never throws
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getClient() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

// Type definitions matching our database schema
export type DocumentRecord = {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  checksum: string;
  chunk_count: number;
  upload_date: string;
  last_modified: string;
  processed_at: string;
  metadata: Record<string, any>;
};

export type DocumentChunk = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  token_count: number;
  metadata: Record<string, any>;
};

export type MatchDocumentChunksResult = {
  filename: string;
  content: string;
  chunk_index: number;
  similarity: number;
};

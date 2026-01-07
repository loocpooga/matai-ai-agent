// Supabase client for server-side operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
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

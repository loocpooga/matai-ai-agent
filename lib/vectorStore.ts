// Supabase-backed vector store with pgvector
// Documents are ingested via n8n workflow from Google Drive

import OpenAI from "openai";
import { supabase } from "./supabase";

export type Document = {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    page?: number;
    timestamp: number;
  };
};

class SupabaseVectorStore {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Create embedding using OpenAI
  private async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }

  // Search for relevant documents using Supabase vector similarity
  async search(query: string, topK: number = 3): Promise<Document[]> {
    try {
      const count = await this.getCount();
      console.log(`🔍 Search query: "${query}" (${count} docs in Supabase)`);

      if (count === 0) {
        console.log("⚠️  No documents in Supabase!");
        return [];
      }

      // Generate embedding for the query
      const queryEmbedding = await this.createEmbedding(query);

      // Call Supabase RPC function for vector similarity search
      const { data, error } = await supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: topK,
      });

      if (error) {
        console.error('❌ Supabase search error:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('⚠️  No matching documents found');
        return [];
      }

      // Transform Supabase results to Document format
      const results: Document[] = data.map((chunk: any) => ({
        id: chunk.id || `chunk_${chunk.chunk_index}`,
        content: chunk.content,
        embedding: [], // Don't return embeddings to save bandwidth
        metadata: {
          source: chunk.filename,
          page: chunk.chunk_index,
          timestamp: Date.now(),
        },
      }));

      console.log(`✓ Found ${results.length} relevant docs (top similarity: ${data[0]?.similarity?.toFixed(3)})`);

      return results;
    } catch (error) {
      console.error('❌ Error searching Supabase:', error);
      return [];
    }
  }

  // Get document count from Supabase
  async getCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Error getting document count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Error querying Supabase:', error);
      return 0;
    }
  }

  // Get all documents (for admin purposes)
  async getAllDocuments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error querying Supabase:', error);
      return [];
    }
  }

  // Note: Documents are now added via n8n workflow, not through the app
  // This method is kept for backward compatibility but does nothing
  async addDocument(content: string, metadata: { source: string; page?: number }) {
    console.log('⚠️  addDocument() is deprecated. Documents are now added via n8n workflow from Google Drive.');
    return null;
  }

  // Clear is disabled - use Supabase dashboard to manage documents
  clear() {
    console.log('⚠️  clear() is disabled. Manage documents via Supabase dashboard or n8n workflow.');
  }
}

// Use Node.js global to persist across Next.js hot reloads
declare global {
  var vectorStore: SupabaseVectorStore | undefined;
}

export function getVectorStore(): SupabaseVectorStore {
  if (!global.vectorStore) {
    console.log("🔄 Creating new Supabase vector store instance");
    global.vectorStore = new SupabaseVectorStore();
  }
  return global.vectorStore;
}

-- Matai RAG Supabase Schema
-- This script sets up the complete database schema for the RAG system
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Enable pgvector extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 2. Create tables
-- ============================================

-- Documents table: Track uploaded files and metadata
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_path TEXT, -- Google Drive file ID or path
    file_size INTEGER,
    mime_type TEXT DEFAULT 'text/plain',
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    chunk_count INTEGER DEFAULT 0,
    processed_at TIMESTAMPTZ,
    checksum TEXT, -- MD5 hash to detect file changes
    metadata JSONB DEFAULT '{}', -- Flexible metadata storage
    CONSTRAINT unique_file_path UNIQUE(file_path)
);

-- Document chunks table: Store text chunks with embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL, -- Order of chunk in document
    content TEXT NOT NULL, -- The actual text chunk
    embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small
    token_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}', -- Store page numbers, section titles, etc.
    CONSTRAINT unique_document_chunk UNIQUE(document_id, chunk_index)
);

-- ============================================
-- 3. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date DESC);

-- Vector similarity search index (HNSW for fast approximate search)
-- This is the key index for fast vector similarity queries
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================
-- 4. Create functions
-- ============================================

-- Function: Cosine similarity search
-- This is the main function used by the Next.js app to search for relevant documents
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    chunk_index INTEGER,
    similarity FLOAT,
    filename TEXT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        dc.chunk_index,
        1 - (dc.embedding <=> query_embedding) AS similarity,
        d.filename,
        dc.metadata
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function: Get document statistics
CREATE OR REPLACE FUNCTION get_document_stats()
RETURNS TABLE (
    total_documents BIGINT,
    total_chunks BIGINT,
    latest_upload TIMESTAMPTZ,
    total_size_mb FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT d.id)::BIGINT,
        COUNT(dc.id)::BIGINT,
        MAX(d.upload_date),
        COALESCE(SUM(d.file_size)::FLOAT / 1048576, 0)
    FROM documents d
    LEFT JOIN document_chunks dc ON d.id = dc.document_id;
END;
$$;

-- Function: Check if document already processed (by checksum)
CREATE OR REPLACE FUNCTION is_document_processed(file_checksum TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    doc_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM documents WHERE checksum = file_checksum
    ) INTO doc_exists;
    RETURN doc_exists;
END;
$$;

-- ============================================
-- 5. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
-- n8n and Next.js will use service role key, which bypasses RLS by default
-- These policies are for any future anon key usage

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all access for service role" ON documents;
DROP POLICY IF EXISTS "Enable all access for service role" ON document_chunks;

-- Create new policies
CREATE POLICY "Enable all access for service role" ON documents
    FOR ALL TO service_role USING (true);

CREATE POLICY "Enable all access for service role" ON document_chunks
    FOR ALL TO service_role USING (true);

-- ============================================
-- 6. Grant permissions
-- ============================================
GRANT ALL ON documents TO postgres, service_role;
GRANT ALL ON document_chunks TO postgres, service_role;
GRANT EXECUTE ON FUNCTION match_document_chunks TO postgres, service_role;
GRANT EXECUTE ON FUNCTION get_document_stats TO postgres, service_role;
GRANT EXECUTE ON FUNCTION is_document_processed TO postgres, service_role;

-- ============================================
-- Schema setup complete!
-- ============================================
-- You can now test the functions with sample data

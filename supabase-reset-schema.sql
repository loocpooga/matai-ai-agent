-- Clean slate: Drop existing tables and recreate
-- Run this if you need to reset the database schema

-- Drop existing tables (this will delete all data)
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS match_document_chunks CASCADE;
DROP FUNCTION IF EXISTS get_document_stats CASCADE;
DROP FUNCTION IF EXISTS is_document_processed CASCADE;

-- Now run the main schema file (supabase-schema.sql)

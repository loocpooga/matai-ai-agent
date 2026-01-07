-- Test script for Supabase schema
-- Run this to verify all tables and functions work correctly

-- ============================================
-- 1. Insert a test document
-- ============================================
INSERT INTO documents (filename, file_path, file_size, checksum, chunk_count)
VALUES ('test-document.txt', 'test-123', 1024, 'abc123def456', 2)
RETURNING *;

-- ============================================
-- 2. Get the document ID (you'll see it in the results above)
-- Replace 'your-document-id' with the actual UUID from the previous query
-- ============================================

-- For now, let's insert chunks using a subquery to get the document ID
INSERT INTO document_chunks (document_id, chunk_index, content, embedding, token_count, metadata)
SELECT
    id,
    0,
    'This is the first test chunk of content about artificial intelligence and machine learning.',
    array_fill(0.1, ARRAY[1536])::vector,
    15,
    '{"page": 1}'::jsonb
FROM documents
WHERE file_path = 'test-123'
RETURNING *;

INSERT INTO document_chunks (document_id, chunk_index, content, embedding, token_count, metadata)
SELECT
    id,
    1,
    'This is the second test chunk discussing natural language processing and embeddings.',
    array_fill(0.2, ARRAY[1536])::vector,
    12,
    '{"page": 2}'::jsonb
FROM documents
WHERE file_path = 'test-123'
RETURNING *;

-- ============================================
-- 3. Test the similarity search function
-- ============================================
-- Search for documents similar to our query embedding
SELECT
    filename,
    content,
    chunk_index,
    similarity
FROM match_document_chunks(
    array_fill(0.15, ARRAY[1536])::vector,  -- Query embedding (similar to our test data)
    0.0,  -- Low threshold to ensure we get results
    5     -- Return top 5 matches
);

-- ============================================
-- 4. Test the stats function
-- ============================================
SELECT * FROM get_document_stats();

-- ============================================
-- 5. Test the duplicate check function
-- ============================================
SELECT is_document_processed('abc123def456') as is_processed;
SELECT is_document_processed('nonexistent') as should_be_false;

-- ============================================
-- 6. Verify tables and data
-- ============================================
-- View all documents
SELECT * FROM documents;

-- View all chunks
SELECT
    dc.id,
    d.filename,
    dc.chunk_index,
    dc.content,
    dc.token_count
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id;

-- ============================================
-- Test complete!
-- If you see results for all queries above, your database is ready!
-- ============================================

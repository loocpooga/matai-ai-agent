import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiqyqdwbkqundbsfmzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if chunks have embeddings
const { data: chunks, error: chunksError } = await supabase
  .from('document_chunks')
  .select('id, document_id, content, embedding')
  .limit(5);

console.log('\n=== CHECKING EMBEDDINGS ===');
if (chunksError) {
  console.error('Error:', chunksError);
} else {
  chunks.forEach((chunk, idx) => {
    const hasEmbedding = chunk.embedding && chunk.embedding.length > 0;
    console.log(`\nChunk ${idx + 1}:`);
    console.log(`  Content: ${chunk.content.substring(0, 100)}...`);
    console.log(`  Has embedding: ${hasEmbedding}`);
    if (hasEmbedding) {
      console.log(`  Embedding dimensions: ${chunk.embedding.length}`);
    }
  });
}

// Try the RPC function with a dummy embedding
console.log('\n=== TESTING RPC FUNCTION ===');
const dummyEmbedding = Array(1536).fill(0.1);
const { data: results, error: rpcError } = await supabase.rpc('match_document_chunks', {
  query_embedding: dummyEmbedding,
  match_threshold: 0.0,
  match_count: 5,
});

if (rpcError) {
  console.error('RPC Error:', rpcError);
} else {
  console.log(`Found ${results.length} results`);
  results.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.filename} (chunk ${result.chunk_index})`);
    console.log(`   Similarity: ${result.similarity}`);
    console.log(`   Content: ${result.content.substring(0, 100)}...`);
  });
}

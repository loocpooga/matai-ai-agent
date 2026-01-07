import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  'https://hiqyqdwbkqundbsfmzgp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI'
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate embedding for the query
const query = 'what packages does matai tech offer?';
console.log('Query:', query);

const embeddingResponse = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: query
});

const queryEmbedding = embeddingResponse.data[0].embedding;
console.log('Generated embedding with', queryEmbedding.length, 'dimensions\n');

// Search for similar chunks
const { data: chunks, error } = await supabase.rpc('match_document_chunks', {
  query_embedding: queryEmbedding,
  match_threshold: 0.3,
  match_count: 5
});

if (error) {
  console.error('Error searching:', error);
} else {
  console.log(`Found ${chunks?.length || 0} matching chunks:\n`);
  chunks?.forEach((chunk, i) => {
    console.log(`${i + 1}. Similarity: ${chunk.similarity.toFixed(3)}`);
    console.log(`   Chunk ID: ${chunk.id}`);
    console.log(`   Document ID: ${chunk.document_id}`);
    console.log(`   Metadata:`, chunk.metadata);
    console.log(`   Content (first 300 chars):`);
    console.log(`   ${chunk.content.substring(0, 300)}...`);
    console.log('');
  });

  // Now check what the actual document filenames are
  console.log('\n--- Checking actual document names ---');
  const docIds = [...new Set(chunks.map(c => c.document_id))];
  const { data: docs } = await supabase
    .from('documents')
    .select('id, filename')
    .in('id', docIds);

  console.log('Documents referenced:');
  docs.forEach(doc => {
    console.log(`  - ${doc.filename} (ID: ${doc.id})`);
  });
}

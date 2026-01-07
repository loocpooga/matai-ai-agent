import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = 'https://hiqyqdwbkqundbsfmzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI';
const openaiKey = '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';

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

// Generate embedding for the query
console.log('Generating embedding for query: "what is the pricing for the starter package?"');
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'what is the pricing for the starter package?',
});

const queryEmbedding = response.data[0].embedding;
console.log(`Embedding generated: ${queryEmbedding.length} dimensions`);

// Test the RPC function
console.log('\nCalling match_document_chunks with threshold 0.5...');
const { data, error } = await supabase.rpc('match_document_chunks', {
  query_embedding: queryEmbedding,
  match_threshold: 0.5,
  match_count: 3,
});

if (error) {
  console.error('Error:', error);
} else {
  console.log(`\nFound ${data.length} results:`);
  data.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.filename} (chunk ${result.chunk_index})`);
    console.log(`   Similarity: ${result.similarity}`);
    console.log(`   Content: ${result.content.substring(0, 100)}...`);
  });
}

// Try with lower threshold
console.log('\n\n--- Trying with threshold 0.0 (show all) ---');
const { data: data2, error: error2 } = await supabase.rpc('match_document_chunks', {
  query_embedding: queryEmbedding,
  match_threshold: 0.0,
  match_count: 3,
});

if (error2) {
  console.error('Error:', error2);
} else {
  console.log(`\nFound ${data2.length} results:`);
  data2.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.filename} (chunk ${result.chunk_index})`);
    console.log(`   Similarity: ${result.similarity}`);
    console.log(`   Content: ${result.content.substring(0, 100)}...`);
  });
}

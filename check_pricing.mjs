import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiqyqdwbkqundbsfmzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get pricing.txt document
const { data: pricingDocs, error: docError } = await supabase
  .from('documents')
  .select('*')
  .eq('filename', 'pricing.txt');

console.log('\n=== PRICING.TXT DOCUMENT ===');
if (docError) {
  console.error('Error:', docError);
} else if (pricingDocs.length === 0) {
  console.log('No pricing.txt document found!');
} else {
  const doc = pricingDocs[0];
  console.log(`ID: ${doc.id}`);
  console.log(`Filename: ${doc.filename}`);
  console.log(`Chunk count: ${doc.chunk_count}`);
  console.log(`Upload date: ${doc.upload_date}`);

  // Now get the chunks for this document
  const { data: chunks, error: chunkError } = await supabase
    .from('document_chunks')
    .select('*')
    .eq('document_id', doc.id);

  console.log('\n=== CHUNKS FOR PRICING.TXT ===');
  if (chunkError) {
    console.error('Error:', chunkError);
  } else {
    console.log(`Found ${chunks.length} chunks`);
    chunks.forEach((chunk, idx) => {
      console.log(`\nChunk ${idx}:`);
      console.log(`  Index: ${chunk.chunk_index}`);
      console.log(`  Content: ${chunk.content}`);
      console.log(`  Has embedding: ${chunk.embedding && chunk.embedding.length > 0}`);
      if (chunk.embedding) {
        console.log(`  Embedding length: ${chunk.embedding.length}`);
      }
    });
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiqyqdwbkqundbsfmzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Check documents
const { data: docs, error: docsError } = await supabase
  .from('documents')
  .select('*');

console.log('\n=== DOCUMENTS TABLE ===');
if (docsError) {
  console.error('Error:', docsError);
} else {
  console.log(`Total documents: ${docs.length}`);
  docs.forEach(doc => {
    console.log(`- ${doc.filename} (${doc.chunk_count} chunks, uploaded: ${doc.upload_date})`);
  });
}

// Check chunks
const { data: chunks, error: chunksError } = await supabase
  .from('document_chunks')
  .select('id, content', { count: 'exact' })
  .limit(3);

console.log('\n=== DOCUMENT_CHUNKS TABLE ===');
if (chunksError) {
  console.error('Error:', chunksError);
} else {
  console.log(`Total chunks: ${chunks.length}`);
  if (chunks.length > 0) {
    console.log('\nFirst chunk preview:');
    console.log(chunks[0].content.substring(0, 200) + '...');
  }
}

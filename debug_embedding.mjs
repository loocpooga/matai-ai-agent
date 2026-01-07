import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiqyqdwbkqundbsfmzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get one chunk
const { data: chunks, error } = await supabase
  .from('document_chunks')
  .select('embedding')
  .limit(1);

if (error) {
  console.error('Error:', error);
} else if (chunks.length > 0) {
  const embedding = chunks[0].embedding;
  console.log('Type:', typeof embedding);
  console.log('Is Array:', Array.isArray(embedding));

  if (typeof embedding === 'string') {
    console.log('String length:', embedding.length);
    console.log('First 100 chars:', embedding.substring(0, 100));
    // Try to parse it
    try {
      const parsed = JSON.parse(embedding);
      console.log('Parsed array length:', parsed.length);
      console.log('First 5 values:', parsed.slice(0, 5));
    } catch (e) {
      console.log('Not valid JSON');
    }
  } else if (Array.isArray(embedding)) {
    console.log('Array length:', embedding.length);
    console.log('First 5 values:', embedding.slice(0, 5));
  } else {
    console.log('Unknown type:', embedding);
  }
}

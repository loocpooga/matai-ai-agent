import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiqyqdwbkqundbsfmzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Delete pricing.txt document (will cascade delete chunks if any)
const { data, error } = await supabase
  .from('documents')
  .delete()
  .eq('filename', 'pricing.txt');

if (error) {
  console.error('Error deleting:', error);
} else {
  console.log('✓ Deleted pricing.txt document');
}

// Also clean up the test documents with dummy embeddings
const { data: testData, error: testError } = await supabase
  .from('documents')
  .delete()
  .eq('filename', 'test-document.txt');

if (testError) {
  console.error('Error deleting test doc:', testError);
} else {
  console.log('✓ Deleted test-document.txt');
}

console.log('\n✓ Database cleaned. Ready for fresh workflow run.');

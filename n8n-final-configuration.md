# Final n8n Workflow Configuration

You've already completed the Google Drive OAuth setup! Now let's finish configuring the workflow.

**Workflow URL:** https://lukepauga.app.n8n.cloud/workflow/8kKlNvJh5HSskV9s

---

## Remaining Configuration Steps

### 1. Configure Google Drive - List Files Node

1. Open your workflow: https://lukepauga.app.n8n.cloud/workflow/8kKlNvJh5HSskV9s
2. Click on the **"Google Drive - List Files"** node
3. Make sure these settings are correct:
   - **Credential:** Select "Google Drive - Matai RAG" (or whatever you named it)
   - **Resource:** "File"
   - **Operation:** "Search" or "List"
   - **Folder ID:** Enter: `1fofLBTBEp-UusLt5enUKI2_AtOTbg5Ld`
   - **Filters → Query:** Add filter for .txt files
     - You can use `name contains '.txt'` or set up a filter

4. Save the node

### 2. Configure Google Drive - Download File Node

1. Click on the **"Google Drive - Download File"** node
2. **Credential:** Select "Google Drive - Matai RAG"
3. **File ID:** Should already be set to `={{ $json.fileId }}`
4. **Binary Property:** `fileData`
5. Save the node

---

## Add Environment Variables (IMPORTANT!)

The Code nodes need environment variables to connect to Supabase. You have two options:

### Option A: Use n8n Environment Variables (Recommended)

If your n8n instance supports environment variables:
1. Go to n8n Settings or Workflow Settings
2. Add these variables:
   - `SUPABASE_URL` = `https://hiqyqdwbkqundbsfmzgp.supabase.co`
   - `SUPABASE_SERVICE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI`

### Option B: Hardcode in Code Nodes (Less Secure)

If you can't set environment variables, you'll need to edit these nodes:

**Edit "Filter Unprocessed Files" node:**
1. Click on the node
2. Find the lines:
   ```javascript
   const supabaseUrl = $env.SUPABASE_URL;
   const supabaseKey = $env.SUPABASE_SERVICE_KEY;
   ```
3. Replace with:
   ```javascript
   const supabaseUrl = 'https://hiqyqdwbkqundbsfmzgp.supabase.co';
   const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI';
   ```

**Edit "Supabase - Insert Chunks" node:**
1. Click on the node
2. Find the same lines and replace the same way

---

## Configure OpenAI Credentials

1. In n8n, go to **Credentials**
2. Click **"Add Credential"**
3. Search for **"OpenAI"**
4. Enter your API key: `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`
5. Save it
6. Go back to the workflow
7. Click on **"OpenAI - Generate Embeddings"** node
8. Assign the OpenAI credential you just created

---

## Configure Supabase Credentials

1. In n8n, go to **Credentials**
2. Click **"Add Credential"**
3. Search for **"Supabase"**
4. Enter:
   - **Host:** `https://hiqyqdwbkqundbsfmzgp.supabase.co`
   - **Service Role Secret:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI`
5. Save it
6. Go back to the workflow
7. Click on **"Supabase - Insert Document"** node
8. Assign the Supabase credential

---

## Optional: Configure Email Notifications

If you want error notifications via email:

1. Go to **Credentials** → **Add Credential**
2. Search for **"SMTP"**
3. Enter your email provider settings (Gmail, Outlook, etc.)
4. Save it
5. Go to workflow → Click **"Send Error Email"** node
6. Assign SMTP credential
7. Update the "To Email" field to your email address

**OR** if you don't want email notifications:
- Simply **delete** the "Send Error Email" node

---

## Testing the Workflow

### 1. Create a Test File

Create a simple text file with some content:

```text
This is a test document for the Matai RAG system.
It contains information about Matai Tech, a business automation consultancy.
We help companies streamline their operations using AI and automation.
```

Save it as `test-document.txt`

### 2. Upload to Google Drive

1. Go to your "Matai RAG Documents" folder in Google Drive
2. Upload the `test-document.txt` file

### 3. Manually Test the Workflow

1. Open the workflow in n8n
2. Click **"Test workflow"** button at the bottom
3. Click **"Execute workflow"** (or the play button on the Schedule trigger node)
4. Watch the execution - all nodes should turn green if successful

### 4. Verify in Supabase

1. Go to your Supabase dashboard
2. Click **"Table Editor"**
3. Check the **documents** table - your test document should appear
4. Check the **document_chunks** table - you should see multiple chunks with embeddings

---

## Activate the Workflow

Once testing is successful:

1. In the workflow, toggle the **"Active"** switch at the top
2. The workflow will now run every 15 minutes automatically
3. Any new .txt files you add to the Google Drive folder will be processed

---

## Troubleshooting

### "Cannot read properties of undefined"
- Check that all credentials are assigned to the correct nodes
- Verify environment variables are set

### "Invalid API key" (OpenAI)
- Check that the OpenAI credential has the correct API key
- Verify the key is still valid in your OpenAI account

### "Unauthorized" (Supabase)
- Check that the Supabase service role key is correct
- Verify it's the SERVICE role key, not the anon key

### "File not found" (Google Drive)
- Verify the folder ID is correct
- Check that the Google Drive credential is authenticated
- Make sure .txt files exist in the folder

---

## Next Steps

After the workflow is working:
1. Upload your actual Matai Tech documents to the Google Drive folder
2. Let the workflow process them (or trigger manually)
3. Verify all documents appear in Supabase
4. Then we'll update the Next.js app to use Supabase!

---

**Need help?** Check the n8n execution logs for detailed error messages.

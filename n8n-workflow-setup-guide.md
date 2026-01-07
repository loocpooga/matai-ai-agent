# n8n Workflow Setup Guide
## Matai RAG - Document Ingestion Pipeline

**Workflow ID:** `8kKlNvJh5HSskV9s`
**Workflow URL:** https://lukepauga.app.n8n.cloud/workflow/8kKlNvJh5HSskV9s

---

## Configuration Checklist

The workflow has been created, but you need to configure the following in your n8n dashboard:

### 1. Google Drive Credentials

**Nodes requiring this:**
- "Google Drive - List Files"
- "Google Drive - Download File"

**Steps:**
1. Go to your n8n dashboard → Credentials
2. Click "Add Credential" → Search for "Google Drive OAuth2"
3. Follow the OAuth setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create/select a project
   - Enable Google Drive API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://lukepauga.app.n8n.cloud/rest/oauth2-credential/callback`
   - Copy Client ID and Secret to n8n
4. Save and authenticate
5. Open the workflow and assign this credential to both Google Drive nodes

### 2. Google Drive Folder Setup

**Node:** "Google Drive - List Files"

**Steps:**
1. Create a new folder in your Google Drive called: **"Matai RAG Documents"**
2. Open the folder and copy its ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part
3. In n8n workflow, open "Google Drive - List Files" node
4. Set the "Folder" field to your folder ID
5. Verify the filter is set to `*.txt` (text files only)

### 3. OpenAI Credentials

**Node:** "OpenAI - Generate Embeddings"

**Steps:**
1. Go to n8n → Credentials → Add Credential
2. Search for "OpenAI"
3. Enter your API key: `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`
4. Save the credential
5. Assign it to the "OpenAI - Generate Embeddings" node

### 4. Supabase Credentials

**Node:** "Supabase - Insert Document"

**Steps:**
1. Go to n8n → Credentials → Add Credential
2. Search for "Supabase"
3. Enter:
   - **Host:** `https://hiqyqdwbkqundbsfmzgp.supabase.co`
   - **Service Role Secret:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI`
4. Save the credential
5. Assign it to "Supabase - Insert Document" node

### 5. Environment Variables (Code Nodes)

**Nodes using env vars:**
- "Filter Unprocessed Files"
- "Supabase - Insert Chunks"

**Steps:**
1. Go to n8n → Settings → Environments (or workflow settings)
2. Add these environment variables:
   - `SUPABASE_URL`: `https://hiqyqdwbkqundbsfmzgp.supabase.co`
   - `SUPABASE_SERVICE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcXlxZHdia3F1bmRic2ZtemdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3NzY1NywiZXhwIjoyMDgzMjUzNjU3fQ.4yIp7uaiVZYGRlqj9JpuvsMgGd3WZNfpL_ksI23ZhWI`

**Note:** If n8n doesn't have a UI for environment variables, you can hardcode them in the Code nodes, but this is less secure.

### 6. Email Notifications (Optional but Recommended)

**Node:** "Send Error Email"

**Steps:**
1. Go to n8n → Credentials → Add Credential
2. Search for "SMTP"
3. Enter your email provider settings:
   - **Gmail example:**
     - Host: `smtp.gmail.com`
     - Port: `465`
     - User: `your-email@gmail.com`
     - Password: App password (create in Gmail settings)
     - Secure: Yes (SSL/TLS)
4. Save the credential
5. Open "Send Error Email" node and:
   - Assign the SMTP credential
   - Update "To Email" to your email address
   - Update "From Email" if needed

**Alternative:** If you don't want email notifications, you can delete the "Send Error Email" node.

---

## Testing the Workflow

### Pre-Test Checklist
- [ ] All credentials configured
- [ ] Google Drive folder created and ID set
- [ ] Environment variables added
- [ ] Email notification configured (or node deleted)

### Test Steps

1. **Upload a test file to Google Drive**
   - Create a simple .txt file with some content
   - Upload it to your "Matai RAG Documents" folder

2. **Manually trigger the workflow**
   - Go to workflow in n8n
   - Click "Test workflow" or "Execute workflow" button
   - Watch the execution in real-time

3. **Verify results**
   - Check that all nodes turn green (success)
   - Go to Supabase → Table Editor → documents
   - Verify your test document appears
   - Check document_chunks table for the chunks

4. **Check for errors**
   - If any node fails, click on it to see the error
   - Common issues:
     - Missing credentials
     - Google Drive folder ID incorrect
     - Supabase credentials wrong
     - OpenAI API key invalid

### Enable Scheduled Execution

Once testing is successful:
1. In the workflow, click "Active" toggle in top right
2. The workflow will now run every 15 minutes automatically
3. Any new files in the Google Drive folder will be processed

---

## Workflow Architecture

```
1. Schedule Trigger (15 min)
   ↓
2. Google Drive - List Files (*.txt)
   ↓
3. Filter Unprocessed (check Supabase by checksum)
   ↓
4. Loop Over Files (process one at a time)
   ↓
5. Download File
   ↓
6. Chunk Text (1000 chars, 200 overlap)
   ↓
7. OpenAI Embeddings (text-embedding-3-small)
   ↓
8. Prepare Supabase Data
   ↓
9. Insert Document Record
   ↓
10. Insert Chunks (bulk insert)
   ↓
11. Check Success
   ↓
12. Send Error Email (if failed)
```

---

## Monitoring

**View Executions:**
- n8n → Executions tab
- Filter by workflow name
- See success/failure status
- View detailed logs

**Database Checks:**
```sql
-- Check recent documents
SELECT * FROM documents ORDER BY upload_date DESC LIMIT 10;

-- Check processing stats
SELECT * FROM get_document_stats();

-- Check specific document chunks
SELECT d.filename, COUNT(dc.id) as chunk_count
FROM documents d
LEFT JOIN document_chunks dc ON d.id = dc.document_id
GROUP BY d.id, d.filename
ORDER BY d.upload_date DESC;
```

---

## Troubleshooting

### Issue: "No files found"
- Check Google Drive folder ID is correct
- Ensure folder contains .txt files
- Verify Google Drive credentials are authorized

### Issue: "Duplicate key violation"
- File already exists in database
- Check if checksum matching is working
- May need to manually delete old record

### Issue: "OpenAI rate limit"
- You're processing too many chunks too fast
- Add a delay node between batches
- Or reduce batch size in Loop node

### Issue: "Supabase insert fails"
- Check service key is correct
- Verify environment variables are set
- Check Supabase table structure matches schema

### Issue: "Email not sending"
- Verify SMTP credentials
- Check firewall/security settings
- Try a different email provider

---

## Next Steps

After workflow is working:
1. Upload your actual Matai Tech documents to the Google Drive folder
2. Let the workflow process them (or trigger manually)
3. Verify documents appear in Supabase
4. Test the Next.js chat interface with the new data
5. Monitor for any errors over the first few days

---

## Security Notes

- **Service Role Key:** Keep this secret! It has full database access
- **OpenAI API Key:** Monitor usage to avoid unexpected charges
- **Google Drive:** Consider using a service account instead of personal OAuth
- **Environment Variables:** Don't commit these to Git

---

**Questions?** Check the n8n execution logs or Supabase logs for detailed error messages.

# Google Drive OAuth Setup for n8n

Follow these steps to create OAuth credentials for your n8n workflow.

---

## Part 1: Google Cloud Console Setup

### Step 1: Go to Google Cloud Console

Open: https://console.cloud.google.com/

### Step 2: Create or Select a Project

1. Click the project dropdown at the top (next to "Google Cloud")
2. Click "NEW PROJECT" button
3. **Project Name:** "Matai RAG n8n Integration" (or any name you prefer)
4. Click "CREATE"
5. Wait for the project to be created (takes ~10 seconds)
6. Make sure your new project is selected in the dropdown

### Step 3: Enable Google Drive API

1. In the left sidebar, go to: **APIs & Services** → **Library**
   - Or use this direct link: https://console.cloud.google.com/apis/library
2. Search for: "Google Drive API"
3. Click on "Google Drive API" in the results
4. Click the blue "ENABLE" button
5. Wait for it to enable (~5-10 seconds)

### Step 4: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
   - Or use this link: https://console.cloud.google.com/apis/credentials/consent
2. Select **External** (unless you have a Google Workspace account)
3. Click "CREATE"

**Fill out the form:**

**App information:**
- **App name:** "Matai RAG Document Processor"
- **User support email:** Your email address (select from dropdown)
- **App logo:** (Optional - skip for now)

**App domain:** (Optional - can leave blank)
- Skip all three fields (Authorized domains, Homepage, Privacy policy, Terms of service)

**Developer contact information:**
- **Email addresses:** Your email address

4. Click "SAVE AND CONTINUE"

**Scopes page:**
5. Click "ADD OR REMOVE SCOPES"
6. In the filter box, type: "drive.readonly"
7. Check the box for: `https://www.googleapis.com/auth/drive.readonly`
   - Shows as: "See and download all your Google Drive files"
8. Click "UPDATE" at the bottom
9. Click "SAVE AND CONTINUE"

**Test users page:** (Only if you selected "External")
10. Click "ADD USERS"
11. Enter your Google email address
12. Click "ADD"
13. Click "SAVE AND CONTINUE"

**Summary page:**
14. Review and click "BACK TO DASHBOARD"

### Step 5: Create OAuth Credentials

1. Go to: **APIs & Services** → **Credentials**
   - Or use this link: https://console.cloud.google.com/apis/credentials
2. Click "CREATE CREDENTIALS" at the top
3. Select "OAuth client ID"

**Configure OAuth client:**
4. **Application type:** Select "Web application"
5. **Name:** "n8n Google Drive Integration"

**Authorized redirect URIs:**
6. Click "ADD URI"
7. Enter exactly: `https://lukepauga.app.n8n.cloud/rest/oauth2-credential/callback`
8. Click "CREATE"

**Save your credentials:**
9. A popup will appear with your credentials
10. **Copy and save these somewhere safe:**
   - **Client ID:** (looks like: `xxxxx.apps.googleusercontent.com`)
   - **Client Secret:** (random string)

**Important:** Keep these safe! You'll need them in the next step.

---

## Part 2: Add Credentials to n8n

### Step 6: Create Google Drive Credential in n8n

1. Open your n8n dashboard: https://lukepauga.app.n8n.cloud
2. Click on your profile icon (top right) → **Credentials**
   - Or go directly to: https://lukepauga.app.n8n.cloud/credentials
3. Click "Add Credential" button (top right)
4. Search for: "Google Drive OAuth2 API"
5. Click on it

**Fill in the credential form:**
- **Credential name:** "Google Drive - Matai RAG"
- **Client ID:** (paste from Google Cloud Console)
- **Client Secret:** (paste from Google Cloud Console)

6. Click "Save" at the bottom

### Step 7: Authenticate with Google

1. After saving, click "Connect my account" (or "Sign in with Google")
2. A popup will open asking you to sign in to Google
3. Select your Google account
4. You may see a warning: "Google hasn't verified this app"
   - Click "Continue" (it's safe, it's your own app)
5. Review permissions and click "Allow"
6. The popup should close and show "Connected" in n8n

**Success!** Your Google Drive OAuth is now set up.

---

## Part 3: Create Google Drive Folder

### Step 8: Create Folder for Documents

1. Go to Google Drive: https://drive.google.com
2. Click "New" → "New folder"
3. **Folder name:** "Matai RAG Documents"
4. Click "Create"

### Step 9: Get Folder ID

1. Open the folder you just created
2. Look at the URL in your browser
3. The URL will look like: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
4. Copy the `FOLDER_ID_HERE` part (everything after `/folders/`)
   - Example ID: `1a2b3c4d5e6f7g8h9i0j`

**Save this Folder ID!** You'll need it in the next step.

---

## Part 4: Configure n8n Workflow

### Step 10: Assign Credentials to Workflow Nodes

1. Go to your workflow: https://lukepauga.app.n8n.cloud/workflow/8kKlNvJh5HSskV9s
2. Click on the "Google Drive - List Files" node

**Configure the node:**
3. **Credential to connect with:** Select "Google Drive - Matai RAG" (the one you just created)
4. **Resource:** "File or Folder"
5. **Operation:** "Search"
6. **Folder:** Click the field and paste your Folder ID
7. **Filters → Name:** "*.txt"

8. Click outside the node to save

### Step 11: Assign Credentials to Download Node

9. Click on the "Google Drive - Download File" node
10. **Credential to connect with:** Select "Google Drive - Matai RAG"
11. Click outside to save

---

## ✅ Verification Checklist

Before moving on, verify:
- [ ] Google Drive API is enabled in Google Cloud Console
- [ ] OAuth consent screen is configured
- [ ] OAuth client ID created with correct redirect URI
- [ ] Credentials added to n8n and authenticated (shows "Connected")
- [ ] "Matai RAG Documents" folder created in Google Drive
- [ ] Folder ID copied and saved
- [ ] Both Google Drive nodes in workflow have credentials assigned
- [ ] Folder ID set in "Google Drive - List Files" node

---

## 🐛 Troubleshooting

### Issue: "Access blocked: This app's request is invalid"
**Solution:** Check that your redirect URI is exactly: `https://lukepauga.app.n8n.cloud/rest/oauth2-credential/callback`

### Issue: "Google hasn't verified this app" warning
**Solution:** This is normal for personal projects. Click "Advanced" → "Go to [app name] (unsafe)" → "Allow"

### Issue: "The caller does not have permission"
**Solution:** Make sure you enabled the Google Drive API in step 3

### Issue: Can't find folder in n8n node
**Solution:** Use the Folder ID (from URL), not the folder name

### Issue: "Invalid grant" error
**Solution:** Try disconnecting and reconnecting your Google account in n8n credentials

---

## 🎯 Next Steps

Once Google Drive OAuth is set up, you'll need to configure:
1. OpenAI credentials (easier - just API key)
2. Supabase credentials (we have the details)
3. Environment variables for Code nodes
4. Email notifications (optional)

Then you can test the workflow!

---

**Having issues?** Let me know which step you're stuck on and I'll help debug!

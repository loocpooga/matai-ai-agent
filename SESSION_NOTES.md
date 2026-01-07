# Session Notes - January 7, 2026
## Matai Tech RAG Chat Widget Deployment

---

## What We Built

### 1. Fixed the RAG System
**Problem**: Chat widget was returning "no information available" even though documents existed in the database.

**Root Cause**: The n8n workflow that processes documents from Google Drive had a bug in the "Chunk Text" node. It was using hardcoded `0` instead of `$itemIndex`, causing all 12 documents to have identical content (all showing common_use_cases.txt).

**Fix**: Updated the Chunk Text node code:
```javascript
// BEFORE (WRONG):
const binaryData = this.helpers.assertBinaryData(0, binaryPropertyName);
const fileBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);

// AFTER (FIXED):
const binaryData = this.helpers.assertBinaryData($itemIndex, binaryPropertyName);
const fileBuffer = await this.helpers.getBinaryDataBuffer($itemIndex, binaryPropertyName);
```

**Result**: All 12 knowledge base documents now process correctly with unique content.

---

### 2. Created Embeddable Chat Widget
**Goal**: Make the RAG-powered AI assistant available on mataitech.co website.

**Components Built**:

#### A. Widget Page (`/app/widget/page.tsx`)
- Full-screen chat interface designed to load in an iframe
- Features:
  - Welcome screen with quick-start questions
  - Markdown rendering for AI responses
  - Auto-focus input field after sending messages
  - Loading states with animated dots
  - Clean, modern UI with Matai Tech branding

#### B. Embed Script (`/public/embed.js`)
- JavaScript that can be added to any website
- Creates a blue chat bubble button in bottom-right corner
- Opens chat widget in an iframe when clicked
- Configurable position and colors
- Mobile-responsive (full screen on mobile)

#### C. Integration Component (`matai-tech-landing/app/components/MataiChatWidget.tsx`)
- React component that loads the embed script
- Added to the root layout of matai-tech-landing
- Auto-initializes on page load

---

### 3. Deployed to Production

**Two Vercel Projects**:

1. **matai-ai-agent** (https://matai-ai-agent.vercel.app)
   - The RAG system with chat API
   - Processes user questions
   - Searches Supabase vector database
   - Returns AI-generated responses with context
   - Environment variables: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

2. **matai-tech-landing** (https://mataitech.co)
   - Your marketing website
   - Loads the chat widget via iframe from matai-ai-agent
   - No API routes or environment variables needed
   - Just the embed script and component

---

## Problems Solved

### Problem 1: Markdown Not Rendering
**Issue**: AI responses showed raw markdown (e.g., `**bold**` with asterisks)

**Fix**:
- Installed `react-markdown` package
- Updated widget to render assistant messages with ReactMarkdown component
- Wrapped in a div for proper styling

### Problem 2: Source Citations Too Prominent
**Issue**: User felt source citations were distracting for clients

**Fix**: Removed source file references from the AI context and responses

### Problem 3: Input Field Lost Focus
**Issue**: After sending a message, user had to click the input field again to type

**Fix**: Added auto-focus functionality using React useRef:
```typescript
const inputRef = useRef<HTMLInputElement>(null);

// In handleSend finally block:
inputRef.current?.focus();

// On input element:
<input ref={inputRef} ... />
```

### Problem 4: Vercel Deployment Sync Issues
**Issue**: Pushing commits to GitHub wasn't triggering new Vercel deployments

**Workaround**:
- Copied embed.js directly to matai-tech-landing public folder
- Changed component to load it locally instead of from remote URL
- This avoided the GitHub sync issue entirely

### Problem 5: Environment Variables Not Loading
**Issue**: Even after adding OPENAI_API_KEY to Vercel, API calls were failing

**Fixes**:
1. Moved OpenAI client initialization inside the request handler (not at module level)
2. Added debugging to verify environment variables were loading
3. Discovered the API key in Vercel was outdated/invalid
4. Generated new OpenAI API key
5. Updated both Vercel environment variables and local .env file
6. Redeployed to pick up the new key

---

## Current System Architecture

```
User visits mataitech.co
    ↓
MataiChatWidget component loads
    ↓
Creates embed.js script tag (local)
    ↓
embed.js creates chat bubble button
    ↓
User clicks bubble
    ↓
Opens iframe pointing to:
https://matai-ai-agent.vercel.app/widget
    ↓
User types question
    ↓
POST /api/chat with message history
    ↓
1. Convert question to embedding (OpenAI)
2. Search Supabase pgvector for top 3 relevant chunks
3. Build context from retrieved documents
4. Send context + question to GPT-4o-mini
5. Return AI response
    ↓
Display answer in chat widget
Auto-focus input for next question
```

---

## Knowledge Base Documents (12 files)

Located in Google Drive, synced via n8n workflow:
1. company_overview.txt
2. final_pricing.txt
3. services_detailed.txt
4. process_detailed.txt
5. ideal_client_and_fit.txt
6. faq.txt
7. case_studies.txt
8. technology_stack.txt
9. objections_and_answers.txt
10. onboarding_process.txt
11. support_and_maintenance.txt
12. common_use_cases.txt

**Processing**:
- n8n workflow watches Google Drive folder
- On new/updated files: extracts text → chunks (1000 chars, 200 overlap) → embeddings → Supabase
- Documents are now correctly processed with unique content per file

---

## Tech Stack

### Frontend
- Next.js 15
- React with TypeScript
- Tailwind CSS
- react-markdown for response formatting

### Backend
- Next.js API routes
- OpenAI GPT-4o-mini (chat completions)
- OpenAI text-embedding-3-small (vector embeddings)

### Database
- Supabase (PostgreSQL with pgvector extension)
- Tables: `documents`, `document_chunks`
- Vector similarity search using cosine distance

### Automation
- n8n workflow for document ingestion
- Google Drive integration
- Automatic processing on file changes

### Deployment
- Vercel (2 projects)
- GitHub integration
- Environment variables for API keys

---

## API Keys & Environment Variables

### OpenAI
- **Key**: sk-proj-osamrAq1hr... (generated Jan 7, 2026)
- **Used for**: Chat completions + embeddings
- **Location**:
  - Vercel: matai-ai-agent environment variables
  - Local: `/Users/lukepauga/Desktop/Personal/Matai Tech/matai-rag/.env`

### Supabase
- **URL**: https://hiqyqdwbkqundbsfmzgp.supabase.co
- **Service Key**: eyJhbGciOiJIUzI1NiI...
- **Location**: Same as OpenAI (Vercel + local .env)

---

## File Structure

### matai-rag (RAG System)
```
matai-rag/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Main RAG endpoint
│   │   └── upload/route.ts        # Document upload (future)
│   ├── widget/page.tsx            # Embeddable chat interface
│   ├── page.tsx                   # Admin/testing interface
│   └── layout.tsx
├── lib/
│   ├── vectorStore.ts             # Supabase vector search
│   └── documentProcessor.ts       # Text chunking utilities
├── public/
│   └── embed.js                   # Embeddable widget script
├── text files/                    # Knowledge base documents
├── .env                           # API keys (local)
└── README.md
```

### matai-tech-landing (Marketing Site)
```
matai-tech-landing/
├── app/
│   ├── components/
│   │   └── MataiChatWidget.tsx    # Loads embed script
│   └── layout.tsx                  # Includes widget globally
├── public/
│   └── matai-chat-embed.js        # Copy of embed script
└── (rest of landing site files)
```

---

## Testing the System

### Test Questions That Work Well:
1. "What services do you offer?"
2. "How much does it cost?"
3. "How long does onboarding take?"
4. "What is your pricing structure?"
5. "Who is your ideal client?"
6. "What's your process?"

### Verification Steps:
1. Visit https://mataitech.co
2. See blue chat bubble in bottom-right corner
3. Click bubble to open chat
4. Type question and press Enter
5. AI responds with relevant information from knowledge base
6. Cursor stays in input field - can immediately type next question
7. Responses use markdown formatting (bold, lists, etc.)

---

## What's Working Now

✅ Chat widget appears on mataitech.co
✅ Opens in iframe from matai-ai-agent.vercel.app
✅ Connects to Supabase vector database
✅ Searches all 12 knowledge base documents correctly
✅ Returns accurate, context-aware responses
✅ Markdown formatting displays properly
✅ Auto-focus keeps cursor in input field
✅ Mobile responsive (full-screen on mobile)
✅ Clean, branded UI matching Matai Tech style
✅ Quick-start suggestion buttons work

---

## Deployment URLs

- **Production Website**: https://mataitech.co
- **RAG API**: https://matai-ai-agent.vercel.app
- **Widget Standalone**: https://matai-ai-agent.vercel.app/widget
- **GitHub Repos**:
  - matai-ai-agent: https://github.com/loocpooga/matai-ai-agent
  - matai-tech-landing: https://github.com/loocpooga/matai-tech-landing

---

## Next Steps (Future Enhancements)

### Short Term:
- [ ] Remove debug console.logs from chat API
- [ ] Add conversation memory (currently stateless)
- [ ] Track usage/analytics (questions asked, response quality)
- [ ] A/B test different welcome messages

### Medium Term:
- [ ] Add PDF upload support (currently only processes .txt from Google Drive)
- [ ] Implement user feedback buttons (👍👎)
- [ ] Add "Copy response" button
- [ ] Email notification when chat is used
- [ ] Admin dashboard to view conversations

### Long Term:
- [ ] Fine-tune model on Matai Tech data
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Integration with calendar for booking
- [ ] Lead capture form in chat
- [ ] CRM integration (save conversations)

---

## Important Notes

### Environment Variables
- **Critical**: API keys must be updated in BOTH Vercel and local .env
- After changing env vars in Vercel, must trigger a new deployment
- Old deployments don't automatically pick up new environment variables

### n8n Workflow
- Watches Google Drive "Matai RAG Documents" folder
- Auto-processes new or updated files within 15 minutes
- To manually trigger: Update a file or re-run the workflow in n8n

### Vector Search
- Uses cosine similarity
- Returns top 3 most relevant chunks
- Threshold: 0.3 (can be adjusted for strictness)
- Each chunk: 1000 characters with 200 character overlap

### Costs (Estimated)
- **Embeddings**: ~$0.01 per document
- **Chat**: ~$0.001 per question
- **Monthly (1000 questions)**: ~$2-3
- Supabase: Free tier (sufficient for current usage)

---

## Session Accomplishments Summary

### What We Fixed:
1. ✅ n8n workflow bug causing duplicate document content
2. ✅ Markdown rendering in chat responses
3. ✅ Input field auto-focus after messages
4. ✅ Removed distracting source citations
5. ✅ Deployed widget to production website
6. ✅ Fixed OpenAI API key authentication

### What We Built:
1. ✅ Embeddable chat widget system
2. ✅ iframe-based architecture for cross-domain loading
3. ✅ Two-project Vercel deployment setup
4. ✅ Clean, branded chat interface
5. ✅ Auto-focus UX improvement

### What We Deployed:
1. ✅ matai-ai-agent.vercel.app (RAG system)
2. ✅ mataitech.co (marketing site with widget)
3. ✅ All environment variables configured
4. ✅ Knowledge base fully populated and working

---

## Final Status: ✅ PRODUCTION READY

The Matai Tech AI chat assistant is now live on mataitech.co and fully functional!

---

**Session Date**: January 7, 2026
**Session Duration**: ~4 hours
**Final Test**: Chat widget working perfectly on mataitech.co ✅

# Matai RAG - AI Knowledge Assistant MVP

A simple RAG (Retrieval-Augmented Generation) system that turns your documents into an intelligent AI assistant.

## What is RAG?

RAG allows you to:
1. Upload company documents (PDFs, text files, etc.)
2. Ask questions in natural language
3. Get accurate answers with source citations

The AI searches your documents, finds relevant information, and generates informed responses.

## Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini + Embeddings
- **Vector Store**: Simple in-memory (MVP) → Pinecone (production)

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### 2. Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env
OPENAI_API_KEY=your_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Usage

1. **Upload Documents**: Click "Upload Document" (currently supports .txt files)
2. **Ask Questions**: Type your question in the chat
3. **Get Answers**: The AI will search your documents and provide informed responses

## How It Works

### Document Upload Flow:
```
1. User uploads .txt file
2. System splits into chunks (1000 chars each, 200 char overlap)
3. Each chunk → OpenAI embeddings → Vector store
4. Ready for search!
```

### Chat Flow:
```
1. User asks question
2. Question → OpenAI embedding
3. Search vector store for similar chunks (top 3)
4. Send chunks + question to GPT-4o-mini
5. Return answer with sources
```

## Current Limitations (MVP)

- ✅ **Supported**: .txt files only
- ❌ **Not yet**: PDFs, Word docs (coming soon)
- ⚠️ **Storage**: In-memory only (resets on server restart)
- ⚠️ **Scale**: Good for demos, not production (use Pinecone for real clients)

## Next Steps to Production

### Phase 2: Add More Features
```bash
# Install PDF support
npm install pdf-parse

# Add Pinecone (vector DB)
npm install @pinecone-database/pinecone

# Get Pinecone API key: https://www.pinecone.io/
```

### Phase 3: Deploy
```bash
# Deploy to Vercel
vercel

# Or any hosting platform
npm run build
npm start
```

## File Structure

```
matai-rag/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # Chat endpoint (RAG logic)
│   │   └── upload/route.ts      # Document upload
│   ├── page.tsx                 # Chat interface
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── vectorStore.ts           # Simple vector storage
│   └── documentProcessor.ts     # Text processing utilities
├── .env.example
├── package.json
└── README.md
```

## API Endpoints

### POST /api/upload
Upload and process documents
- Body: FormData with file
- Returns: Success message + chunk count

### POST /api/chat
Chat with RAG
- Body: `{ messages: [{ role: "user", content: "..." }] }`
- Returns: `{ message: "...", sources: [...] }`

## Cost Estimate

For typical usage:
- **Embeddings**: $0.00002 per 1K tokens (~$0.01 per document)
- **Chat**: $0.0001 per 1K tokens (~$0.001 per question)
- **Monthly (100 docs + 1000 questions)**: ~$2-3

## Upgrading to Production

See `docs/UPGRADE.md` for:
- Adding PDF support
- Migrating to Pinecone
- User authentication
- Multi-tenant setup
- Analytics & monitoring

## Troubleshooting

**Error: "Invalid OpenAI API key"**
- Check your `.env` file has `OPENAI_API_KEY=sk-...`
- Restart the dev server after adding the key

**No documents found**
- Upload a .txt file first before asking questions
- Check the upload success message appears

**Server crashes on upload**
- Check file size (keep under 5MB for MVP)
- Ensure file is valid .txt format

## Support

Questions? Contact: luke@mataitech.co

## License

Private - Matai Tech LLC


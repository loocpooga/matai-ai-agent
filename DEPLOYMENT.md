# Matai Tech RAG - Deployment Guide

## 🎯 Overview

Your RAG-powered AI chat widget is ready to deploy! This guide will help you get it live on Vercel in under 10 minutes.

## 📋 What You Built

1. **RAG Backend** - AI assistant powered by your knowledge base (12 documents)
2. **Chat Widget** - Embeddable chat bubble for any website
3. **Auto-sync** - Documents automatically update from Google Drive every 15 minutes

## 🚀 Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code

```bash
# Make sure you're in the project directory
cd "matai-rag"

# Initialize git if you haven't already
git init
git add .
git commit -m "Initial commit - Matai RAG with chat widget"

# Create a GitHub repo and push
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)

### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find these values:**
- `OPENAI_API_KEY`: From your `.env` file locally
- `NEXT_PUBLIC_SUPABASE_URL`: From your `.env` file
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From your `.env` file
- `SUPABASE_SERVICE_ROLE_KEY`: From your `.env` file

### Step 4: Deploy!

Click "Deploy" and wait ~2 minutes.

Your site will be live at: `https://your-project-name.vercel.app`

## 🎨 Add Widget to Your Website

Once deployed, add this single line to your website (before `</body>`):

```html
<script src="https://your-project-name.vercel.app/embed.js" data-auto-init></script>
```

### Custom Configuration (Optional)

```html
<script src="https://your-project-name.vercel.app/embed.js"></script>
<script>
  MataiChat.init({
    position: 'bottom-right',  // or 'bottom-left'
    primaryColor: '#2563eb'     // your brand color
  });
</script>
```

## 🧪 Test Your Widget

1. Visit `https://your-project-name.vercel.app/demo.html`
2. See the chat widget in action
3. Click the bubble to test the AI assistant

## 📱 Widget Features

- ✅ Fully responsive (desktop & mobile)
- ✅ Loads fast (~50KB total)
- ✅ Works on any website (HTML, WordPress, Webflow, etc.)
- ✅ Powered by your custom knowledge base
- ✅ Auto-updates when you update docs in Google Drive

## 🔧 Update Your Knowledge Base

Your n8n workflow automatically syncs documents every 15 minutes from Google Drive.

To update content:
1. Edit files in your Google Drive folder
2. Wait 15 minutes (or manually trigger the workflow)
3. AI instantly knows the new information

## 🎯 Production Checklist

- [ ] Deploy to Vercel
- [ ] Test the chat widget on the demo page
- [ ] Embed widget on your website
- [ ] Test on mobile devices
- [ ] Verify n8n workflow is running (check n8n dashboard)
- [ ] Monitor usage (check Vercel analytics)

## 💡 Tips

- **Custom Domain**: Add your own domain in Vercel settings (free on all plans)
- **Analytics**: Enable Vercel Analytics to see chat usage
- **Rate Limiting**: Consider adding rate limiting for production use
- **Branding**: Update colors in `/public/embed.js` to match your brand

## 🆘 Troubleshooting

**Widget not showing up?**
- Check browser console for errors
- Verify the script URL is correct
- Make sure you added `data-auto-init` attribute

**AI not responding?**
- Check Vercel logs for API errors
- Verify environment variables are set correctly
- Check OpenAI API key is valid and has credits

**Documents not updating?**
- Check n8n workflow is active
- Verify Google Drive permissions
- Check Supabase has the latest documents

## 📞 Support

Questions? Check the demo page or contact support.

---

**Built with:**
- Next.js 15
- OpenAI GPT-4
- Supabase (pgvector)
- n8n workflow automation

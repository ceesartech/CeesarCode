# 🤖 AI Question Generation Setup

This guide will help you set up **real AI-powered question generation** using Google Gemini (free tier).

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
./setup-ai.sh
```

### Option 2: Manual Setup
1. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set the environment variable:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```
3. Start the server:
   ```bash
   cd dist && ./server
   ```

## 🎯 How It Works

### With AI (When API key is set):
- **Truly unique questions** generated for each request
- **Role-specific problems** (React components for Frontend, database queries for Backend)
- **Company-specific scenarios** (Netflix streaming, Uber routing, etc.)
- **Level-appropriate difficulty** (Junior vs Senior complexity)
- **Varied problem types** (algorithms, system design, debugging)

### Without AI (Fallback):
- Uses curated templates with company/role substitution
- Still functional but less personalized

## 🔧 Features

- **Automatic Fallback**: If AI fails, uses templates seamlessly
- **Free Tier**: Google Gemini offers generous free usage
- **No Payment Required**: No credit card needed for basic usage
- **Privacy**: API key stays on your machine

## 📊 API Usage

Google Gemini Free Tier includes:
- **15 requests per minute**
- **1,500 requests per day**
- **32,000 tokens per minute**

This is more than enough for personal use and small teams.

## 🛠️ Troubleshooting

### "GEMINI_API_KEY not found"
- Run the setup script: `./setup-ai.sh`
- Or manually set: `export GEMINI_API_KEY="your-key"`

### "AI generation failed"
- Check your internet connection
- Verify the API key is correct
- The system will automatically fall back to templates

### Rate Limits
- If you hit rate limits, the system falls back to templates
- Wait a minute and try again

## 🎉 Ready to Use!

Once set up, your AI agent will generate unique, contextual coding interview questions tailored to:
- **Company** (Google, Netflix, Uber, etc.)
- **Role** (Frontend, Backend, Data Engineer, etc.)
- **Level** (Junior, Senior, Staff, etc.)

Enjoy your AI-powered coding interview preparation! 🚀

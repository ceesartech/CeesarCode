# 🤖 AI Agent Integration Guide

The AI Agent is now fully integrated into both development and production start scripts!

## 🚀 **Quick Start**

### **Development Mode**
```bash
./scripts/start-dev.sh
```
- Automatically loads AI API key from `.env` file
- Starts both backend and frontend
- AI Agent available at `http://localhost:5173`

### **Production Mode**
```bash
./scripts/start-prod.sh
```
- Automatically loads AI API key from `.env` file
- Starts production server
- AI Agent available at `http://localhost:8080`

## 🔧 **Setup**

### **First Time Setup**
```bash
./setup-ai.sh
```
This will:
1. Guide you to get a free Google Gemini API key
2. Save it to `.env` file
3. Set up the environment for AI generation

### **Manual Setup**
```bash
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

## 🎯 **Features**

### **With AI API Key**:
- ✅ **Real AI generation** - Unique, contextual questions
- ✅ **Company-specific** - Netflix streaming, Uber routing, etc.
- ✅ **Role-specific** - Backend orchestration, Frontend optimization, etc.
- ✅ **Level-appropriate** - Junior vs Senior complexity
- ✅ **Varied problem types** - Algorithms, system design, debugging

### **Without AI API Key**:
- ✅ **Fallback templates** - Still functional with curated questions
- ✅ **Same UI** - No difference in user experience
- ✅ **Automatic detection** - Seamless fallback

## 📊 **Usage**

### **From UI**:
1. Click "🤖 AI Agent" button
2. Fill in company, role, level, and count
3. Click "🚀 Generate Questions"
4. See unique AI-generated questions in the problems list

### **From API**:
```bash
curl -X POST http://localhost:8080/api/agent/generate \
  -H "Content-Type: application/json" \
  -d '{"company": "Netflix", "role": "Backend Engineer", "level": "senior", "count": 3}'
```

## 🛠️ **Scripts**

### **Development**
- `./scripts/start-dev.sh` - Start development server with AI
- `./scripts/stop-dev.sh` - Stop development server

### **Production**
- `./scripts/start-prod.sh` - Start production server with AI
- `./scripts/stop-prod.sh` - Stop production server
- `./scripts/start-prod.sh -d` - Start as daemon
- `./scripts/start-prod.sh -p 3000` - Start on custom port

### **AI Setup**
- `./setup-ai.sh` - Interactive AI setup
- `./scripts/build.sh` - Build with AI dependencies

## 🔍 **Troubleshooting**

### **"AI Agent will use fallback templates"**
- Run `./setup-ai.sh` to set up your API key
- Or manually create `.env` file with `GEMINI_API_KEY=your-key`

### **"AI generation failed"**
- Check your internet connection
- Verify API key is correct
- System will automatically fall back to templates

### **Rate Limits**
- Google Gemini free tier: 15 requests/minute, 1,500/day
- System falls back to templates if limits exceeded

## 🎉 **Ready to Use!**

Your AI Agent is now fully integrated and ready to generate unique, contextual coding interview questions! 🚀

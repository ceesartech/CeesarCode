#!/bin/bash

echo "🤖 Setting up AI Question Generation with Google Gemini"
echo "======================================================"
echo ""

echo "📋 To get your FREE Google Gemini API key:"
echo "1. Go to: https://aistudio.google.com/app/apikey"
echo "2. Click 'Create API Key'"
echo "3. Copy the generated API key"
echo ""

read -p "🔑 Paste your Gemini API key here: " api_key

if [ -z "$api_key" ]; then
    echo "❌ No API key provided. AI generation will use fallback templates."
    exit 1
fi

echo ""
echo "🔧 Setting up environment variable..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    touch .env
fi

# Add or update the API key
if grep -q "GEMINI_API_KEY" .env; then
    sed -i '' "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$api_key/" .env
else
    echo "GEMINI_API_KEY=$api_key" >> .env
fi

echo "✅ API key saved to .env file"
echo ""
echo "🚀 To use AI generation:"
echo "1. Run: source .env"
echo "2. Or export GEMINI_API_KEY=$api_key"
echo "3. Then start the server: cd dist && ./server"
echo ""
echo "💡 The system will automatically use AI generation when the API key is available,"
echo "   and fall back to templates if the key is missing or invalid."
echo ""
echo "🎉 Setup complete! Your AI agent is ready to generate unique questions!"

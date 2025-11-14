# CeesarCode — Unified Multi-Language Coding Judge

> An end-to-end, LeetCode/CodeSignal-style coding judge you can run locally or in production (Docker or Firecracker). Features AI-powered question generation with comprehensive web research.

## 🚀 Quick Start

```bash
# Development mode
./scripts/start-dev.sh

# Production mode
./scripts/build-prod.sh && ./scripts/start-prod.sh
```

Visit `http://localhost:5173` (dev) or `http://localhost:8080` (prod)

## 📚 Documentation

### Quick Links

- **[Getting Started Guide](./docs/README.md#quick-start)** - Setup and installation
- **[Features Overview](./docs/FEATURES.md)** - Complete feature list
- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Directory organization
- **[Production Deployment](./docs/PRODUCTION_DEPLOYMENT.md)** - Deployment guide

### Core Components

- **[Backend API](./docs/BACKEND_API.md)** - Complete API documentation
- **[Frontend UI](./docs/FRONTEND_UI.md)** - UI components and features
- **[AI Question Generation](./docs/AI_QUESTION_GENERATION.md)** - AI-powered question generation
- **[Web Search Feature](./docs/WEB_SEARCH_FEATURE.md)** - Comprehensive web research system

### Setup & Configuration

- **[Language Setup](./docs/LANGUAGE_SETUP.md)** - Install programming languages
- **[AI Setup](./docs/AI_SETUP.md)** - Configure AI providers
- **[Production Ready](./docs/PRODUCTION_READY.md)** - Production checklist

### Additional Resources

- **[Changelog](./docs/CHANGELOG.md)** - Version history
- **[Project Structure Details](./docs/PROJECT_STRUCTURE.md)** - File organization

## ✨ Key Features

- **🤖 AI Question Generator** - Generate unique interview questions with web research
- **🌐 Comprehensive Web Search** - 12 concurrent searches for detailed position information
- **💻 Multi-Language Support** - 14+ programming languages
- **🎯 Real Code Execution** - Actual compilation and execution
- **📝 Custom Problem Creation** - Create your own problems via UI
- **📊 Test Case Management** - View, edit, and manage test cases
- **📁 File Upload System** - Upload datasets for ML/Data Science
- **📓 Jupyter Mode** - Interactive cell-based coding
- **🌙 Dark Mode** - Beautiful dark/light theme support

## 🏗️ Architecture

```
Frontend (React) → Backend (Go) → Executor (Rust)
                      ↓
              Web Search (12 queries)
                      ↓
              AI Providers (Gemini/OpenAI/Claude)
```

## 📖 Documentation Structure

All comprehensive documentation is in the [`docs/`](./docs/) directory:

- **Component Docs**: Detailed documentation for each major component
- **Setup Guides**: Step-by-step setup instructions
- **API Reference**: Complete API documentation
- **Feature Guides**: In-depth feature explanations

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Go 1.22+
- **Executor**: Rust
- **AI Providers**: Google Gemini, OpenAI GPT, Anthropic Claude
- **Languages**: Python, C++, Java, JavaScript, TypeScript, Go, Rust, and more

## 📦 Installation

See [docs/README.md](./docs/README.md) for detailed installation instructions.

## 🤝 Contributing

Contributions welcome! Please read the documentation first to understand the architecture.

## 📄 License

MIT License - Use at will.

---

For detailed information, see the [Documentation Index](./docs/README.md).


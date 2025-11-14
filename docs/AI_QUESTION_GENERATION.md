# AI Question Generation - Comprehensive Documentation

## Overview

The AI Question Generation system is a sophisticated feature that creates unique, contextually relevant coding interview questions tailored to specific companies, roles, and experience levels. It leverages multiple AI providers (Google Gemini, OpenAI GPT, Anthropic Claude) combined with comprehensive web research to generate highly accurate practice questions.

## Table of Contents

- [Quick Setup](#quick-setup)
- [Architecture](#architecture)
- [AI Providers](#ai-providers)
- [Web Search Feature](#web-search-feature)
- [Question Generation Flow](#question-generation-flow)
- [Prompt Engineering](#prompt-engineering)
- [Response Parsing](#response-parsing)
- [Error Handling & Troubleshooting](#error-handling--troubleshooting)
- [Configuration](#configuration)
- [API Reference](#api-reference)

---

## Architecture

### High-Level Flow

```
User Request
    ↓
Frontend (App.jsx)
    ↓
POST /api/agent/generate
    ↓
Backend (main.go)
    ├─→ Web Search (12 concurrent queries)
    ├─→ Prompt Enhancement
    └─→ AI Provider Selection
         ├─→ Google Gemini
         ├─→ OpenAI GPT
         └─→ Anthropic Claude
    ↓
Response Parsing
    ↓
Problem Creation
    ↓
Frontend Display
```

### Core Components

1. **Frontend Request Handler** (`generateQuestions()` in App.jsx)
2. **Backend API Endpoint** (`/api/agent/generate`)
3. **Web Search Module** (12 concurrent searches - see [Web Search Feature](#web-search-feature) section)
4. **AI Provider Handlers** (Gemini, OpenAI, Claude)
5. **Response Parser** (`parseAIResponse()`)
6. **Problem Saver** (`saveGeneratedProblem()`)

---

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
./scripts/setup-ai.sh
```

### Option 2: Manual Setup

**For Google Gemini (Free Tier):**
1. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set the environment variable:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```
   Or create `.env` file:
   ```bash
   echo "GEMINI_API_KEY=your-api-key-here" > .env
   ```

**For OpenAI:**
```bash
export OPENAI_API_KEY="your-api-key-here"
```

**For Anthropic Claude:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### Development Mode
```bash
./scripts/start-dev.sh
```
- Automatically loads AI API key from `.env` file
- Starts both backend and frontend
- AI Agent available at `http://localhost:5173`

### Production Mode
```bash
./scripts/start-prod.sh
```
- Automatically loads AI API key from `.env` file
- Starts production server
- AI Agent available at `http://localhost:8080`

### Features

**With AI API Key:**
- ✅ Real AI generation - Unique, contextual questions
- ✅ Comprehensive web research - 12 concurrent searches
- ✅ Company-specific - Netflix streaming, Uber routing, etc.
- ✅ Role-specific - Backend orchestration, Frontend optimization, etc.
- ✅ Level-appropriate - Junior vs Senior complexity
- ✅ Varied problem types - Algorithms, system design, debugging

**Without AI API Key:**
- ✅ Fallback templates - Still functional with curated questions
- ✅ Same UI - No difference in user experience
- ✅ Automatic detection - Seamless fallback

### API Usage Limits

**Google Gemini Free Tier:**
- 15 requests per minute
- 1,500 requests per day
- 32,000 tokens per minute

**OpenAI:**
- Varies by plan
- Check your dashboard for limits

**Anthropic Claude:**
- Varies by plan
- Check your dashboard for limits

---

## AI Providers

### Google Gemini

**Model**: `gemini-2.5-flash` (primary), `gemini-pro` (fallback)

**Features**:
- Free tier available
- Fast response times
- Good JSON generation
- Multiple model fallback support

**Configuration**:
```go
apiKey := os.Getenv("GEMINI_API_KEY") // or from request
client := genai.NewClient(ctx, option.WithAPIKey(apiKey))
model := client.GenerativeModel("gemini-2.5-flash")
```

**Retry Logic**:
- 5 retry attempts with exponential backoff
- Automatic model switching on 404 errors
- Rate limit handling (429 errors)

### OpenAI GPT

**Model**: `gpt-4o-mini`

**Features**:
- High-quality responses
- Excellent JSON structure adherence
- Reliable API

**Configuration**:
```go
apiKey := os.Getenv("OPENAI_API_KEY") // or from request
requestBody := map[string]interface{}{
    "model": "gpt-4o-mini",
    "messages": []map[string]interface{}{
        {"role": "user", "content": prompt},
    },
    "temperature": 0.7,
    "max_tokens": 4000,
}
```

**Error Handling**:
- Detailed error messages
- No automatic retry (fails fast for debugging)

### Anthropic Claude

**Model**: `claude-3-5-sonnet-20241022`

**Features**:
- High-quality, thoughtful responses
- Excellent at following complex instructions
- Strong JSON generation

**Configuration**:
```go
apiKey := os.Getenv("ANTHROPIC_API_KEY") // or from request
requestBody := map[string]interface{}{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 4000,
    "messages": []map[string]string{
        {"role": "user", "content": prompt},
    },
}
```

**Headers**:
- `x-api-key`: API key
- `anthropic-version`: `2023-06-01`
- `Content-Type`: `application/json`

---

## Question Generation Flow

### 1. Request Processing

**Endpoint**: `POST /api/agent/generate`

**Request Body**:
```json
{
  "company": "Google",
  "role": "Software Engineer",
  "level": "Senior",
  "count": 5,
  "jobDescription": "Optional job description",
  "companyDescription": "Optional company info",
  "interviewType": "Technical",
  "provider": "gemini",
  "apiKey": "optional-api-key",
  "defaultLanguage": "python",
  "questionType": "coding"
}
```

**Question Types**:
- `"coding"`: Standard coding interview questions (default)
- `"system_design"`: System design questions with simple prompts

**Validation**:
- Company, role, and level are required
- Count defaults to 3 if not provided (min: 1, max: 10)
- Provider defaults to "gemini"

### 2. Web Research Integration

Before generating questions, the system performs comprehensive web research:

```go
webSearchInfo := searchWebForPosition(req.Company, req.Role, req.Level)
if webSearchInfo != "" {
    req.CompanyDescription = webSearchInfo
}
```

See [WEB_SEARCH_FEATURE.md](./WEB_SEARCH_FEATURE.md) for details.

### 3. API Key Resolution

Priority order:
1. API key from request body
2. Environment variable (provider-specific)
3. Fallback to mock questions if no key

### 4. Provider Selection

```go
switch provider {
case "gemini":
    problems, err := generateAIGuestions(req, apiKey)
case "openai":
    problems, err := generateOpenAIQuestions(req, apiKey)
case "claude":
    problems, err := generateClaudeQuestions(req, apiKey)
default:
    problems = generateMockQuestions(req)
}
```

### 5. Prompt Construction

See [Prompt Engineering](#prompt-engineering) section.

### 6. AI API Call

- **Gemini**: Direct SDK call with retry logic
- **OpenAI**: HTTP POST to `/v1/chat/completions`
- **Claude**: HTTP POST to `/v1/messages`

### 7. Response Parsing

All providers use `parseAIResponse()`:
- Removes markdown code blocks
- Extracts JSON array
- Validates structure
- Converts to `Problem` format

### 8. Problem Saving

Each generated problem is saved to the filesystem:
- Creates directory structure
- Saves `manifest.json`
- Creates test case files (optional)

---

## Prompt Engineering

### Base Prompt Structure

#### Coding Questions

```
You are a coding interview question generator. Generate exactly {count} unique coding interview questions for a {level} {role} position at {company}.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no explanations, no code blocks - just pure JSON.

Requirements:
- Questions should be appropriate for {level} level
- Focus on {role} role-specific skills and technologies
- Include a mix of algorithmic, data structure, and practical problems
- Each question should have a clear problem statement with examples
- Include sample input/output examples
- Provide starter code stubs for Python, Java, and C++
```

#### System Design Questions

```
You are a system design interview question generator. Generate exactly {count} unique system design interview questions for a {level} {role} position at {company}.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no explanations, no code blocks - just pure JSON.

Requirements:
- Questions should be appropriate for {level} level
- Focus on {role} role-specific system design challenges
- Each question should be a clear, concise prompt (like "Design a machine learning based system to detect fraudulent signals on ads datasets")
- You can add a brief context or example, but keep it simple - just the question prompt
- Consider real-world scenarios relevant to {company}

Return ONLY a JSON array with this exact format:
[
  {
    "id": "unique-kebab-case-id",
    "title": "System Design: [Topic]",
    "statement": "Design a [system description]. [Optional: brief context or example]",
    "type": "system_design",
    "languages": [],
    "stub": {}
  }
]
```

**Note**: System design questions use simple, concise prompts without detailed requirements, constraints, or use cases.

### Enhanced Prompt (with Web Research)

When web research is available, the prompt includes:

```
COMPREHENSIVE WEB RESEARCH & COMPANY INFORMATION:
[Research findings - up to 8,000 characters]

CRITICALLY IMPORTANT INSTRUCTIONS:
- This research contains extensive information gathered from multiple web sources
- Use ALL sections of this research to generate highly accurate questions
- Match the exact technologies, frameworks, and tools mentioned
- Align question difficulty with interview patterns found
- Incorporate specific algorithms, data structures, or problem patterns
- Ensure questions reflect actual interview experience
- Create similar but unique variations of real interview questions
```

### Interview Context

Additional context is added based on request:

**Interview Type**:
```
Interview Type/Format: {interviewType}
- Tailor questions specifically for this interview format and style.
```

**Job Description**:
```
Job Description:
{jobDescription}
- Use this job description to understand required skills and generate relevant questions.
```

**Company Description**:
```
Company Information:
{companyDescription}
- Consider this company context when generating questions.
```

### JSON Format Specification

The prompt includes strict JSON format requirements:

```json
[
  {
    "id": "unique-kebab-case-id",
    "title": "Descriptive Title",
    "statement": "Detailed problem description with examples and constraints",
    "type": "coding",
    "languages": ["python", "java", "cpp"],
    "stub": {
      "python": "def solution():\n    # Your code here\n    pass",
      "java": "class Solution {\n    public void solution() {\n        // Your code here\n    }\n}",
      "cpp": "class Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};"
    }
  }
]
```

**For System Design Questions**:
```json
[
  {
    "id": "unique-kebab-case-id",
    "title": "System Design: [Topic]",
    "statement": "Design a [system description]. [Optional: brief context]",
    "type": "system_design",
    "languages": [],
    "stub": {}
  }
]
```

**Critical Instructions**:
- Return ONLY the JSON array
- No markdown formatting
- No code blocks
- No explanations

---

## Web Search Feature

The Web Search Feature performs comprehensive web research to gather detailed information about specific positions at companies. This information is then used to generate highly accurate, contextually relevant coding interview questions.

### Architecture

**High-Level Flow:**
```
User Request (Company, Role, Level)
    ↓
searchWebForPosition()
    ↓
12 Concurrent Search Queries
    ↓
performSingleSearch() × 12 (parallel)
    ↓
extractInfoFromHTML() × 12
    ↓
combineSearchResults()
    ↓
Categorized Information (8,000 chars max)
    ↓
Enhanced AI Prompt
```

### Search Strategy

The system performs **12 concurrent searches** across multiple categories:

**Interview Questions & Patterns (3 queries):**
- `"{company} {level} {role} coding interview questions"`
- `"{company} {level} {role} technical interview questions"`
- `"{company} {role} interview process coding challenges"`

**Technical Requirements & Skills (3 queries):**
- `"{company} {level} {role} job requirements skills technologies"`
- `"{company} {role} technical stack programming languages"`
- `"{company} {level} {role} required skills qualifications"`

**Company-Specific Interview Information (3 queries):**
- `"{company} interview experience {level} {role}"`
- `"{company} interview tips {role} position"`
- `"{company} coding interview preparation {role}"`

**Role-Specific Technical Details (3 queries):**
- `"{company} {role} technologies frameworks tools"`
- `"{company} {level} {role} system design interview"`
- `"{company} {role} algorithm data structure questions"`

### Information Extraction

The system uses **40+ keywords** to identify relevant information:
- Company name, role title, experience level
- "interview", "question", "coding challenge", "leetcode", "hackerrank"
- "requirement", "skill", "technology", "framework", "language", "tool"
- "algorithm", "data structure", "system design"
- "process", "round", "stage", "preparation", "tip"

**Extraction Process:**
1. HTML cleaning (removes tags, scripts, styles)
2. Snippet extraction (300 chars before, 700 chars after each keyword)
3. Deduplication and filtering
4. Up to 15 relevant snippets per search result

### Data Organization

Results are automatically categorized:

- **Interview Questions & Coding Challenges** - Top 10 items, 800 chars each
- **Technical Requirements & Skills** - Top 8 items, 600 chars each
- **Technologies, Frameworks & Tools** - Top 8 items, 600 chars each
- **Interview Process & Format** - Top 6 items, 600 chars each
- **Additional Relevant Information** - Top 5 items, 500 chars each

### Integration with AI Prompts

When web research is available, the prompt includes:

```
COMPREHENSIVE WEB RESEARCH & COMPANY INFORMATION:
[Research findings - up to 8,000 characters]

CRITICALLY IMPORTANT INSTRUCTIONS:
- This research contains extensive information gathered from multiple web sources
- Use ALL sections of this research to generate highly accurate questions
- Match the exact technologies, frameworks, and tools mentioned
- Align question difficulty with interview patterns found
- Incorporate specific algorithms, data structures, or problem patterns
- Ensure questions reflect actual interview experience
- Create similar but unique variations of real interview questions
```

### Performance

- **Concurrent Execution**: All 12 searches run simultaneously using goroutines
- **Timeout Management**: 30-second total timeout, 8 seconds per search
- **Error Resilience**: Failed searches don't block successful ones
- **Information Limit**: 8,000 characters maximum

---

---

## Response Parsing

### Parsing Process

1. **Clean Response**:
   - Remove markdown code blocks (```json ... ```)
   - Remove leading/trailing whitespace
   - Extract JSON array if wrapped in text

2. **JSON Parsing**:
   ```go
   var aiProblems []struct {
       ID          string            `json:"id"`
       Title       string            `json:"title"`
       Statement   string            `json:"statement"`
       Type        string            `json:"type,omitempty"`
       Languages   []string          `json:"languages"`
       Stub        map[string]string `json:"stub"`
       DrawingData string            `json:"drawingData,omitempty"`
   }
   ```

3. **Validation**:
   - Check for empty array
   - Validate required fields
   - Set defaults for missing fields

4. **Conversion**:
   ```go
   problemType := aiProblem.Type
   if problemType == "" {
       problemType = req.QuestionType
   }
   if problemType == "" {
       problemType = "coding" // Default to coding
   }
   
   problems[i] = Problem{
       ID:          fmt.Sprintf("%s-%s-%s-%s", company, role, level, aiProblem.ID),
       Title:       aiProblem.Title,
       Statement:   aiProblem.Statement,
       Type:        problemType,
       Languages:   aiProblem.Languages,
       Stub:        aiProblem.Stub,
       DrawingData: aiProblem.DrawingData,
   }
   ```

---

## Error Handling & Troubleshooting

### Provider-Specific Errors

#### Gemini
- **429 (Rate Limit)**: Retries with exponential backoff
- **401/403 (Auth)**: Returns error immediately
- **404 (Model Not Found)**: Tries next model in list
- **Other Errors**: Retries up to 5 times

#### OpenAI
- **API Errors**: Returns detailed error message
- **No Choices**: Returns error
- **Empty Content**: Returns error
- **Network Errors**: Returns error with context

#### Claude
- **API Errors**: Returns status code and message
- **No Content**: Returns error
- **Network Errors**: Returns error with context

### Fallback Mechanisms

1. **No API Key**: Falls back to `generateMockQuestions()`
2. **API Failure**: Returns error to user (no silent fallback)
3. **Empty Results**: Returns error
4. **Partial Failure**: Uses successful results

### User-Facing Errors

Errors are returned in structured format:
```json
{
  "status": "error",
  "message": "Detailed error message for user"
}
```

---

## Configuration

### Environment Variables

```bash
# Gemini (default)
GEMINI_API_KEY=your_key_here

# OpenAI
OPENAI_API_KEY=your_key_here

# Claude
ANTHROPIC_API_KEY=your_key_here
```

### Request Parameters

- **provider**: `"gemini"` | `"openai"` | `"claude"` (default: `"gemini"`)
- **apiKey**: Optional API key override
- **count**: Number of questions (1-10, default: 3)
- **company**: Company name (required)
- **role**: Job role (required)
- **level**: Experience level (required)
- **jobDescription**: Optional job description
- **companyDescription**: Optional company info (auto-filled by web search)
- **interviewType**: Optional interview format
- **defaultLanguage**: Default programming language for generated questions (default: `"python"`)
- **questionType**: `"coding"` | `"system_design"` (default: `"coding"`)

### Model Configuration

**Gemini**:
- Primary: `gemini-2.5-flash`
- Fallbacks: `gemini-pro`, `models/gemini-pro`
- Max retries: 5
- Backoff: Exponential (2s, 4s, 8s, 16s)

**OpenAI**:
- Model: `gpt-4o-mini`
- Temperature: 0.7
- Max tokens: 4000

**Claude**:
- Model: `claude-3-5-sonnet-20241022`
- Max tokens: 4000
- API version: `2023-06-01`

---

## API Reference

### Endpoint: `POST /api/agent/generate`

**Request**:
```json
{
  "company": "string (required)",
  "role": "string (required)",
  "level": "string (required)",
  "count": "number (1-10, default: 3)",
  "jobDescription": "string (optional)",
  "companyDescription": "string (optional)",
  "interviewType": "string (optional)",
  "provider": "string (gemini|openai|claude, default: gemini)",
  "apiKey": "string (optional)",
  "defaultLanguage": "string (optional, default: python)",
  "questionType": "string (coding|system_design, default: coding)"
}
```

**Response (Success)**:
```json
{
  "status": "success",
  "problems": [
    {
      "ID": "company-role-level-problem-id",
      "Title": "Problem Title",
      "Statement": "Problem description...",
      "Type": "coding",
      "Languages": ["python", "java", "cpp"],
      "Stub": {
        "python": "def solution():\n    pass",
        "java": "class Solution {...}",
        "cpp": "class Solution {...}"
      },
      "DrawingData": ""
    }
  ],
  "message": "Generated 5 questions for Senior Software Engineer position at Google"
}
```

**For System Design Questions**:
```json
{
  "status": "success",
  "problems": [
    {
      "ID": "company-role-level-problem-id",
      "Title": "System Design: [Topic]",
      "Statement": "Design a [system description]...",
      "Type": "system_design",
      "Languages": [],
      "Stub": {},
      "DrawingData": ""
    }
  ],
  "message": "Generated 3 system design questions for Senior Software Engineer position at Google"
}
```

**Response (Error)**:
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Functions

#### `generateQuestions(w http.ResponseWriter, r *http.Request)`
HTTP handler for question generation endpoint.

#### `callAgentAPI(req AgentRequest) ([]Problem, error)`
Orchestrates web search and AI provider selection.

#### `generateAIGuestions(req AgentRequest, apiKey string) ([]Problem, error)`
Generates questions using Google Gemini.

#### `generateOpenAIQuestions(req AgentRequest, apiKey string) ([]Problem, error)`
Generates questions using OpenAI GPT.

#### `generateClaudeQuestions(req AgentRequest, apiKey string) ([]Problem, error)`
Generates questions using Anthropic Claude.

#### `parseAIResponse(responseText string, req AgentRequest) ([]Problem, error)`
Parses AI response into Problem structs.

#### `saveGeneratedProblem(problem Problem) error`
Saves generated problem to filesystem.

---

## Best Practices

### For Users

1. **Provide Context**: Include job description and interview type for better results
2. **Choose Appropriate Level**: Match level to actual experience
3. **Use Web Research**: Let the system gather comprehensive information
4. **Review Generated Questions**: Verify quality and relevance
5. **Iterate**: Generate multiple batches for variety

### For Developers

1. **Error Handling**: Always handle API failures gracefully
2. **Rate Limiting**: Implement proper rate limiting for production
3. **Caching**: Consider caching web research results
4. **Monitoring**: Log all API calls and errors
5. **Testing**: Test with all three providers

---

### Troubleshooting

#### Common Issues

**"GEMINI_API_KEY not found" or "API key missing"**
- **Solution**: Run `./scripts/setup-ai.sh` or create `.env` file with `GEMINI_API_KEY=your-key`
- **Verify**: Check backend logs for `GEMINI_API_KEY status: FOUND`
- **Note**: System falls back to templates if no key is found

**"AI generation failed" or "Invalid JSON response"**
- **Cause**: AI provider returned markdown or explanation instead of JSON
- **Solution**: 
  - Check backend logs for response preview
  - Try generating fewer questions at once
  - Verify provider supports JSON mode
- **Note**: Improved JSON extraction handles most cases automatically

**"Rate limit exceeded" (429 errors)**
- **Cause**: Too many requests to AI provider
- **Solution**: 
  - Wait a few minutes and try again
  - System automatically retries with exponential backoff
  - Check your API quota limits
- **Gemini Free Tier**: 15 requests/minute, 1,500/day

**"Questions not relevant"**
- **Cause**: Insufficient context or web research failed
- **Solution**: 
  - Add job description in the UI
  - Verify web search is working (check logs)
  - Try different company/role combinations

**"Authentication failed" (401/403 errors)**
- **Cause**: Invalid or expired API key
- **Solution**: 
  - Verify API key is correct
  - Check if key has proper permissions
  - Regenerate key if needed

**"Still getting mock questions"**
- **Cause**: API key not loaded or all providers failed
- **Solution**: 
  - Check backend logs for specific error messages
  - Verify API key is valid and active
  - Ensure internet connection is working
  - Check if API key has proper permissions

#### Key Fixes Implemented

1. **Silent Fallback Fixed**: Now only falls back to mock questions for truly fatal errors
2. **Improved Error Handling**: Errors properly returned to frontend with clear messages
3. **Better Retry Logic**: 5 retries with exponential backoff (2s, 4s, 8s, 16s)
4. **Model Name Updated**: Using stable `gemini-2.5-flash` model
5. **JSON Parsing Improved**: Handles markdown code blocks and wrapped JSON
6. **Enhanced Logging**: Detailed logs at each step for debugging

---

## Future Enhancements

1. **Question Quality Scoring**: ML-based quality assessment
2. **Custom Templates**: User-defined question templates
3. **Question Variations**: Generate multiple variations of same concept
4. **Difficulty Calibration**: Automatic difficulty adjustment
5. **Multi-language Support**: Generate questions in multiple languages
6. **Question Bank**: Cache and reuse high-quality questions
7. **A/B Testing**: Test different prompt strategies
8. **Analytics**: Track question usage and effectiveness

---

## Conclusion

The AI Question Generation system provides a powerful, flexible way to create contextually relevant coding interview questions. By combining multiple AI providers with comprehensive web research, it generates questions that closely match real-world interview experiences.


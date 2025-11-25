# Pair Programming & System Design Agent

## Overview

CeesarCode includes an AI-powered **Pair Programming** and **System Design** agent that provides interactive assistance during coding sessions. The agent acts as a collaborative partner, offering suggestions while keeping the developer in control.

## Philosophy

Following best practices for AI-assisted programming:

1. **Human-in-the-Loop**: AI suggests, human decides
2. **Navigator-Driver Model**: Developer is the navigator (high-level decisions), AI is the driver (implementation help)
3. **Suggest-Only Mode**: AI never auto-applies changes
4. **Context-Aware**: AI understands current problem and code

## Features

### Pair Programming Mode

- **Coding Assistance**: Help write new code and implement features
- **Code Review**: Get feedback on code quality and best practices
- **Debugging**: Identify and fix bugs with AI guidance
- **Explanation**: Understand how existing code works

### System Design Mode

- **Brainstorming**: Explore design options and approaches
- **Design Review**: Get feedback on proposed architectures
- **Deep Dive**: Detailed analysis of specific components
- **Tradeoff Analysis**: Compare alternatives and discuss implications

## API Reference

### Pair Programming Endpoint

```http
POST /api/v1/agent/pair-programming
```

**Request Body:**
```json
{
  "mode": "coding",           // coding | review | debug | explain
  "problemContext": "...",    // Current problem statement
  "codeContext": "...",       // Current code in editor
  "language": "python",       // Programming language
  "history": [                // Conversation history
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "query": "Help me implement...",  // Current request
  "provider": "gemini",       // gemini | openai | claude
  "apiKey": ""                // Optional override
}
```

**Response:**
```json
{
  "status": "success",
  "messages": [
    {"role": "assistant", "content": "Here's how to implement..."}
  ],
  "suggestedChanges": [
    {
      "description": "Add error handling",
      "newCode": "try:\n    ...",
      "lineStart": 5,
      "lineEnd": 10
    }
  ]
}
```

### System Design Endpoint

```http
POST /api/v1/agent/system-design
```

**Request Body:**
```json
{
  "mode": "brainstorm",      // brainstorm | review | deep-dive | tradeoffs
  "problemContext": "Design a URL shortener...",
  "history": [...],
  "query": "How should I handle...",
  "provider": "gemini",
  "apiKey": ""
}
```

**Response:**
```json
{
  "status": "success",
  "messages": [
    {"role": "assistant", "content": "For a URL shortener..."}
  ],
  "explanation": "..."
}
```

## Frontend Usage

### Opening the Agent Panel

1. Click the **"Pair Programming"** button in the header
2. Or use keyboard shortcut (to be added)

### Pair Programming Tab

1. Select a mode: **Coding**, **Review**, **Debug**, or **Explain**
2. Type your question in the input area
3. The agent will consider:
   - Current problem statement
   - Your code in the editor
   - Conversation history
4. Review suggestions and apply what makes sense

### System Design Tab

1. Select a mode: **Brainstorm**, **Review**, **Deep Dive**, or **Tradeoffs**
2. Describe your design challenge
3. The agent will:
   - Ask clarifying questions
   - Suggest architecture components
   - Discuss tradeoffs
4. Use the discussion to refine your design

## Best Practices

### Effective Prompting

**Good prompts:**
- "Help me optimize this function for time complexity"
- "What's wrong with my binary search implementation?"
- "How should I structure the database schema for this feature?"

**Less effective prompts:**
- "Write the code" (too vague)
- "Fix it" (no context)
- "Is this good?" (not specific)

### Iterative Refinement

1. Start with a high-level request
2. Review the AI's response
3. Ask follow-up questions
4. Refine based on your specific needs

### Critical Review

Always:
- Review all suggested code before using
- Consider edge cases
- Test the suggestions
- Understand why a solution works

## Configuration

### Environment Variables

```bash
# Enable/disable features
ENABLE_PAIR_PROGRAMMING=true
ENABLE_SYSTEM_DESIGN_AGENT=true

# Default AI provider
DEFAULT_AI_PROVIDER=gemini

# API Keys (at least one required)
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
```

### Provider Selection

The agent supports three AI providers:

| Provider | Model | Best For |
|----------|-------|----------|
| Gemini | gemini-2.5-flash | Fast, free tier |
| OpenAI | gpt-4o-mini | High quality |
| Claude | claude-3-5-sonnet | Detailed explanations |

## Conversation Modes

### Coding Mode

Best for:
- Implementing new features
- Writing algorithms
- Structuring code

The AI will:
- Suggest code implementations
- Explain the approach
- Offer alternatives

### Review Mode

Best for:
- Code quality feedback
- Best practice suggestions
- Performance improvements

The AI will:
- Analyze your code
- Point out potential issues
- Suggest improvements

### Debug Mode

Best for:
- Finding bugs
- Understanding errors
- Fixing issues

The AI will:
- Analyze error messages
- Identify likely causes
- Suggest fixes

### Explain Mode

Best for:
- Understanding code
- Learning new concepts
- Documentation

The AI will:
- Explain what code does
- Describe the logic
- Clarify concepts

## Example Sessions

### Pair Programming Example

```
User: I need to implement a function to find the k-th largest element 
in an unsorted array. What's the best approach?

Agent: For finding the k-th largest element, you have several options:

1. **Sort and Index** - O(n log n)
   Simple but not optimal for single queries.

2. **Min-Heap of size k** - O(n log k)
   Maintain a heap of the k largest elements.

3. **Quickselect** - O(n) average
   Partition-based approach, optimal for single queries.

For a coding interview, I'd recommend Quickselect:

```python
def find_kth_largest(nums, k):
    def partition(left, right, pivot_idx):
        pivot = nums[pivot_idx]
        nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]
        store_idx = left
        for i in range(left, right):
            if nums[i] > pivot:
                nums[i], nums[store_idx] = nums[store_idx], nums[i]
                store_idx += 1
        nums[right], nums[store_idx] = nums[store_idx], nums[right]
        return store_idx
    
    # ... rest of implementation
```

Would you like me to explain the partition logic or complete the implementation?
```

### System Design Example

```
User: I want to design a real-time collaborative document editor like 
Google Docs. Where should I start?

Agent: Great challenge! Let me ask a few clarifying questions first:

1. **Scale**: How many concurrent users per document?
2. **Latency**: What's acceptable edit-to-visible delay?
3. **Conflicts**: How should simultaneous edits be handled?
4. **Persistence**: Do you need version history?

For a typical collaborative editor, the key components are:

**Core Architecture:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│  WebSocket  │────►│   Document  │
│   Editor    │◄────│   Gateway   │◄────│   Service   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │   Storage   │
                                        │   (CRDT)    │
                                        └─────────────┘
```

**Key Decisions:**
- **Conflict Resolution**: OT (Operational Transform) or CRDT
- **Real-time Sync**: WebSockets or Server-Sent Events
- **Cursor Presence**: Broadcasting user positions

Which aspect would you like to dive deeper into?
```

## Limitations

1. **Not a replacement for expertise**: Use as a learning aid, not authoritative source
2. **Context limitations**: Can only see current problem and code
3. **May make mistakes**: Always verify suggestions
4. **No direct code execution**: Can only suggest, not run code

## Troubleshooting

### "AI key not configured"

Set up at least one AI provider key:
```bash
export GEMINI_API_KEY="your-key"
```

### Slow responses

- Large contexts take longer to process
- Try a different AI provider
- Check your network connection

### Irrelevant suggestions

- Provide more context in your prompt
- Reference specific lines of code
- Be more specific about what you need

## Privacy & Security

- Conversation history is not stored server-side
- Code contexts are only sent when you make a request
- API keys are never logged
- Use separate API keys for different environments


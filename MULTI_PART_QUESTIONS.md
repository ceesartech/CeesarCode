# Multi-Part Coding Questions - Implementation Summary

## Overview
Multi-part coding questions allow creating questions with follow-up parts that progressively build upon each other. Part 1 is standalone, Part 2 builds on Part 1, Part 3 builds on Parts 1 and 2, etc.

## Features Implemented

### Backend (Go)

#### Data Structures
- **Part struct**: Added to represent individual question parts
  ```go
  type Part struct {
      PartNumber int               `json:"partNumber"` // 1, 2, 3, etc.
      Statement  string            `json:"statement"`  // Part-specific statement
      Stub       map[string]string `json:"stub"`       // Part-specific code stubs
  }
  ```

- **Problem struct**: Enhanced with multi-part support
  ```go
  IsMultiPart bool   `json:"IsMultiPart,omitempty"` // Whether this is multi-part
  Parts       []Part `json:"Parts,omitempty"`       // Additional parts (Part 2, 3, etc.)
  ```

- **SubmitReq struct**: Added part number tracking
  ```go
  PartNumber int `json:"PartNumber,omitempty"` // 0 for part 1, 1+ for additional parts
  ```

#### API Handlers
1. **Problem Creation** (`createProblem`)
   - Creates separate test directories for each part (`v1/part2/public`, `v1/part3/public`, etc.)
   - Part 1 uses the standard `v1/public` directory
   - Each part gets its own test cases

2. **Code Submission** (`submit`)
   - Determines test directory based on part number
   - Routes to correct test cases: `v1/part{N}/public` for Part N
   - Falls back to main directory if part-specific tests don't exist

3. **AI Generation** (`generateAIQuestions`, `generateOpenAIQuestions`, `generateClaudeQuestions`)
   - Added `IncludeMultiPart` flag to `AgentRequest`
   - Enhanced prompts to generate multi-part questions (30-40% when enabled)
   - Generates follow-up parts that build on initial problems

### Frontend (React)

#### State Management
- `selectedPart`: Tracks current part (0 for Part 1, 1 for Part 2, etc.)
- `partCodes`: Stores code for each part separately `{ 0: 'code1', 1: 'code2', ... }`
- `isMultiPart`, `parts`: Added to problem creation form state

#### Navigation & UI

**Problem Solving Interface**:
- Part navigation buttons in Problem Statement header
- Visual indicators showing current part (e.g., "Part 2 of 3")
- Previous/Next part buttons with keyboard shortcuts
- Displays part-specific problem statements
- Manages code per part automatically

**Keyboard Shortcuts**:
- `Ctrl/Cmd + ←`: Previous part
- `Ctrl/Cmd + →`: Next part
- All existing shortcuts work per-part

**Manual Problem Creation**:
- Checkbox to enable multi-part questions
- Add/Remove part buttons
- Part-specific statement editors
- Automatic part numbering (Part 2, Part 3, etc.)

**AI Generation**:
- "Include Multi-part Questions" checkbox in AI generation form
- Generates mix of single and multi-part questions when enabled
- Works with all 3 AI providers (Gemini, OpenAI, Claude)

#### Code Management
- `handleCodeChange`: Saves code to part-specific storage
- Language switching: Loads correct stub for current part
- Submission: Includes part number in request
- Code persistence: Each part maintains its own code independently

#### Effects & Lifecycle
- Part switching: Loads appropriate code and stub for selected part
- Problem loading: Resets to Part 1 when problem changes
- Language cycling: Handles multi-part stubs correctly

## User Flow

### Creating Multi-Part Questions Manually
1. Click "Create New Problem"
2. Fill in title and Part 1 statement
3. Check "Multi-part Question (with follow-ups)"
4. Click "+ Add Part" for each additional part
5. Write follow-up statements for Part 2, Part 3, etc.
6. Create test cases for each part via Test Cases tab

### Creating Multi-Part Questions with AI
1. Click "Generate with AI"
2. Fill in company, role, level details
3. Check "Include Multi-part Questions"
4. Generate questions
5. AI creates mix of single and multi-part questions

### Solving Multi-Part Questions
1. Select a multi-part question from sidebar
2. See Part 1 statement and navigation buttons
3. Write code for Part 1
4. Click "Part 2" or press `Ctrl/Cmd + →`
5. See Part 2 statement (builds on Part 1)
6. Code from Part 1 is preserved
7. Write code for Part 2
8. Submit tests against Part 2 test cases
9. Continue for all parts

## Technical Details

### Test Case Structure
```
data/problems/
  └── problem-id/
      ├── manifest.json          # Contains IsMultiPart, Parts array
      └── v1/
          ├── public/            # Part 1 test cases
          │   ├── 01.in
          │   └── 01.out
          ├── part2/
          │   └── public/        # Part 2 test cases
          │       ├── 01.in
          │       └── 01.out
          └── part3/
              └── public/        # Part 3 test cases
                  ├── 01.in
                  └── 01.out
```

### AI Prompt Enhancement
When `includeMultiPart` is true, prompts include:
- Instructions to create 30-40% multi-part questions
- Guidelines for progressive complexity
- Format for parts array in JSON response
- Emphasis on building upon previous parts

### Backward Compatibility
- Single-part questions work exactly as before
- `IsMultiPart` defaults to false
- Parts array defaults to empty
- All existing questions remain compatible

## Files Modified

### Backend
- `src/backend/main.go`: All multi-part logic

### Frontend
- `src/frontend/src/App.jsx`: All UI and state management
- `src/frontend/vite.config.js`: Added external d3-sankey

### Documentation
- `MULTI_PART_QUESTIONS.md`: This file

## Testing
- Frontend builds successfully
- Backend compiles without errors
- No linter errors
- All existing functionality preserved
- Multi-part UI integrated seamlessly

## Future Enhancements
- Bulk test case upload for multi-part questions
- Part-specific hints or constraints
- Progress tracking across parts
- Part difficulty indicators
- Multi-part question analytics


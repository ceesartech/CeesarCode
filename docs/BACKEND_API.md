# Backend API - Comprehensive Documentation

## Overview

The CeesarCode backend is a Go-based REST API server that handles problem management, code execution, file uploads, and AI question generation. It serves as the central hub connecting the frontend UI with the code executor and file system.

## Table of Contents

- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Request/Response Formats](#requestresponse-formats)
- [Code Execution](#code-execution)
- [Problem Management](#problem-management)
- [File Upload System](#file-upload-system)
- [Error Handling](#error-handling)
- [Configuration](#configuration)

---

## Architecture

### Server Structure

```
main.go
├── HTTP Server (port 8080)
├── Static File Server (dist/)
├── API Routes
│   ├── Problem Routes
│   ├── Submission Routes
│   ├── Execution Routes
│   ├── Upload Routes
│   └── AI Agent Routes
└── Executor Integration
```

### Core Components

1. **HTTP Server**: Go's `http.ServeMux` for routing
2. **Static File Server**: Serves frontend from `dist/` directory
3. **Problem Loader**: Reads problem manifests and test cases
4. **Code Executor**: Integrates with Rust executor for code execution
5. **File Manager**: Handles file uploads and management

---

## API Endpoints

### Problem Management

#### `GET /api/problems`
Lists all available problems.

**Response**:
```json
[
  {
    "ID": "float-mean",
    "Title": "Float Mean",
    "Statement": "Calculate the mean...",
    "Languages": ["python", "cpp"],
    "Stub": {...}
  }
]
```

#### `GET /api/problem/{id}`
Gets a specific problem by ID.

**Response**:
```json
{
  "ID": "float-mean",
  "Title": "Float Mean",
  "Statement": "Calculate the mean...",
  "Languages": ["python", "cpp"],
  "Stub": {
    "python": "def solution():\n    pass",
    "cpp": "// TODO"
  }
}
```

#### `GET /api/problem/{id}/testcases`
Gets all test cases for a problem.

**Response**:
```json
[
  {
    "name": "01",
    "input": "5\n1 2 3 4 5",
    "output": "3.0"
  }
]
```

#### `PUT /api/problem/{id}/testcases`
Updates test cases for a problem.

**Request**:
```json
[
  {
    "name": "01",
    "input": "5\n1 2 3 4 5",
    "output": "3.0"
  }
]
```

#### `DELETE /api/problem/{id}/testcases`
Deletes all test cases for a problem.

#### `POST /api/problems/create`
Creates a new problem.

**Request**:
```json
{
  "Title": "New Problem",
  "Statement": "Problem description...",
  "Languages": ["python"],
  "Stub": {
    "python": "def solution():\n    pass"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "id": "new-problem"
}
```

### Code Execution

#### `POST /api/submit`
Submits code for evaluation against all test cases.

**Request**:
```json
{
  "problemId": "float-mean",
  "language": "python",
  "files": {
    "Main.py": "def solution():\n    return 3.0"
  }
}
```

**Response**:
```json
{
  "verdict": "Accepted",
  "tests": [
    {
      "name": "01",
      "status": "AC",
      "time_ms": 15,
      "message": ""
    }
  ]
}
```

#### `POST /api/run`
Runs code with optional input (for quick testing).

**Request**:
```json
{
  "language": "python",
  "files": {
    "Main.py": "print('Hello')"
  },
  "input": "optional input"
}
```

**Response**:
```json
{
  "result": "Hello\n",
  "error": ""
}
```

### File Management

#### `POST /api/upload`
Uploads a file for a specific problem.

**Request**: Multipart form data
- `file`: File to upload
- `problemId`: Problem ID

**Response**:
```json
{
  "status": "success",
  "url": "/api/uploads/filename.csv",
  "filename": "filename.csv"
}
```

#### `GET /api/problem/{id}/files`
Lists uploaded files for a problem.

**Response**:
```json
[
  {
    "name": "data.csv",
    "size": 1024,
    "type": "text/csv"
  }
]
```

#### `DELETE /api/problem/{id}/files/{filename}`
Deletes an uploaded file.

### AI Agent

#### `POST /api/agent/generate`
Generates AI questions. See [AI_QUESTION_GENERATION.md](./AI_QUESTION_GENERATION.md).

#### `POST /api/agent/clean`
Cleans AI-generated problems.

### Utility

#### `POST /api/problems/clear`
Clears all problems (use with caution).

---

## Request/Response Formats

### Problem Structure

```go
type Problem struct {
    ID        string            `json:"ID"`
    Title     string            `json:"Title"`
    Statement string            `json:"Statement"`
    Languages []string          `json:"Languages"`
    Stub      map[string]string `json:"Stub"`
}
```

### Submission Request

```go
type SubmitReq struct {
    ProblemID string            `json:"problemId"`
    Language  string            `json:"language"`
    Files     map[string]string `json:"files"`
}
```

### Execution Job

```go
type ExecJob struct {
    SubmissionID  string `json:"submission_id"`
    ProblemBundle string `json:"problem_bundle"`
    SubmissionDir string `json:"submission_dir"`
    Language      string `json:"language"`
}
```

### Execution Result

```json
{
  "verdict": "Accepted|Rejected|Error",
  "tests": [
    {
      "name": "01",
      "status": "AC|WA|RE|IE",
      "time_ms": 15,
      "message": "Error message if any"
    }
  ]
}
```

**Status Codes**:
- `AC`: Accepted (output matches)
- `WA`: Wrong Answer (output doesn't match)
- `RE`: Runtime Error (execution failed)
- `IE`: Internal Error (missing files, etc.)

---

## Code Execution

### Execution Flow

1. **Receive Submission**: Backend receives code and problem ID
2. **Create Submission Directory**: Temporary directory for user code
3. **Write Code Files**: Save user code to files
4. **Call Executor**: Send job JSON to Rust executor via stdin
5. **Receive Results**: Parse executor output JSON
6. **Return to Client**: Format and return results

### Executor Integration

The backend communicates with the Rust executor via JSON over stdin/stdout:

```go
job := ExecJob{
    SubmissionID:  subID,
    ProblemBundle: abs(pdir),
    SubmissionDir: abs(sdir),
    Language:      req.Language,
}

cmd := exec.Command(exe)
cmd.Stdin = strings.NewReader(string(jb))
out, err := cmd.Output()
```

### Language Support

The backend supports 14+ languages:
- **Compiled**: C, C++, Java, Kotlin, Scala, Go, Rust, Swift
- **Interpreted**: Python, Ruby, JavaScript, TypeScript
- **Scripting**: Bash, Shell
- **Database**: SQL

### Execution Modes

- **Docker Mode**: Runs code in Docker containers (default)
- **Firecracker Mode**: Runs code in microVMs (production)
- **Stub Mode**: Demo mode without sandboxing

---

## Problem Management

### Problem Structure

Problems are stored in `data/problems/{id}/`:

```
{id}/
├── manifest.json          # Problem metadata
├── v1/
│   ├── public/           # Test cases
│   │   ├── 01.in
│   │   ├── 01.out
│   │   └── ...
│   ├── checker/          # Optional checker script
│   │   └── checker.py
│   └── sql/              # SQL-specific files
│       ├── database.db
│       └── ...
└── uploads/               # User-uploaded files
    └── ...
```

### Manifest Format

```json
{
  "ID": "problem-id",
  "Title": "Problem Title",
  "Statement": "Problem description...",
  "Languages": ["python", "cpp"],
  "Stub": {
    "python": "def solution():\n    pass",
    "cpp": "// TODO"
  }
}
```

### Test Case Management

Test cases are stored as pairs of `.in` and `.out` files:
- `01.in`: Input for test case 1
- `01.out`: Expected output for test case 1
- `02.in`, `02.out`: Test case 2, etc.

---

## File Upload System

### Upload Process

1. **Receive File**: Multipart form data
2. **Validate**: Check file type and size
3. **Create Directory**: `data/problems/{id}/uploads/`
4. **Save File**: Write file to disk
5. **Return Metadata**: File info to client

### Supported File Types

- CSV files (`.csv`)
- JSON files (`.json`)
- Text files (`.txt`)
- Excel files (`.xlsx`, `.xls`)
- Code files (`.py`, `.js`, `.java`, etc.)
- SQL files (`.sql`)

### File Size Limits

- Maximum: 32MB per file
- Configurable via `ParseMultipartForm(32 << 20)`

---

## Error Handling

### HTTP Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid request format
- `404 Not Found`: Resource not found
- `405 Method Not Allowed`: Wrong HTTP method
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": "Error message"
}
```

### Common Errors

- **Problem Not Found**: 404 when problem ID doesn't exist
- **Invalid JSON**: 400 when request body is malformed
- **Execution Failed**: 500 when executor fails
- **File Upload Error**: 500 when file save fails

---

## Configuration

### Environment Variables

```bash
# Executor mode
EXECUTOR_MODE=docker|firecracker|stub

# AI API keys
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key

# Firecracker (if using)
FC_KERNEL=/path/to/vmlinux
FC_ROOTFS=/path/to/rootfs.ext4
```

### Server Configuration

- **Port**: 8080 (hardcoded, can be made configurable)
- **Data Directory**: `../../dist/data/problems` (relative to binary)
- **Static Directory**: `./` (current directory)

### Path Resolution

The backend uses relative paths that resolve based on execution location:
- Development: `src/backend/main.go` → `../../dist/data/problems`
- Production: `dist/server` → `./data/problems`

---

## Security Considerations

### File Upload Security

- **Size Limits**: 32MB maximum
- **Path Validation**: Prevents directory traversal
- **File Type Checking**: Validates file extensions
- **Isolated Execution**: Code runs in sandboxed environment

### Code Execution Security

- **Sandboxing**: Docker containers or Firecracker VMs
- **Resource Limits**: CPU, memory, and time limits
- **Network Isolation**: No network access in sandbox
- **File System Isolation**: Read-only problem files, write-only workspace

---

## Performance Optimization

### Caching

- Problem manifests are loaded on-demand
- No caching currently (can be added for production)

### Concurrency

- Go's HTTP server handles concurrent requests
- Each request is handled in a separate goroutine
- File operations are synchronous (can be optimized)

### Resource Management

- Temporary directories cleaned up after execution
- File handles properly closed
- Memory-efficient JSON parsing

---

## Monitoring & Logging

### Logging

All operations are logged:
- Request received
- Execution started/completed
- Errors encountered
- File operations

### Log Levels

- **Info**: Normal operations
- **Error**: Failures and exceptions
- **Debug**: Detailed execution flow (can be enabled)

---

## API Reference

### Functions

#### `main()`
Initializes HTTP server and routes.

#### `listProblems(w, r)`
Lists all problems.

#### `getProblem(w, r)`
Gets a specific problem.

#### `submit(w, r)`
Handles code submission.

#### `runCode(w, r)`
Handles quick code execution.

#### `createProblem(w, r)`
Creates a new problem.

#### `uploadFile(w, r)`
Handles file uploads.

#### `generateQuestions(w, r)`
Generates AI questions.

---

## Testing

### Manual Testing

```bash
# List problems
curl http://localhost:8080/api/problems

# Get problem
curl http://localhost:8080/api/problem/float-mean

# Submit code
curl -X POST http://localhost:8080/api/submit \
  -H "Content-Type: application/json" \
  -d '{"problemId":"float-mean","language":"python","files":{"Main.py":"print(3.0)"}}'
```

### Integration Testing

The backend can be tested with the frontend or using curl/Postman.

---

## Troubleshooting

### Common Issues

**Issue**: Problems not loading
- **Cause**: Incorrect data directory path
- **Solution**: Check path resolution, verify `data/problems/` exists

**Issue**: Code execution fails
- **Cause**: Executor not found or not executable
- **Solution**: Verify executor binary exists and is executable

**Issue**: File upload fails
- **Cause**: Directory permissions or disk space
- **Solution**: Check directory permissions, verify disk space

---

## Future Enhancements

1. **API Versioning**: `/api/v1/`, `/api/v2/`
2. **Authentication**: User accounts and API keys
3. **Rate Limiting**: Prevent abuse
4. **Caching**: Redis for problem manifests
5. **WebSockets**: Real-time execution updates
6. **GraphQL**: Alternative API interface
7. **OpenAPI Spec**: Auto-generated API documentation

---

## Conclusion

The Backend API provides a robust, scalable foundation for the CeesarCode platform, handling everything from problem management to code execution with comprehensive error handling and security measures.


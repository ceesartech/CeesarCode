package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"google.golang.org/api/googleapi"
	"google.golang.org/api/option"
)

type Problem struct {
	ID        string            `json:"ID"`
	Title     string            `json:"Title"`
	Statement string            `json:"Statement"`
	Languages []string          `json:"Languages"`
	Stub      map[string]string `json:"Stub"`
}

type TestCase struct {
	Input  string
	Output string
}
type SubmitReq struct {
	ProblemID, Language string
	Files               map[string]string
}
type ExecJob struct {
	SubmissionID  string `json:"submission_id"`
	ProblemBundle string `json:"problem_bundle"`
	SubmissionDir string `json:"submission_dir"`
	Language      string `json:"language"`
}

type AgentRequest struct {
	Company string `json:"company"`
	Role    string `json:"role"`
	Level   string `json:"level"`
	Count   int    `json:"count,omitempty"`
}

type AgentResponse struct {
	Status   string    `json:"status"`
	Problems []Problem `json:"problems,omitempty"`
	Message  string    `json:"message,omitempty"`
}

var dataDir = "../../dist/data/problems"
var distDir = "./"

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/problems", listProblems)
	mux.HandleFunc("/api/problem/", handleProblemRoutes)
	mux.HandleFunc("/api/submit", submit)
	mux.HandleFunc("/api/run", runCode)
	mux.HandleFunc("/api/problems/create", createProblem)
	mux.HandleFunc("/api/upload", uploadFile)
	mux.HandleFunc("/api/agent/generate", generateQuestions)
	mux.HandleFunc("/api/agent/clean", cleanAIGuestions)
	mux.Handle("/", http.FileServer(http.Dir(distDir)))
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func handleProblemRoutes(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/problem/")
	parts := strings.Split(path, "/")

	if len(parts) > 1 && parts[1] == "files" {
		if r.Method == http.MethodGet {
			listUploadedFiles(w, r, parts[0])
			return
		} else if r.Method == http.MethodDelete && len(parts) > 2 {
			deleteUploadedFile(w, r, parts[0], parts[2])
			return
		}
	} else if len(parts) > 1 && parts[1] == "testcases" {
		if r.Method == http.MethodPut {
			// Handle test cases update
			r.URL.Path = "/api/problem/" + parts[0] // Simplify path for updateTestCases
			updateTestCases(w, r)
		} else if r.Method == http.MethodDelete {
			// Handle test cases deletion
			deleteAllTestCases(w, r, parts[0])
		} else {
			// Handle test cases get
			r.URL.Path = "/api/problem/" + parts[0] // Simplify path for getTestCases
			getTestCases(w, r)
		}
	} else {
		// Handle regular problem request
		getProblem(w, r)
	}
}

func listProblems(w http.ResponseWriter, r *http.Request) {
	ents, err := os.ReadDir(dataDir)
	if err != nil {
		log.Printf("Error reading dataDir %s: %v", dataDir, err)
		http.Error(w, "Internal server error", 500)
		return
	}
	var out []Problem
	for _, e := range ents {
		if !e.IsDir() {
			continue
		}

		// Skip directories that are not problems (like uploads)
		if e.Name() == "uploads" {
			continue
		}

		p := loadProblem(e.Name())
		if p.ID != "" {
			out = append(out, p)
		}
	}

	// If no problems found, return empty array instead of null
	if out == nil {
		out = []Problem{}
	}

	json.NewEncoder(w).Encode(out)
}
func getProblem(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/problem/")
	// URL decode the problem ID to handle spaces and special characters
	if decoded, err := url.QueryUnescape(id); err == nil {
		id = decoded
	}
	p := loadProblem(id)
	if p.ID == "" {
		http.Error(w, "not found", 404)
		return
	}
	json.NewEncoder(w).Encode(p)
}
func loadProblem(id string) Problem {
	manifestPath := filepath.Join(dataDir, id, "manifest.json")
	b, err := os.ReadFile(manifestPath)
	if err != nil {
		// Only log if it's not a missing file (which is expected for some directories)
		if !os.IsNotExist(err) {
			log.Printf("Error loading problem %s: %v", id, err)
		}
		return Problem{}
	}
	var p Problem
	if err := json.Unmarshal(b, &p); err != nil {
		log.Printf("Error unmarshaling problem %s: %v", id, err)
		return Problem{}
	}
	return p
}
func submit(w http.ResponseWriter, r *http.Request) {
	log.Printf("Submit called with method: %s", r.Method)
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", 405)
		return
	}
	var req SubmitReq
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Printf("JSON decode error: %v", err)
		http.Error(w, "Bad request", 400)
		return
	}
	log.Printf("Decoded request: %+v", req)
	pdir := filepath.Join(dataDir, req.ProblemID, "v1")
	if _, err := os.Stat(pdir); err != nil {
		http.Error(w, "problem not found", 404)
		return
	}
	subID := uuid.NewString()
	sdir := filepath.Join(os.TempDir(), "ceesarcode-submissions", subID)
	os.MkdirAll(sdir, 0o755)
	for name, content := range req.Files {
		os.WriteFile(filepath.Join(sdir, filepath.Base(name)), []byte(content), 0o644)
	}
	if len(req.Files) == 0 {
		os.WriteFile(filepath.Join(sdir, "code.txt"), []byte(""), 0o644)
	}
	log.Printf("subID: %s", subID)
	log.Printf("pdir: %s", pdir)
	log.Printf("abs(pdir): %s", abs(pdir))
	log.Printf("sdir: %s", sdir)
	log.Printf("abs(sdir): %s", abs(sdir))
	log.Printf("language: %s", req.Language)
	job := ExecJob{SubmissionID: subID, ProblemBundle: abs(pdir), SubmissionDir: abs(sdir), Language: req.Language}
	log.Printf("job struct: %+v", job)

	// Check if submission directory exists and contains files
	if entries, err := os.ReadDir(sdir); err == nil {
		log.Printf("Files in submission directory %s:", sdir)
		for _, entry := range entries {
			log.Printf("  %s", entry.Name())
		}
	} else {
		log.Printf("Could not read submission directory %s: %v", sdir, err)
	}
	jb, err := json.Marshal(job)
	if err != nil {
		log.Printf("JSON marshal error: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}
	log.Printf("JSON bytes length: %d", len(jb))
	log.Printf("Sending job to executor: %s", string(jb))
	exe := "./release/executor"
	if _, err := os.Stat(exe); err != nil {
		exe = "../../src/executor/target/release/executor"
		if _, err := os.Stat(exe); err != nil {
			exe = "../../src/executor/target/debug/executor"
		}
	}
	cmd := exec.Command(exe)
	cmd.Stdin = strings.NewReader(string(jb))
	cmd.Env = append(os.Environ(), "EXECUTOR_MODE="+getEnv("EXECUTOR_MODE", "docker"))
	out, err := cmd.Output()
	if err != nil {
		log.Printf("Executor error: %v", err)
		http.Error(w, "Execution failed", 500)
		return
	}

	// Validate that the output is valid JSON
	outputStr := strings.TrimSpace(string(out))
	if !strings.HasPrefix(outputStr, "{") || !strings.HasSuffix(outputStr, "}") {
		log.Printf("Invalid executor output: %s", outputStr)
		http.Error(w, "Invalid executor response", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(outputStr))
}

func runCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", 405)
		return
	}

	var req struct {
		Language string            `json:"language"`
		Files    map[string]string `json:"files"`
		Input    string            `json:"input,omitempty"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Printf("JSON decode error: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "Bad request: " + err.Error()})
		return
	}

	log.Printf("runCode request: language=%s, files=%v", req.Language, req.Files)

	// Create temporary directory for code execution
	subID := uuid.NewString()
	sdir := filepath.Join(os.TempDir(), "ceesarcode-run", subID)
	os.MkdirAll(sdir, 0755)
	defer os.RemoveAll(sdir) // Clean up after execution

	// Write code files
	var mainFile string
	for name, content := range req.Files {
		filePath := filepath.Join(sdir, filepath.Base(name))
		os.WriteFile(filePath, []byte(content), 0644)
		if mainFile == "" {
			mainFile = filePath
		}
	}

	if len(req.Files) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "No files provided"})
		return
	}

	// Execute code based on language
	var stdout, stderr string
	var execErr error

	switch req.Language {
	case "python":
		stdout, stderr, execErr = runPythonCode(sdir, req.Input)
	case "javascript":
		stdout, stderr, execErr = runJavaScriptCode(sdir, req.Input)
	case "typescript":
		stdout, stderr, execErr = runTypeScriptCode(sdir, req.Input)
	case "java":
		stdout, stderr, execErr = runJavaCode(sdir, req.Input)
	case "cpp":
		stdout, stderr, execErr = runCppCode(sdir, req.Input)
	case "c":
		stdout, stderr, execErr = runCCode(sdir, req.Input)
	case "go":
		stdout, stderr, execErr = runGoCode(sdir, req.Input)
	case "rust":
		stdout, stderr, execErr = runRustCode(sdir, req.Input)
	case "swift":
		stdout, stderr, execErr = runSwiftCode(sdir, req.Input)
	case "ruby":
		stdout, stderr, execErr = runRubyCode(sdir, req.Input)
	case "bash", "sh":
		stdout, stderr, execErr = runBashCode(sdir, req.Input)
	case "sql":
		stdout, stderr, execErr = runSqlCode(sdir, req.Input)
	default:
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unsupported language: " + req.Language})
		return
	}

	// Prepare response - always show stdout in result, stderr in error
	// Log what we're returning
	log.Printf("Execution result - stdout length: %d, stderr length: %d, execErr: %v", len(stdout), len(stderr), execErr != nil)
	if execErr != nil {
		log.Printf("Execution error: %v", execErr)
	}

	result := map[string]interface{}{
		"result": stdout,
		"error":  "",
	}

	// If there's stderr, add it to error field
	if stderr != "" {
		result["error"] = stderr
	}

	// If there's an execution error but no stderr, use the error message
	if execErr != nil && stderr == "" {
		result["error"] = execErr.Error()
	}

	// If there's both stderr and execErr, combine them
	if execErr != nil && stderr != "" {
		result["error"] = stderr + "\n" + execErr.Error()
	}

	log.Printf("Returning result: result='%s', error='%s'", result["result"], result["error"])

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func runPythonCode(dir, input string) (stdout, stderr string, err error) {
	log.Printf("runPythonCode: dir=%s, input length=%d", dir, len(input))

	// List all files in directory for debugging
	if entries, e := os.ReadDir(dir); e == nil {
		log.Printf("Files in directory %s:", dir)
		for _, entry := range entries {
			log.Printf("  - %s (isDir: %v)", entry.Name(), entry.IsDir())
		}
	}

	mainPy := filepath.Join(dir, "Main.py")
	if _, e := os.Stat(mainPy); e != nil {
		log.Printf("Main.py not found, searching for .py files")
		// Try other common names
		files, _ := filepath.Glob(filepath.Join(dir, "*.py"))
		if len(files) > 0 {
			mainPy = files[0]
			log.Printf("Found Python file: %s", mainPy)
		} else {
			log.Printf("No Python files found in %s", dir)
			return "", "", fmt.Errorf("Python file not found in %s", dir)
		}
	} else {
		log.Printf("Using Python file: %s", mainPy)
	}

	cmd := exec.Command("python3", mainPy)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)

	log.Printf("Executing: python3 %s (in dir: %s)", mainPy, dir)

	// Use CombinedOutput to capture both stdout and stderr
	// For Python, stdout and stderr are combined, but we'll treat it as stdout
	// unless there's an actual error
	out, execErr := cmd.CombinedOutput()
	outputStr := string(out)

	log.Printf("Python execution completed - output length: %d, error: %v", len(outputStr), execErr != nil)
	if execErr != nil {
		log.Printf("Python execution error: %v", execErr)
	}
	if len(outputStr) > 0 {
		previewLen := 100
		if len(outputStr) < previewLen {
			previewLen = len(outputStr)
		}
		log.Printf("Python output (first %d chars): %s", previewLen, outputStr[:previewLen])
	}

	// If execution succeeded, all output goes to stdout
	if execErr == nil {
		return outputStr, "", nil
	}

	// If execution failed, check if there's any output before the error
	// Python errors typically go to stderr, but print() goes to stdout
	// CombinedOutput mixes them, so we'll put it all in stdout if there's content
	if len(outputStr) > 0 {
		// If there's output, show it in stdout and error in stderr
		return outputStr, execErr.Error(), execErr
	}

	// No output, just error
	return "", execErr.Error(), execErr
}

func runJavaScriptCode(dir, input string) (stdout, stderr string, err error) {
	mainJs := filepath.Join(dir, "Main.js")
	if _, e := os.Stat(mainJs); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.js"))
		if len(files) > 0 {
			mainJs = files[0]
		} else {
			return "", "", fmt.Errorf("JavaScript file not found")
		}
	}

	cmd := exec.Command("node", mainJs)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runTypeScriptCode(dir, input string) (stdout, stderr string, err error) {
	mainTs := filepath.Join(dir, "Main.ts")
	if _, e := os.Stat(mainTs); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.ts"))
		if len(files) > 0 {
			mainTs = files[0]
		} else {
			return "", "", fmt.Errorf("TypeScript file not found")
		}
	}

	// Compile TypeScript
	compileCmd := exec.Command("tsc", mainTs)
	compileCmd.Dir = dir
	if compileErr := compileCmd.Run(); compileErr != nil {
		return "", "", fmt.Errorf("TypeScript compilation failed: %v", compileErr)
	}

	// Run compiled JavaScript
	mainJs := strings.TrimSuffix(mainTs, ".ts") + ".js"
	cmd := exec.Command("node", mainJs)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runJavaCode(dir, input string) (stdout, stderr string, err error) {
	mainJava := filepath.Join(dir, "Main.java")
	if _, e := os.Stat(mainJava); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.java"))
		if len(files) > 0 {
			mainJava = files[0]
		} else {
			return "", "", fmt.Errorf("Java file not found")
		}
	}

	// Compile
	compileCmd := exec.Command("javac", mainJava)
	compileCmd.Dir = dir
	if compileErr := compileCmd.Run(); compileErr != nil {
		return "", "", fmt.Errorf("Java compilation failed: %v", compileErr)
	}

	// Run
	cmd := exec.Command("java", "-cp", dir, "Main")
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runCppCode(dir, input string) (stdout, stderr string, err error) {
	mainCpp := filepath.Join(dir, "Main.cpp")
	if _, e := os.Stat(mainCpp); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.cpp"))
		if len(files) > 0 {
			mainCpp = files[0]
		} else {
			return "", "", fmt.Errorf("C++ file not found")
		}
	}

	exePath := filepath.Join(dir, "main")
	compileCmd := exec.Command("g++", "-o", exePath, mainCpp)
	if compileErr := compileCmd.Run(); compileErr != nil {
		return "", "", fmt.Errorf("C++ compilation failed: %v", compileErr)
	}

	cmd := exec.Command(exePath)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runCCode(dir, input string) (stdout, stderr string, err error) {
	mainC := filepath.Join(dir, "Main.c")
	if _, e := os.Stat(mainC); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.c"))
		if len(files) > 0 {
			mainC = files[0]
		} else {
			return "", "", fmt.Errorf("C file not found")
		}
	}

	exePath := filepath.Join(dir, "main")
	compileCmd := exec.Command("gcc", "-o", exePath, mainC)
	if compileErr := compileCmd.Run(); compileErr != nil {
		return "", "", fmt.Errorf("C compilation failed: %v", compileErr)
	}

	cmd := exec.Command(exePath)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runGoCode(dir, input string) (stdout, stderr string, err error) {
	mainGo := filepath.Join(dir, "main.go")
	if _, e := os.Stat(mainGo); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.go"))
		if len(files) > 0 {
			mainGo = files[0]
		} else {
			return "", "", fmt.Errorf("Go file not found")
		}
	}

	cmd := exec.Command("go", "run", mainGo)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runRustCode(dir, input string) (stdout, stderr string, err error) {
	mainRs := filepath.Join(dir, "main.rs")
	if _, e := os.Stat(mainRs); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.rs"))
		if len(files) > 0 {
			mainRs = files[0]
		} else {
			return "", "", fmt.Errorf("Rust file not found")
		}
	}

	exePath := filepath.Join(dir, "main")
	compileCmd := exec.Command("rustc", "-o", exePath, mainRs)
	if compileErr := compileCmd.Run(); compileErr != nil {
		return "", "", fmt.Errorf("Rust compilation failed: %v", compileErr)
	}

	cmd := exec.Command(exePath)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runSwiftCode(dir, input string) (stdout, stderr string, err error) {
	mainSwift := filepath.Join(dir, "main.swift")
	if _, e := os.Stat(mainSwift); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.swift"))
		if len(files) > 0 {
			mainSwift = files[0]
		} else {
			return "", "", fmt.Errorf("Swift file not found")
		}
	}

	cmd := exec.Command("swift", mainSwift)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runRubyCode(dir, input string) (stdout, stderr string, err error) {
	mainRb := filepath.Join(dir, "main.rb")
	if _, e := os.Stat(mainRb); e != nil {
		files, _ := filepath.Glob(filepath.Join(dir, "*.rb"))
		if len(files) > 0 {
			mainRb = files[0]
		} else {
			return "", "", fmt.Errorf("Ruby file not found")
		}
	}

	cmd := exec.Command("ruby", mainRb)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runBashCode(dir, input string) (stdout, stderr string, err error) {
	// Try common bash file names
	var bashFile string
	possibleNames := []string{"main.sh", "script.sh", "Main.sh", "Script.sh"}
	for _, name := range possibleNames {
		path := filepath.Join(dir, name)
		if _, e := os.Stat(path); e == nil {
			bashFile = path
			break
		}
	}

	if bashFile == "" {
		// Try to find any .sh or .bash file
		files, _ := filepath.Glob(filepath.Join(dir, "*.sh"))
		if len(files) > 0 {
			bashFile = files[0]
		} else {
			files, _ = filepath.Glob(filepath.Join(dir, "*.bash"))
			if len(files) > 0 {
				bashFile = files[0]
			} else {
				return "", "", fmt.Errorf("Bash file not found")
			}
		}
	}

	cmd := exec.Command("bash", bashFile)
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(input)
	out, execErr := cmd.CombinedOutput()

	if execErr != nil {
		return "", string(out), execErr
	}
	return string(out), "", nil
}

func runSqlCode(dir, input string) (stdout, stderr string, err error) {
	// SQL execution would need a database connection
	// For now, return an error indicating SQL needs special handling
	return "", "", fmt.Errorf("SQL execution requires database setup")
}

func abs(p string) string {
	a, err := filepath.Abs(p)
	if err != nil {
		log.Printf("Failed to get absolute path for %s: %v", p, err)
		return p
	}
	return filepath.ToSlash(a) // Use forward slashes for consistency across platforms
}
func createProblem(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", 405)
		return
	}

	var req Problem
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("JSON decode error: %v", err)
		http.Error(w, "Bad request", 400)
		return
	}

	// Generate problem ID from title
	req.ID = strings.ToLower(strings.ReplaceAll(strings.ReplaceAll(req.Title, " ", "-"), "_", "-"))
	req.ID = strings.ReplaceAll(req.ID, "--", "-")

	// Create problem directory
	problemDir := filepath.Join(dataDir, req.ID)
	if err := os.MkdirAll(problemDir, 0755); err != nil {
		log.Printf("Failed to create problem directory: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	// Create v1 directory
	v1Dir := filepath.Join(problemDir, "v1")
	if err := os.MkdirAll(v1Dir, 0755); err != nil {
		log.Printf("Failed to create v1 directory: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	// Create manifest.json
	manifestPath := filepath.Join(problemDir, "manifest.json")
	manifestData, err := json.MarshalIndent(req, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal manifest: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	if err := os.WriteFile(manifestPath, manifestData, 0644); err != nil {
		log.Printf("Failed to write manifest: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	// Create basic test files
	publicDir := filepath.Join(v1Dir, "public")
	if err := os.MkdirAll(publicDir, 0755); err != nil {
		log.Printf("Failed to create public directory: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	// Create sample input and output files
	inputFile := filepath.Join(publicDir, "01.in")
	outputFile := filepath.Join(publicDir, "01.out")

	if err := os.WriteFile(inputFile, []byte(""), 0644); err != nil {
		log.Printf("Failed to create input file: %v", err)
	}

	if err := os.WriteFile(outputFile, []byte("Hello, World!"), 0644); err != nil {
		log.Printf("Failed to create output file: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": req.ID})
}

func getTestCases(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "GET only", 405)
		return
	}

	// Extract problem ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/problem/")
	if path == "" {
		http.Error(w, "Problem ID required", 400)
		return
	}

	problemDir := filepath.Join(dataDir, path, "v1")

	// Try different possible locations for test cases
	var publicDir string
	if _, err := os.Stat(filepath.Join(problemDir, "public")); err == nil {
		publicDir = filepath.Join(problemDir, "public")
	} else if _, err := os.Stat(filepath.Join(problemDir, "sql", "public")); err == nil {
		publicDir = filepath.Join(problemDir, "sql", "public")
	} else {
		// Return empty test cases if no test directory found
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]string{})
		return
	}

	entries, err := os.ReadDir(publicDir)
	if err != nil {
		log.Printf("Error reading test directory: %v", err)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]string{})
		return
	}

	var testCases []map[string]string

	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".in") {
			testName := strings.TrimSuffix(entry.Name(), ".in")
			inputFile := filepath.Join(publicDir, entry.Name())
			outputFile := filepath.Join(publicDir, testName+".out")

			inputContent, err := os.ReadFile(inputFile)
			if err != nil {
				continue
			}

			outputContent, err := os.ReadFile(outputFile)
			if err != nil {
				continue
			}

			testCases = append(testCases, map[string]string{
				"name":   testName,
				"input":  string(inputContent),
				"output": string(outputContent),
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	// Ensure we always return an array, not null
	if testCases == nil {
		testCases = []map[string]string{}
	}
	json.NewEncoder(w).Encode(testCases)
}

func deleteAllTestCases(w http.ResponseWriter, r *http.Request, problemID string) {
	if r.Method != http.MethodDelete {
		http.Error(w, "DELETE only", 405)
		return
	}

	problemDir := filepath.Join(dataDir, problemID, "v1")

	// Try different possible locations for test cases
	var publicDir string
	if _, err := os.Stat(filepath.Join(problemDir, "public")); err == nil {
		publicDir = filepath.Join(problemDir, "public")
	} else if _, err := os.Stat(filepath.Join(problemDir, "sql", "public")); err == nil {
		publicDir = filepath.Join(problemDir, "sql", "public")
	} else {
		// No test directory found, return success
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "No test cases found"})
		return
	}

	// Remove all test files
	entries, err := os.ReadDir(publicDir)
	if err != nil {
		log.Printf("Error reading test directory: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	deletedCount := 0
	for _, entry := range entries {
		if !entry.IsDir() && (strings.HasSuffix(entry.Name(), ".in") || strings.HasSuffix(entry.Name(), ".out")) {
			testFile := filepath.Join(publicDir, entry.Name())
			if err := os.Remove(testFile); err != nil {
				log.Printf("Failed to delete test file %s: %v", testFile, err)
			} else {
				deletedCount++
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":        "success",
		"message":       fmt.Sprintf("Deleted %d test files", deletedCount),
		"deleted_count": deletedCount,
	})
}

func updateTestCases(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "PUT only", 405)
		return
	}

	// Extract problem ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/problem/")
	if path == "" {
		http.Error(w, "Problem ID required", 400)
		return
	}

	var testCases []map[string]string
	if err := json.NewDecoder(r.Body).Decode(&testCases); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	problemDir := filepath.Join(dataDir, path, "v1")

	// Try different possible locations for test cases
	var publicDir string
	if _, err := os.Stat(filepath.Join(problemDir, "public")); err == nil {
		publicDir = filepath.Join(problemDir, "public")
	} else if _, err := os.Stat(filepath.Join(problemDir, "sql", "public")); err == nil {
		publicDir = filepath.Join(problemDir, "sql", "public")
	} else {
		// Create public directory if it doesn't exist
		publicDir = filepath.Join(problemDir, "public")
		if err := os.MkdirAll(publicDir, 0755); err != nil {
			log.Printf("Failed to create public directory: %v", err)
			http.Error(w, "Internal server error", 500)
			return
		}
	}

	// Remove existing test files
	entries, err := os.ReadDir(publicDir)
	if err == nil {
		for _, entry := range entries {
			if strings.HasSuffix(entry.Name(), ".in") || strings.HasSuffix(entry.Name(), ".out") {
				os.Remove(filepath.Join(publicDir, entry.Name()))
			}
		}
	}

	// Write new test cases
	for i, testCase := range testCases {
		testNum := fmt.Sprintf("%02d", i+1)
		inputFile := filepath.Join(publicDir, testNum+".in")
		outputFile := filepath.Join(publicDir, testNum+".out")

		if err := os.WriteFile(inputFile, []byte(testCase["input"]), 0644); err != nil {
			log.Printf("Failed to write input file: %v", err)
			continue
		}

		if err := os.WriteFile(outputFile, []byte(testCase["output"]), 0644); err != nil {
			log.Printf("Failed to write output file: %v", err)
			continue
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func listUploadedFiles(w http.ResponseWriter, r *http.Request, problemID string) {
	uploadDir := filepath.Join(dataDir, problemID, "uploads")
	log.Printf("Listing files in directory: %s", uploadDir)

	files, err := os.ReadDir(uploadDir)
	if err != nil {
		if os.IsNotExist(err) {
			// Return empty array if directory doesn't exist
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]map[string]interface{}{})
			return
		}
		log.Printf("Failed to read upload directory: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	var fileList []map[string]interface{}
	for _, file := range files {
		if !file.IsDir() {
			fileInfo, err := file.Info()
			if err != nil {
				continue
			}

			fileList = append(fileList, map[string]interface{}{
				"name": file.Name(),
				"size": fileInfo.Size(),
				"type": getFileType(file.Name()),
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fileList)
}

func deleteUploadedFile(w http.ResponseWriter, r *http.Request, problemID, filename string) {
	filePath := filepath.Join(dataDir, problemID, "uploads", filename)
	log.Printf("Deleting file: %s", filePath)

	err := os.Remove(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "File not found", 404)
			return
		}
		log.Printf("Failed to delete file: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func getFileType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".csv":
		return "text/csv"
	case ".json":
		return "application/json"
	case ".txt":
		return "text/plain"
	case ".xlsx":
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case ".xls":
		return "application/vnd.ms-excel"
	case ".py":
		return "text/x-python"
	case ".js":
		return "application/javascript"
	case ".java":
		return "text/x-java-source"
	case ".cpp":
		return "text/x-c++src"
	case ".sql":
		return "application/sql"
	default:
		return "application/octet-stream"
	}
}

func uploadFile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", 405)
		return
	}

	// Parse multipart form
	err := r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, "Failed to parse form", 400)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", 400)
		return
	}
	defer file.Close()

	// Get problem ID from form
	problemID := r.FormValue("problemId")
	log.Printf("Upload request - Problem ID: %s, Filename: %s", problemID, header.Filename)
	if problemID == "" {
		log.Printf("Problem ID is empty")
		http.Error(w, "Problem ID required", 400)
		return
	}

	// Create problem-specific uploads directory
	uploadDir := filepath.Join(dataDir, problemID, "uploads")
	log.Printf("Creating upload directory: %s", uploadDir)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("Failed to create upload directory: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}

	// Save file
	filePath := filepath.Join(uploadDir, header.Filename)
	log.Printf("Saving file to: %s", filePath)
	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("Failed to create file: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		log.Printf("Failed to save file: %v", err)
		http.Error(w, "Internal server error", 500)
		return
	}
	log.Printf("File saved successfully: %s", filePath)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":   "success",
		"url":      "/api/uploads/" + header.Filename,
		"filename": header.Filename,
	})
}

func getEnv(k, d string) string {
	v := os.Getenv(k)
	if v == "" {
		return d
	}
	return v
}

func generateQuestions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", 405)
		return
	}

	var req AgentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("JSON decode error: %v", err)
		http.Error(w, "Bad request", 400)
		return
	}

	// Validate required fields
	if req.Company == "" || req.Role == "" || req.Level == "" {
		http.Error(w, "Company, role, and level are required", 400)
		return
	}

	// Set default count if not provided
	if req.Count <= 0 {
		req.Count = 3
	}

	log.Printf("Agent request: Company=%s, Role=%s, Level=%s, Count=%d", req.Company, req.Role, req.Level, req.Count)

	// Generate questions using the agent
	problems, err := callAgentAPI(req)
	if err != nil {
		log.Printf("Agent API error: %v", err)
		// Return error to user instead of silently falling back
		response := AgentResponse{
			Status:  "error",
			Message: "Failed to generate AI questions: " + err.Error() + ". Please check your GEMINI_API_KEY and try again.",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Save generated problems to the data directory
	savedProblems := make([]Problem, 0)
	for _, problem := range problems {
		if err := saveGeneratedProblem(problem); err != nil {
			log.Printf("Failed to save problem %s: %v", problem.ID, err)
			continue
		}
		savedProblems = append(savedProblems, problem)
	}

	response := AgentResponse{
		Status:   "success",
		Problems: savedProblems,
		Message:  fmt.Sprintf("Generated %d questions for %s %s position at %s", len(savedProblems), req.Level, req.Role, req.Company),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func callAgentAPI(req AgentRequest) ([]Problem, error) {
	// Try to use real AI generation first, fallback to mock ONLY if API key is not available
	apiKey := os.Getenv("GEMINI_API_KEY")
	log.Printf("GEMINI_API_KEY status: %s", func() string {
		if apiKey == "" {
			return "NOT FOUND"
		}
		return "FOUND (length: " + fmt.Sprintf("%d", len(apiKey)) + ")"
	}())

	if apiKey == "" {
		log.Printf("GEMINI_API_KEY not found, using mock questions")
		return generateMockQuestions(req), nil
	}

	// Validate API key format (should start with AIza)
	if !strings.HasPrefix(apiKey, "AIza") {
		log.Printf("WARNING: API key format appears invalid (should start with 'AIza'). Attempting anyway...")
	}

	// Use Google Gemini for real AI generation
	log.Printf("Attempting AI generation with key: %s...", apiKey[:min(10, len(apiKey))]+"...")
	problems, err := generateAIGuestions(req, apiKey)
	if err != nil {
		// Don't silently fall back - return error so user knows what went wrong
		log.Printf("AI generation failed: %v", err)

		// Only fall back to mock questions if it's a truly fatal error (invalid API key, no internet, etc.)
		// For rate limits and parsing errors, we should retry or show error to user
		if strings.Contains(err.Error(), "invalid API key") ||
			strings.Contains(err.Error(), "authentication") ||
			strings.Contains(err.Error(), "network") ||
			strings.Contains(err.Error(), "connection") {
			log.Printf("Fatal error detected, falling back to mock questions")
			return generateMockQuestions(req), nil
		}

		// For other errors (rate limits, parsing), return error so user can retry
		return nil, fmt.Errorf("AI generation failed: %v. Please check your API key and try again", err)
	}

	if len(problems) == 0 {
		return nil, fmt.Errorf("AI generation returned 0 problems. Please try again.")
	}

	log.Printf("AI generation successful, generated %d problems", len(problems))
	return problems, nil
}

func generateAIGuestions(req AgentRequest, apiKey string) ([]Problem, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}
	defer client.Close()

	// Use gemini-2.5-flash model (latest and most capable)
	modelNames := []string{"gemini-2.5-flash", "gemini-pro", "models/gemini-pro"}
	var model *genai.GenerativeModel
	var modelName string

	for _, name := range modelNames {
		model = client.GenerativeModel(name)
		modelName = name
		log.Printf("Attempting to use model: %s", name)
		break
	}

	log.Printf("Using model: %s", modelName)

	// Create a detailed prompt for the AI with strict JSON format requirement
	prompt := fmt.Sprintf(`You are a coding interview question generator. Generate exactly %d unique coding interview questions for a %s %s position at %s.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no explanations, no code blocks - just pure JSON.

Requirements:
- Questions should be appropriate for %s level
- Focus on %s role-specific skills and technologies
- Include a mix of algorithmic, data structure, and practical problems
- Each question should have a clear problem statement with examples
- Include sample input/output examples
- Provide starter code stubs for Python, Java, and C++

For %s level %s roles at %s, consider:
- %s-specific challenges and scenarios
- Technologies commonly used in %s development
- Problem complexity appropriate for %s level

Return ONLY a JSON array (no markdown, no code blocks, no explanations) with this exact format:
[
  {
    "id": "unique-kebab-case-id",
    "title": "Descriptive Title",
    "statement": "Detailed problem description with examples and constraints",
    "languages": ["python", "java", "cpp"],
    "stub": {
      "python": "def solution():\n    # Your code here\n    pass",
      "java": "class Solution {\n    public void solution() {\n        // Your code here\n    }\n}",
      "cpp": "class Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};"
    }
  }
]

IMPORTANT: Return ONLY the JSON array, nothing else. No markdown formatting, no code blocks, no explanations.`,
		req.Count, req.Level, req.Role, req.Company, req.Level, req.Role, req.Level, req.Role, req.Company, req.Role, req.Role, req.Level)

	// Retry logic for rate limiting with exponential backoff
	// Also try different models if one fails
	maxRetries := 5
	var resp *genai.GenerateContentResponse
	var lastErr error
	modelIndex := 0

	for attempt := 0; attempt < maxRetries; attempt++ {
		// Try different model if we get a 404 error
		if attempt > 0 && lastErr != nil {
			if strings.Contains(lastErr.Error(), "404") || strings.Contains(lastErr.Error(), "not found") {
				modelIndex++
				if modelIndex < len(modelNames) {
					modelName = modelNames[modelIndex]
					model = client.GenerativeModel(modelName)
					log.Printf("Switching to model: %s", modelName)
					lastErr = nil // Reset error to retry with new model
				}
			}
		}

		if attempt > 0 && lastErr != nil {
			// Exponential backoff: 2s, 4s, 8s, 16s
			waitTime := time.Duration(1<<uint(attempt-1)) * time.Second
			log.Printf("Retrying AI generation (attempt %d/%d) after %v...", attempt+1, maxRetries, waitTime)
			time.Sleep(waitTime)
		}

		resp, err = model.GenerateContent(ctx, genai.Text(prompt))
		if err == nil {
			log.Printf("AI API call successful on attempt %d using model %s", attempt+1, modelName)
			break // Success
		}

		lastErr = err

		// Check if it's a rate limit error
		if gerr, ok := err.(*googleapi.Error); ok {
			if gerr.Code == 429 {
				log.Printf("Rate limit error (429) on attempt %d: %v", attempt+1, err)
				// Check for Retry-After header
				if retryAfter := gerr.Header.Get("Retry-After"); retryAfter != "" {
					log.Printf("API suggests retrying after: %s", retryAfter)
				}
				if attempt < maxRetries-1 {
					continue // Retry
				}
			} else if gerr.Code == 401 || gerr.Code == 403 {
				// Authentication/authorization errors - don't retry
				return nil, fmt.Errorf("authentication failed (code %d): %v. Please check your API key.", gerr.Code, err)
			} else if gerr.Code == 404 {
				// Model not found - try next model
				log.Printf("Model %s not found (404), will try next model", modelName)
				if modelIndex < len(modelNames)-1 {
					continue // Try next model
				}
			}
		}

		// For other errors, log and continue retrying
		log.Printf("Error on attempt %d with model %s: %v", attempt+1, modelName, err)

		// For final attempt, return error
		if attempt == maxRetries-1 {
			return nil, fmt.Errorf("failed to generate content after %d attempts (tried models: %v): %v", maxRetries, modelNames[:modelIndex+1], lastErr)
		}
	}

	if resp == nil {
		return nil, fmt.Errorf("no response received from AI model")
	}

	if len(resp.Candidates) == 0 {
		return nil, fmt.Errorf("no candidates in response")
	}

	if len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no content parts in response")
	}

	// Safely extract the text response
	var responseText string
	part := resp.Candidates[0].Content.Parts[0]
	switch v := part.(type) {
	case genai.Text:
		responseText = string(v)
	default:
		// Try to convert to string
		responseText = fmt.Sprintf("%v", part)
		log.Printf("Warning: Unexpected response type %T, converting to string", part)
	}

	if responseText == "" {
		return nil, fmt.Errorf("empty response text")
	}

	// Clean up the response - remove markdown code blocks if present
	cleanText := responseText
	cleanText = strings.TrimSpace(cleanText)

	// Remove markdown code blocks (```json ... ``` or ``` ... ```)
	if strings.HasPrefix(cleanText, "```json") {
		cleanText = strings.TrimPrefix(cleanText, "```json")
		cleanText = strings.TrimSuffix(cleanText, "```")
		cleanText = strings.TrimSpace(cleanText)
	} else if strings.HasPrefix(cleanText, "```") {
		cleanText = strings.TrimPrefix(cleanText, "```")
		// Find the last ``` and remove it
		lastIdx := strings.LastIndex(cleanText, "```")
		if lastIdx >= 0 {
			cleanText = cleanText[:lastIdx] + cleanText[lastIdx+3:]
		}
		cleanText = strings.TrimSpace(cleanText)
	}

	// Try to find JSON array start/end if wrapped in text
	if idx := strings.Index(cleanText, "["); idx >= 0 {
		cleanText = cleanText[idx:]
	}
	if idx := strings.LastIndex(cleanText, "]"); idx >= 0 {
		cleanText = cleanText[:idx+1]
	}

	cleanText = strings.TrimSpace(cleanText)

	// Log first 200 chars of response for debugging
	if len(cleanText) > 200 {
		log.Printf("AI response preview: %s...", cleanText[:200])
	} else {
		log.Printf("AI response: %s", cleanText)
	}

	// Parse the JSON response
	var aiProblems []struct {
		ID        string            `json:"id"`
		Title     string            `json:"title"`
		Statement string            `json:"statement"`
		Languages []string          `json:"languages"`
		Stub      map[string]string `json:"stub"`
	}

	if err := json.Unmarshal([]byte(cleanText), &aiProblems); err != nil {
		log.Printf("JSON parsing error: %v", err)
		log.Printf("Response text that failed to parse: %s", cleanText)
		return nil, fmt.Errorf("failed to parse AI response as JSON: %v. Response: %s", err, cleanText[:min(500, len(cleanText))])
	}

	if len(aiProblems) == 0 {
		return nil, fmt.Errorf("no problems generated from AI response")
	}

	// Convert to our Problem format
	problems := make([]Problem, len(aiProblems))
	baseID := fmt.Sprintf("%s-%s-%s", strings.ToLower(req.Company), strings.ToLower(req.Role), strings.ToLower(req.Level))

	for i, aiProblem := range aiProblems {
		// Ensure required fields are present
		if aiProblem.ID == "" {
			aiProblem.ID = fmt.Sprintf("problem-%d", i+1)
		}
		if aiProblem.Title == "" {
			aiProblem.Title = fmt.Sprintf("Problem %d", i+1)
		}
		if len(aiProblem.Languages) == 0 {
			aiProblem.Languages = []string{"python", "java", "cpp"}
		}
		if aiProblem.Stub == nil {
			aiProblem.Stub = make(map[string]string)
		}

		problems[i] = Problem{
			ID:        fmt.Sprintf("%s-%s", baseID, aiProblem.ID),
			Title:     aiProblem.Title,
			Statement: aiProblem.Statement,
			Languages: aiProblem.Languages,
			Stub:      aiProblem.Stub,
		}
	}

	log.Printf("Successfully generated %d problems using model %s", len(problems), modelName)
	return problems, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func cleanAIGuestions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", 405)
		return
	}

	log.Printf("Cleaning AI-generated problems...")

	// Get list of all problems
	entries, err := os.ReadDir(dataDir)
	if err != nil {
		log.Printf("Error reading dataDir %s: %v", dataDir, err)
		http.Error(w, "Internal server error", 500)
		return
	}

	cleanedCount := 0
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		// Check if this is an AI-generated problem
		if isAIGeneratedProblem(entry.Name()) {
			problemPath := filepath.Join(dataDir, entry.Name())
			log.Printf("Removing AI-generated problem: %s", entry.Name())

			// Remove the entire problem directory
			if err := os.RemoveAll(problemPath); err != nil {
				log.Printf("Error removing problem %s: %v", entry.Name(), err)
				continue
			}
			cleanedCount++
		}
	}

	response := map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Cleaned %d AI-generated problems", cleanedCount),
		"count":   cleanedCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func isAIGeneratedProblem(problemID string) bool {
	// AI-generated problems follow the pattern: company-role-level-problemtype
	// Examples: "google-software engineer-senior-array-rotation"
	// We can detect this by checking if the ID contains multiple hyphens and common company names

	// List of original problem IDs that should NEVER be deleted
	originalProblems := []string{
		"float-mean", "ml-iris-classification", "search-engine-indexing", "shell-hello",
		"streaming-median", "test-problem", "test-question-upload", "top-customers-sql",
		"universal-language-test",
	}

	// Check if this is an original problem
	for _, original := range originalProblems {
		if problemID == original {
			return false // Never delete original problems
		}
	}

	// List of common company names that might appear in AI-generated problems
	companyNames := []string{
		"google", "microsoft", "amazon", "apple", "meta", "facebook", "netflix", "uber", "airbnb",
		"spotify", "tesla", "twitter", "linkedin", "salesforce", "oracle", "ibm", "intel", "nvidia",
		"adobe", "shopify", "stripe", "square", "paypal", "zoom", "slack", "discord", "reddit",
		"pinterest", "snapchat", "tiktok", "youtube", "instagram", "whatsapp", "telegram",
		"dropbox", "box", "onedrive", "icloud", "github", "gitlab", "bitbucket", "atlassian",
		"jira", "confluence", "trello", "asana", "notion", "figma", "sketch", "canva", "adobe",
		"autodesk", "unity", "unreal", "roblox", "minecraft", "epic", "valve", "steam",
		"twitch", "youtube", "vimeo", "dailymotion", "hulu", "disney", "hbo", "paramount",
		"warner", "sony", "nintendo", "xbox", "playstation", "oculus", "htc", "pico",
		"magic", "leap", "hololens", "ar", "vr", "metaverse", "web3", "crypto", "blockchain",
		"bitcoin", "ethereum", "solana", "polygon", "cardano", "dogecoin", "shiba", "meme",
		"nft", "defi", "dao", "smart", "contract", "dapp", "wallet", "exchange", "binance",
		"coinbase", "kraken", "gemini", "ftx", "celsius", "blockfi", "nexo", "crypto.com",
		"robinhood", "webull", "etrade", "td", "ameritrade", "schwab", "fidelity", "vanguard",
		"blackrock", "goldman", "morgan", "jpmorgan", "wells", "fargo", "bank", "of", "america",
		"citibank", "chase", "capital", "one", "discover", "american", "express", "visa",
		"mastercard", "paypal", "square", "stripe", "adyen", "braintree", "authorize", "net",
		"worldpay", "fiserv", "first", "data", "global", "payments", "tsys", "elavon",
		"heartland", "paymentech", "moneris", "sage", "quickbooks", "xero", "freshbooks",
		"wave", "zoho", "books", "kashoo", "lessaccounting", "freeagent", "clearbooks",
		"kashflow", "sage", "one", "turbotax", "hr", "block", "taxact", "credit", "karma",
		"mint", "ynab", "you", "need", "budget", "pocketguard", "goodbudget", "everydollar",
		"simplifi", "by", "quicken", "personal", "capital", "empower", "tiller", "money",
		"copilot", "money", "lunch", "money", "spendee", "wallet", "by", "budgetbakers",
		"expensify", "receipt", "bank", "shoeboxed", "mileiq", "everlance", "stride", "tax",
		"hurdlr", "quickbooks", "self", "employed", "freshbooks", "cloud", "accounting",
		"xero", "small", "business", "sage", "business", "cloud", "kashoo", "wave", "apps",
		"zoho", "books", "lessaccounting", "freeagent", "clearbooks", "kashflow", "sage",
		"one", "turbotax", "business", "taxact", "business", "hr", "block", "business",
		"credit", "karma", "business", "mint", "business", "ynab", "business", "pocketguard",
		"business", "goodbudget", "business", "everydollar", "business", "simplifi", "business",
		"personal", "capital", "business", "empower", "business", "tiller", "business",
		"copilot", "business", "lunch", "business", "spendee", "business", "wallet", "business",
		"expensify", "business", "receipt", "bank", "business", "shoeboxed", "business",
		"mileiq", "business", "everlance", "business", "stride", "business", "tax", "business",
		"hurdlr", "business", "quickbooks", "business", "self", "employed", "business",
		"testcompany", "testai", "test", "company", "ai", "generated", "mock", "sample",
	}

	// Convert to lowercase for case-insensitive matching
	problemIDLower := strings.ToLower(problemID)

	// Check if the problem ID contains any company name
	for _, company := range companyNames {
		if strings.Contains(problemIDLower, company) {
			// Additional check: AI-generated problems typically have the pattern
			// company-role-level-problemtype with multiple hyphens
			parts := strings.Split(problemIDLower, "-")
			if len(parts) >= 4 {
				return true
			}
		}
	}

	return false
}

func generateMockQuestions(req AgentRequest) []Problem {
	// Generate mock questions based on the request parameters
	baseID := fmt.Sprintf("%s-%s-%s", strings.ToLower(req.Company), strings.ToLower(req.Role), strings.ToLower(req.Level))

	questions := []Problem{
		{
			ID:    fmt.Sprintf("%s-array-rotation", baseID),
			Title: fmt.Sprintf("Array Rotation - %s %s", req.Level, req.Role),
			Statement: fmt.Sprintf(`Given an array of integers and a rotation count, rotate the array to the right by k steps.

This is a fundamental problem for %s level %s positions at %s.

Example:
Input: nums = [1,2,3,4,5,6,7], k = 3
Output: [5,6,7,1,2,3,4]

Explanation:
- Rotate 1 step to the right: [7,1,2,3,4,5,6]
- Rotate 2 steps to the right: [6,7,1,2,3,4,5]
- Rotate 3 steps to the right: [5,6,7,1,2,3,4]

Constraints:
- 1 <= nums.length <= 10^5
- -2^31 <= nums[i] <= 2^31 - 1
- 0 <= k <= 10^5`, req.Level, req.Role, req.Company),
			Languages: []string{"python", "java", "cpp"},
			Stub: map[string]string{
				"python": "def rotate(nums, k):\n    # Your code here\n    pass",
				"java":   "class Solution {\n    public void rotate(int[] nums, int k) {\n        // Your code here\n    }\n}",
				"cpp":    "class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        // Your code here\n    }\n};",
			},
		},
		{
			ID:    fmt.Sprintf("%s-binary-search", baseID),
			Title: fmt.Sprintf("Binary Search Variant - %s %s", req.Level, req.Role),
			Statement: fmt.Sprintf(`Implement a binary search to find the target element in a sorted array.

This problem tests your understanding of efficient search algorithms, important for %s level %s roles at %s.

Example:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4

Input: nums = [-1,0,3,5,9,12], target = 2
Output: -1
Explanation: 2 does not exist in nums so return -1

Constraints:
- 1 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- All the integers in nums are unique
- nums is sorted in ascending order`, req.Level, req.Role, req.Company),
			Languages: []string{"python", "java", "cpp"},
			Stub: map[string]string{
				"python": "def search(nums, target):\n    # Your code here\n    pass",
				"java":   "class Solution {\n    public int search(int[] nums, int target) {\n        // Your code here\n        return -1;\n    }\n}",
				"cpp":    "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Your code here\n        return -1;\n    }\n};",
			},
		},
		{
			ID:    fmt.Sprintf("%s-string-manipulation", baseID),
			Title: fmt.Sprintf("String Processing - %s %s", req.Level, req.Role),
			Statement: fmt.Sprintf(`Given a string, find the length of the longest substring without repeating characters.

This problem demonstrates string manipulation skills essential for %s level %s positions at %s.

Example:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.

Constraints:
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces`, req.Level, req.Role, req.Company),
			Languages: []string{"python", "java", "cpp"},
			Stub: map[string]string{
				"python": "def lengthOfLongestSubstring(s):\n    # Your code here\n    pass",
				"java":   "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}",
				"cpp":    "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        return 0;\n    }\n};",
			},
		},
	}

	// Return only the requested number of questions
	if len(questions) > req.Count {
		questions = questions[:req.Count]
	} else if len(questions) < req.Count {
		// If we need more questions, duplicate and modify the existing ones
		for len(questions) < req.Count {
			// Create variations of existing questions
			baseIndex := (len(questions) - 3) % 3 // Cycle through the first 3 questions
			if baseIndex < 0 {
				baseIndex = 0
			}
			baseQuestion := questions[baseIndex]
			newQuestion := baseQuestion
			newQuestion.ID = fmt.Sprintf("%s-variant-%d", baseQuestion.ID, len(questions)+1)
			newQuestion.Title = fmt.Sprintf("%s (Variant %d)", baseQuestion.Title, len(questions)+1)
			questions = append(questions, newQuestion)
		}
	}

	return questions
}

func saveGeneratedProblem(problem Problem) error {
	// Create problem directory
	problemDir := filepath.Join(dataDir, problem.ID)
	if err := os.MkdirAll(problemDir, 0755); err != nil {
		return fmt.Errorf("failed to create problem directory: %v", err)
	}

	// Create v1 directory
	v1Dir := filepath.Join(problemDir, "v1")
	if err := os.MkdirAll(v1Dir, 0755); err != nil {
		return fmt.Errorf("failed to create v1 directory: %v", err)
	}

	// Create manifest.json
	manifestPath := filepath.Join(problemDir, "manifest.json")
	manifestData, err := json.MarshalIndent(problem, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal manifest: %v", err)
	}

	if err := os.WriteFile(manifestPath, manifestData, 0644); err != nil {
		return fmt.Errorf("failed to write manifest: %v", err)
	}

	// Create basic test files
	publicDir := filepath.Join(v1Dir, "public")
	if err := os.MkdirAll(publicDir, 0755); err != nil {
		return fmt.Errorf("failed to create public directory: %v", err)
	}

	// Generate test cases only if requested (optional)
	if shouldGenerateTestCases(problem.ID) {
		testCases := generateTestCases(problem.ID)

		for i, testCase := range testCases {
			testNum := fmt.Sprintf("%02d", i+1)
			inputFile := filepath.Join(publicDir, testNum+".in")
			outputFile := filepath.Join(publicDir, testNum+".out")

			if err := os.WriteFile(inputFile, []byte(testCase.Input), 0644); err != nil {
				return fmt.Errorf("failed to create input file %s: %v", testNum+".in", err)
			}

			if err := os.WriteFile(outputFile, []byte(testCase.Output), 0644); err != nil {
				return fmt.Errorf("failed to create output file %s: %v", testNum+".out", err)
			}
		}
	}

	return nil
}

func shouldGenerateTestCases(problemID string) bool {
	// Generate test cases for most problems, but allow some to be created without them
	// This can be controlled by adding a "no-tests" keyword to the problem ID
	if strings.Contains(problemID, "no-tests") {
		return false
	}

	// Default to generating test cases for most problems
	return true
}

func generateTestCases(problemID string) []TestCase {
	// Generate multiple test cases based on problem type
	testCases := []TestCase{}

	if strings.Contains(problemID, "array-rotation") {
		testCases = []TestCase{
			{"7\n1 2 3 4 5 6 7\n3", "5 6 7 1 2 3 4"},
			{"5\n1 2 3 4 5\n2", "4 5 1 2 3"},
			{"3\n1 2 3\n1", "3 1 2"},
			{"1\n1\n0", "1"},
		}
	} else if strings.Contains(problemID, "binary-search") {
		testCases = []TestCase{
			{"6\n-1 0 3 5 9 12\n9", "4"},
			{"4\n1 3 5 7\n3", "1"},
			{"3\n1 2 3\n4", "-1"},
			{"1\n5\n5", "0"},
		}
	} else if strings.Contains(problemID, "string-manipulation") {
		testCases = []TestCase{
			{"abcabcbb", "3"},
			{"bbbbb", "1"},
			{"pwwkew", "3"},
			{"", "0"},
		}
	} else if strings.Contains(problemID, "two-sum") {
		testCases = []TestCase{
			{"4\n2 7 11 15\n9", "0 1"},
			{"3\n3 2 4\n6", "1 2"},
			{"2\n3 3\n6", "0 1"},
			{"3\n1 2 3\n5", "1 2"},
		}
	} else if strings.Contains(problemID, "palindrome") {
		testCases = []TestCase{
			{"racecar", "true"},
			{"hello", "false"},
			{"a", "true"},
			{"", "true"},
		}
	} else if strings.Contains(problemID, "fibonacci") {
		testCases = []TestCase{
			{"0", "0"},
			{"1", "1"},
			{"5", "5"},
			{"10", "55"},
		}
	} else if strings.Contains(problemID, "sort") {
		testCases = []TestCase{
			{"5\n64 34 25 12 22", "12 22 25 34 64"},
			{"3\n3 1 2", "1 2 3"},
			{"1\n5", "5"},
			{"4\n4 3 2 1", "1 2 3 4"},
		}
	} else if strings.Contains(problemID, "tree") {
		testCases = []TestCase{
			{"3\n1 2 3", "6"},
			{"1\n5", "5"},
			{"5\n1 2 3 4 5", "15"},
			{"0", "0"},
		}
	} else if strings.Contains(problemID, "graph") {
		testCases = []TestCase{
			{"4\n0 1\n0 2\n1 3\n2 3", "true"},
			{"3\n0 1\n1 2", "false"},
			{"2\n0 1", "true"},
			{"1", "true"},
		}
	} else if strings.Contains(problemID, "dynamic-programming") {
		testCases = []TestCase{
			{"5\n1 2 3 1 4", "8"},
			{"3\n1 2 3", "4"},
			{"1\n5", "5"},
			{"4\n2 1 4 3", "6"},
		}
	} else if strings.Contains(problemID, "linked-list") {
		testCases = []TestCase{
			{"4\n1 2 3 4", "4 3 2 1"},
			{"1\n5", "5"},
			{"3\n1 2 3", "3 2 1"},
			{"0", ""},
		}
	} else if strings.Contains(problemID, "stack") {
		testCases = []TestCase{
			{"5\npush 1\npush 2\npop\npush 3\npop", "2\n3"},
			{"3\npush 5\npush 3\npop", "3"},
			{"2\npush 1\npop", "1"},
			{"1\npush 10", ""},
		}
	} else if strings.Contains(problemID, "queue") {
		testCases = []TestCase{
			{"4\nenqueue 1\nenqueue 2\ndequeue\nenqueue 3", "1"},
			{"3\nenqueue 5\nenqueue 3\ndequeue", "5"},
			{"2\nenqueue 1\ndequeue", "1"},
			{"1\nenqueue 10", ""},
		}
	} else if strings.Contains(problemID, "hash") {
		testCases = []TestCase{
			{"6\n1 2 3 2 1 4", "2 1"},
			{"4\n1 2 3 4", "1 2 3 4"},
			{"3\n1 1 1", "1"},
			{"1\n5", "5"},
		}
	} else if strings.Contains(problemID, "matrix") {
		testCases = []TestCase{
			{"3 3\n1 2 3\n4 5 6\n7 8 9", "15"},
			{"2 2\n1 2\n3 4", "4"},
			{"1 1\n5", "5"},
			{"2 3\n1 2 3\n4 5 6", "9"},
		}
	} else if strings.Contains(problemID, "string") {
		testCases = []TestCase{
			{"hello world", "dlrow olleh"},
			{"abc", "cba"},
			{"a", "a"},
			{"", ""},
		}
	} else if strings.Contains(problemID, "number") {
		testCases = []TestCase{
			{"12345", "54321"},
			{"100", "001"},
			{"5", "5"},
			{"0", "0"},
		}
	} else if strings.Contains(problemID, "algorithm") {
		testCases = []TestCase{
			{"5\n3 1 4 1 5", "14"},
			{"3\n1 2 3", "6"},
			{"1\n5", "5"},
			{"4\n2 2 2 2", "8"},
		}
	} else if strings.Contains(problemID, "data-structure") {
		testCases = []TestCase{
			{"3\ninsert 5\ninsert 3\nfind 5", "true"},
			{"2\ninsert 1\nfind 2", "false"},
			{"1\nfind 5", "false"},
			{"2\ninsert 5\nfind 5", "true"},
		}
	} else if strings.Contains(problemID, "optimization") {
		testCases = []TestCase{
			{"4\n10 20 30 40", "100"},
			{"3\n5 10 15", "30"},
			{"1\n25", "25"},
			{"2\n50 25", "75"},
		}
	} else if strings.Contains(problemID, "search") {
		testCases = []TestCase{
			{"5\n1 3 5 7 9\n5", "2"},
			{"4\n1 2 3 4\n1", "0"},
			{"3\n1 2 3\n4", "-1"},
			{"1\n5\n5", "0"},
		}
	} else if strings.Contains(problemID, "math") {
		testCases = []TestCase{
			{"12 8", "4"},
			{"15 10", "5"},
			{"7 5", "1"},
			{"100 25", "25"},
		}
	} else if strings.Contains(problemID, "recursion") {
		testCases = []TestCase{
			{"0", "1"},
			{"1", "1"},
			{"5", "120"},
			{"3", "6"},
		}
	} else if strings.Contains(problemID, "iteration") {
		testCases = []TestCase{
			{"0", "0"},
			{"1", "1"},
			{"5", "5"},
			{"10", "55"},
		}
	} else if strings.Contains(problemID, "pattern") {
		testCases = []TestCase{
			{"3", "*\n**\n***"},
			{"1", "*"},
			{"5", "*\n**\n***\n****\n*****"},
			{"0", ""},
		}
	} else if strings.Contains(problemID, "validation") {
		testCases = []TestCase{
			{"abc123", "true"},
			{"abc", "false"},
			{"123", "false"},
			{"", "false"},
		}
	} else if strings.Contains(problemID, "conversion") {
		testCases = []TestCase{
			{"255", "FF"},
			{"16", "10"},
			{"0", "0"},
			{"15", "F"},
		}
	} else if strings.Contains(problemID, "comparison") {
		testCases = []TestCase{
			{"5\n3 1 4 1 5", "5"},
			{"3\n1 2 3", "3"},
			{"1\n5", "5"},
			{"4\n2 2 2 2", "2"},
		}
	} else if strings.Contains(problemID, "manipulation") {
		testCases = []TestCase{
			{"hello", "olleh"},
			{"abc", "cba"},
			{"a", "a"},
			{"", ""},
		}
	} else if strings.Contains(problemID, "processing") {
		testCases = []TestCase{
			{"hello world", "HELLO WORLD"},
			{"abc", "ABC"},
			{"a", "A"},
			{"", ""},
		}
	} else if strings.Contains(problemID, "analysis") {
		testCases = []TestCase{
			{"5\n1 2 3 4 5", "3"},
			{"4\n1 2 3 4", "2.5"},
			{"1\n5", "5"},
			{"3\n10 20 30", "20"},
		}
	} else if strings.Contains(problemID, "implementation") {
		testCases = []TestCase{
			{"5\n1 2 3 4 5", "15"},
			{"3\n1 2 3", "6"},
			{"1\n5", "5"},
			{"4\n2 2 2 2", "8"},
		}
	} else if strings.Contains(problemID, "frontend") {
		testCases = []TestCase{
			{"button\nclick", "Button clicked!"},
			{"input\nfocus", "Input focused"},
			{"link\nhover", "Link hovered"},
			{"form\nsubmit", "Form submitted"},
		}
	} else if strings.Contains(problemID, "backend") {
		testCases = []TestCase{
			{"GET /api/users", "200\n[{\"id\": 1, \"name\": \"John\"}]"},
			{"POST /api/users", "201\n{\"id\": 2, \"name\": \"Jane\"}"},
			{"GET /api/users/1", "200\n{\"id\": 1, \"name\": \"John\"}"},
			{"DELETE /api/users/1", "204"},
		}
	} else if strings.Contains(problemID, "database") {
		testCases = []TestCase{
			{"SELECT * FROM users WHERE age > 18", "3 rows"},
			{"INSERT INTO users (name, age) VALUES ('John', 25)", "1 row inserted"},
			{"UPDATE users SET age = 26 WHERE name = 'John'", "1 row updated"},
			{"DELETE FROM users WHERE age < 18", "0 rows deleted"},
		}
	} else if strings.Contains(problemID, "api") {
		testCases = []TestCase{
			{"POST /api/login\n{\"username\": \"test\", \"password\": \"pass\"}", "200\n{\"token\": \"abc123\"}"},
			{"GET /api/profile\nAuthorization: Bearer abc123", "200\n{\"username\": \"test\"}"},
			{"POST /api/logout", "200\n{\"message\": \"Logged out\"}"},
			{"GET /api/data", "200\n{\"data\": []}"},
		}
	} else if strings.Contains(problemID, "react") {
		testCases = []TestCase{
			{"Counter\n+1", "Count: 1"},
			{"Counter\n+3", "Count: 3"},
			{"Counter\n-1", "Count: -1"},
			{"Counter\nreset", "Count: 0"},
		}
	} else if strings.Contains(problemID, "node") {
		testCases = []TestCase{
			{"console.log('Hello')", "Hello"},
			{"console.log('World')", "World"},
			{"console.log('Test')", "Test"},
			{"console.log('Node')", "Node"},
		}
	} else if strings.Contains(problemID, "javascript") {
		testCases = []TestCase{
			{"const arr = [1,2,3]", "[1, 2, 3]"},
			{"const obj = {a: 1}", "{\"a\": 1}"},
			{"const str = 'hello'", "\"hello\""},
			{"const num = 42", "42"},
		}
	} else if strings.Contains(problemID, "python") {
		testCases = []TestCase{
			{"print('Hello')", "Hello"},
			{"print('World')", "World"},
			{"print('Python')", "Python"},
			{"print(42)", "42"},
		}
	} else if strings.Contains(problemID, "java") {
		testCases = []TestCase{
			{"System.out.println(\"Hello\")", "Hello"},
			{"System.out.println(\"World\")", "World"},
			{"System.out.println(\"Java\")", "Java"},
			{"System.out.println(42)", "42"},
		}
	} else if strings.Contains(problemID, "cpp") {
		testCases = []TestCase{
			{"cout << \"Hello\"", "Hello"},
			{"cout << \"World\"", "World"},
			{"cout << \"C++\"", "C++"},
			{"cout << 42", "42"},
		}
	} else {
		// Default test cases
		testCases = []TestCase{
			{"test input 1", "test output 1"},
			{"test input 2", "test output 2"},
			{"test input 3", "test output 3"},
		}
	}

	return testCases
}

func generateSampleTestCase(problemID string) (string, string) {
	// Generate comprehensive test cases based on problem type
	if strings.Contains(problemID, "array-rotation") {
		return "7\n1 2 3 4 5 6 7\n3", "5 6 7 1 2 3 4"
	} else if strings.Contains(problemID, "binary-search") {
		return "6\n-1 0 3 5 9 12\n9", "4"
	} else if strings.Contains(problemID, "string-manipulation") {
		return "abcabcbb", "3"
	} else if strings.Contains(problemID, "two-sum") {
		return "4\n2 7 11 15\n9", "0 1"
	} else if strings.Contains(problemID, "palindrome") {
		return "racecar", "true"
	} else if strings.Contains(problemID, "fibonacci") {
		return "10", "55"
	} else if strings.Contains(problemID, "sort") {
		return "5\n64 34 25 12 22", "12 22 25 34 64"
	} else if strings.Contains(problemID, "tree") {
		return "3\n1 2 3", "6"
	} else if strings.Contains(problemID, "graph") {
		return "4\n0 1\n0 2\n1 3\n2 3", "true"
	} else if strings.Contains(problemID, "dynamic-programming") {
		return "5\n1 2 3 1 4", "8"
	} else if strings.Contains(problemID, "linked-list") {
		return "4\n1 2 3 4", "4 3 2 1"
	} else if strings.Contains(problemID, "stack") {
		return "5\npush 1\npush 2\npop\npush 3\npop", "2\n3"
	} else if strings.Contains(problemID, "queue") {
		return "4\nenqueue 1\nenqueue 2\ndequeue\nenqueue 3", "1"
	} else if strings.Contains(problemID, "hash") {
		return "6\n1 2 3 2 1 4", "2 1"
	} else if strings.Contains(problemID, "matrix") {
		return "3 3\n1 2 3\n4 5 6\n7 8 9", "15"
	} else if strings.Contains(problemID, "string") {
		return "hello world", "dlrow olleh"
	} else if strings.Contains(problemID, "number") {
		return "12345", "54321"
	} else if strings.Contains(problemID, "algorithm") {
		return "5\n3 1 4 1 5", "14"
	} else if strings.Contains(problemID, "data-structure") {
		return "3\ninsert 5\ninsert 3\nfind 5", "true"
	} else if strings.Contains(problemID, "optimization") {
		return "4\n10 20 30 40", "100"
	} else if strings.Contains(problemID, "search") {
		return "5\n1 3 5 7 9\n5", "2"
	} else if strings.Contains(problemID, "math") {
		return "12 8", "4"
	} else if strings.Contains(problemID, "recursion") {
		return "5", "120"
	} else if strings.Contains(problemID, "iteration") {
		return "10", "55"
	} else if strings.Contains(problemID, "pattern") {
		return "5", "*\n**\n***\n****\n*****"
	} else if strings.Contains(problemID, "validation") {
		return "abc123", "true"
	} else if strings.Contains(problemID, "conversion") {
		return "255", "FF"
	} else if strings.Contains(problemID, "comparison") {
		return "5\n3 1 4 1 5", "5"
	} else if strings.Contains(problemID, "manipulation") {
		return "hello", "olleh"
	} else if strings.Contains(problemID, "processing") {
		return "hello world", "HELLO WORLD"
	} else if strings.Contains(problemID, "analysis") {
		return "5\n1 2 3 4 5", "3"
	} else if strings.Contains(problemID, "implementation") {
		return "5\n1 2 3 4 5", "15"
	} else if strings.Contains(problemID, "frontend") {
		return "button\nclick", "Button clicked!"
	} else if strings.Contains(problemID, "backend") {
		return "GET /api/users", "200\n[{\"id\": 1, \"name\": \"John\"}]"
	} else if strings.Contains(problemID, "database") {
		return "SELECT * FROM users WHERE age > 18", "3 rows"
	} else if strings.Contains(problemID, "api") {
		return "POST /api/login\n{\"username\": \"test\", \"password\": \"pass\"}", "200\n{\"token\": \"abc123\"}"
	} else if strings.Contains(problemID, "react") {
		return "Counter\n+1", "Count: 1"
	} else if strings.Contains(problemID, "node") {
		return "console.log('Hello')", "Hello"
	} else if strings.Contains(problemID, "javascript") {
		return "const arr = [1,2,3]", "[1, 2, 3]"
	} else if strings.Contains(problemID, "python") {
		return "print('Hello')", "Hello"
	} else if strings.Contains(problemID, "java") {
		return "System.out.println(\"Hello\")", "Hello"
	} else if strings.Contains(problemID, "cpp") {
		return "cout << \"Hello\"", "Hello"
	}

	// Default test case
	return "test input", "test output"
}

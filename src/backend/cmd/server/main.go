package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

type Problem struct {
	ID, Title, Statement string
	Languages            []string
	Stub                 map[string]string
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

var dataDir = "../../../data/problems"

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/problems", listProblems)
	mux.HandleFunc("/api/problem/", handleProblemRoutes)
	mux.HandleFunc("/api/submit", submit)
	mux.HandleFunc("/api/run", runCode)
	mux.HandleFunc("/api/problems/create", createProblem)
	mux.HandleFunc("/api/upload", uploadFile)
	mux.Handle("/", http.FileServer(http.Dir("../../../dist")))
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
		p := loadProblem(e.Name())
		if p.ID != "" {
			out = append(out, p)
		}
	}
	json.NewEncoder(w).Encode(out)
}
func getProblem(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/problem/")
	p := loadProblem(id)
	if p.ID == "" {
		http.Error(w, "not found", 404)
		return
	}
	json.NewEncoder(w).Encode(p)
}
func loadProblem(id string) Problem {
	b, err := os.ReadFile(filepath.Join(dataDir, id, "manifest.json"))
	if err != nil {
		log.Printf("Error loading problem %s: %v", id, err)
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
	exe := "dist/release/executor"
	if _, err := os.Stat(exe); err != nil {
		exe = "../../../src/executor/target/release/executor"
		if _, err := os.Stat(exe); err != nil {
			exe = "../../../src/executor/target/debug/executor"
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
	json.NewEncoder(w).Encode(testCases)
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

	// Always ensure we return a valid JSON array, never null
	fileList := make([]map[string]interface{}, 0)

	files, err := os.ReadDir(uploadDir)
	if err != nil {
		if os.IsNotExist(err) {
			log.Printf("Upload directory doesn't exist: %s, returning empty array", uploadDir)
		} else {
			log.Printf("Failed to read upload directory: %v, returning empty array", err)
		}
		// Always return empty array instead of error for missing directories
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(fileList)
		return
	}

	for _, file := range files {
		if !file.IsDir() {
			fileInfo, err := file.Info()
			if err != nil {
				log.Printf("Failed to get file info for %s: %v, skipping", file.Name(), err)
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
	// Ensure we always encode the array, even if empty
	if err := json.NewEncoder(w).Encode(fileList); err != nil {
		log.Printf("Failed to encode file list as JSON: %v", err)
		// Fallback to writing empty array manually
		w.Write([]byte("[]"))
	}
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

func runCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(405)
		json.NewEncoder(w).Encode(map[string]string{"error": "POST only"})
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
	for name, content := range req.Files {
		filePath := filepath.Join(sdir, filepath.Base(name))
		os.WriteFile(filePath, []byte(content), 0644)
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

	if execErr == nil {
		return outputStr, "", nil
	}

	if len(outputStr) > 0 {
		return outputStr, execErr.Error(), execErr
	}

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

	compileCmd := exec.Command("tsc", mainTs)
	compileCmd.Dir = dir
	if compileErr := compileCmd.Run(); compileErr != nil {
		return "", "", fmt.Errorf("TypeScript compilation failed: %v", compileErr)
	}

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

	compileCmd := exec.Command("javac", mainJava)
	compileCmd.Dir = dir
	if compileErr := compileCmd.Run(); compileErr != nil {
		return "", "", fmt.Errorf("Java compilation failed: %v", compileErr)
	}

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
	return "", "", fmt.Errorf("SQL execution requires database setup")
}

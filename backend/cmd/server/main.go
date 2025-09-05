
package main

import (
  "encoding/json"
  "log"
  "net/http"
  "os"
  "os/exec"
  "path/filepath"
  "strings"

  "github.com/google/uuid"
)

type Problem struct{ ID, Title, Statement string; Languages []string; Stub map[string]string }
type SubmitReq struct{ ProblemID, Language string; Files map[string]string }
type ExecJob struct{ SubmissionID, ProblemBundle, SubmissionDir, Language string }

var dataDir = "data/problems"

func main() {
  mux := http.NewServeMux()
  mux.HandleFunc("/api/problems", listProblems)
  mux.HandleFunc("/api/problem/", getProblem)
  mux.HandleFunc("/api/submit", submit)
  mux.Handle("/", http.FileServer(http.Dir("frontend/dist")))
  log.Fatal(http.ListenAndServe(":8080", mux))
}

func listProblems(w http.ResponseWriter, r *http.Request) {
  ents, _ := os.ReadDir(dataDir)
  var out []Problem
  for _, e := range ents {
    if !e.IsDir() { continue }
    p := loadProblem(e.Name()); if p.ID != "" { out = append(out, p) }
  }
  json.NewEncoder(w).Encode(out)
}
func getProblem(w http.ResponseWriter, r *http.Request) {
  id := strings.TrimPrefix(r.URL.Path, "/api/problem/")
  p := loadProblem(id); if p.ID == "" { http.Error(w,"not found",404);return }
  json.NewEncoder(w).Encode(p)
}
func loadProblem(id string) Problem {
  b, err := os.ReadFile(filepath.Join(dataDir,id,"manifest.json")); if err!=nil { return Problem{} }
  var p Problem; _ = json.Unmarshal(b, &p); return p
}
func submit(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodPost { http.Error(w,"POST only",405); return }
  var req SubmitReq; _ = json.NewDecoder(r.Body).Decode(&req)
  pdir := filepath.Join(dataDir, req.ProblemID, "v1")
  if _, err := os.Stat(pdir); err != nil { http.Error(w,"problem not found",404); return }
  subID := uuid.NewString()
  sdir := filepath.Join(os.TempDir(), "coderlab-submissions", subID); os.MkdirAll(sdir,0o755)
  for name, content := range req.Files {
    os.WriteFile(filepath.Join(sdir, filepath.Base(name)), []byte(content), 0o644)
  }
  if len(req.Files)==0 { os.WriteFile(filepath.Join(sdir,"code.txt"), []byte(""), 0o644) }
  job := ExecJob{ SubmissionID: subID, ProblemBundle: abs(pdir), SubmissionDir: abs(sdir), Language: req.Language }
  jb, _ := json.Marshal(job)
  exe := "executor-rs/target/release/executor"; if _, err := os.Stat(exe); err!=nil { exe = "executor-rs/target/debug/executor" }
  cmd := exec.Command(exe); cmd.Stdin = strings.NewReader(string(jb))
  cmd.Env = append(os.Environ(), "EXECUTOR_MODE="+getEnv("EXECUTOR_MODE","docker"))
  out, _ := cmd.CombinedOutput()
  w.Header().Set("Content-Type","application/json"); w.Write(out)
}
func abs(p string) string { a,_ := filepath.Abs(p); return a }
func getEnv(k, d string) string { v:=os.Getenv(k); if v=="" { return d }; return v }


use anyhow::*;
use serde::Deserialize;
use std::io::{Read, Write};
use std::process::Command;
use std::fs;
use std::path::Path;
use std::time::Instant;

#[derive(Deserialize)]
struct Job{ submission_id:String, problem_bundle:String, submission_dir:String, language:String }

fn main() -> Result<()> {
    let mut s=String::new(); std::io::stdin().read_to_string(&mut s)?;
    eprintln!("Executor received: {}", s);
    let job: Job = serde_json::from_str(&s)?;

    // Run the code and check against test cases
    let result = execute_submission(&job)?;
    println!("{}", serde_json::to_string(&result)?);
    Ok(())
}

#[derive(serde::Serialize)]
struct ExecutionResult {
    verdict: String,
    tests: Vec<TestResult>,
}

#[derive(serde::Serialize)]
struct TestResult {
    name: String,
    status: String,
    time_ms: u64,
    message: String,
}

fn execute_submission(job: &Job) -> Result<ExecutionResult> {
    let start_time = Instant::now();

    // For SQL and other languages that don't have traditional test cases,
    // just run the code and return the result
    if job.language.as_str() == "sql" {
        let run_result = run_sql(&job.submission_dir, "");
        let execution_time = start_time.elapsed().as_millis() as u64;

        if run_result.is_ok() {
            let output = run_result.unwrap();
            Ok(ExecutionResult {
                verdict: "Accepted".to_string(),
                tests: vec![TestResult {
                    name: "query".to_string(),
                    status: "AC".to_string(),
                    time_ms: execution_time,
                    message: format!("Query executed successfully: {}", output.chars().take(50).collect::<String>()),
                }],
            })
        } else {
            let e = run_result.unwrap_err();
            Ok(ExecutionResult {
                verdict: "Rejected".to_string(),
                tests: vec![TestResult {
                    name: "query".to_string(),
                    status: "RE".to_string(),
                    time_ms: execution_time,
                    message: format!("Runtime error: {}", e),
                }],
            })
        }
    } else {
        // For ML/Data Science problems, copy data files to submission directory
        let public_dir = Path::new(&job.problem_bundle).join("public");
        if public_dir.exists() {
            // Copy data files (CSV, JSON, etc.) to submission directory
            for entry in fs::read_dir(&public_dir)? {
                let entry = entry?;
                let path = entry.path();
                if let Some(extension) = path.extension() {
                    if extension == "csv" || extension == "json" || extension == "txt" {
                        let file_name = path.file_name().unwrap();
                        let dest_path = Path::new(&job.submission_dir).join(file_name);
                        fs::copy(&path, &dest_path)?;
                    }
                }
            }
        }

        // Copy uploaded files to submission directory from problem-specific uploads
        let problem_uploads_dir = Path::new(&job.problem_bundle).join("uploads");
        if problem_uploads_dir.exists() {
            for entry in fs::read_dir(&problem_uploads_dir)? {
                let entry = entry?;
                let path = entry.path();
                if let Some(extension) = path.extension() {
                    if extension == "csv" || extension == "json" || extension == "txt" || extension == "xlsx" || extension == "xls" || extension == "py" || extension == "js" || extension == "java" || extension == "cpp" || extension == "sql" {
                        let file_name = path.file_name().unwrap();
                        let dest_path = Path::new(&job.submission_dir).join(file_name);
                        fs::copy(&path, &dest_path)?;
                    }
                }
            }
        }

        // For other languages, try to find test cases
        if !public_dir.exists() {
            return Ok(ExecutionResult {
                verdict: "Error".to_string(),
                tests: vec![TestResult {
                    name: "error".to_string(),
                    status: "IE".to_string(),
                    time_ms: 0,
                    message: "Test cases not found".to_string(),
                }],
            });
        }

        let mut test_results = Vec::new();
        let mut overall_verdict = "Accepted".to_string();

        let test_files = fs::read_dir(&public_dir)?
            .filter_map(|entry| entry.ok())
            .filter(|entry| entry.path().extension().and_then(|s| s.to_str()) == Some("in"))
            .collect::<Vec<_>>();

        for test_entry in test_files {
            let test_name = test_entry.file_name()
                .to_str()
                .unwrap_or("unknown")
                .trim_end_matches(".in")
                .to_string();

            let input_file = test_entry.path();
            let output_file = input_file.with_extension("out");

            if !output_file.exists() {
                test_results.push(TestResult {
                    name: test_name.clone(),
                    status: "IE".to_string(),
                    time_ms: 0,
                    message: "Expected output file missing".to_string(),
                });
                overall_verdict = "Error".to_string();
                continue;
            }

            let expected_output = fs::read_to_string(&output_file)?.trim().to_string();

            // Run the submission
            let test_start_time = Instant::now();
            let run_result = run_code(&job, &input_file);

            let actual_output = if run_result.is_ok() {
                run_result.unwrap().trim().to_string()
            } else {
                let e = run_result.unwrap_err();
                test_results.push(TestResult {
                    name: test_name.clone(),
                    status: "RE".to_string(),
                    time_ms: test_start_time.elapsed().as_millis() as u64,
                    message: format!("Runtime error: {}", e),
                });
                overall_verdict = "Rejected".to_string();
                continue;
            };
            let execution_time = test_start_time.elapsed().as_millis() as u64;

            // Compare outputs
            if actual_output == expected_output {
                test_results.push(TestResult {
                    name: test_name,
                    status: "AC".to_string(),
                    time_ms: execution_time,
                    message: "Test passed successfully".to_string(),
                });
            } else {
                test_results.push(TestResult {
                    name: test_name,
                    status: "WA".to_string(),
                    time_ms: execution_time,
                    message: format!("Expected: '{}', Got: '{}'", expected_output, actual_output),
                });
                overall_verdict = "Rejected".to_string();
            }
        }

        Ok(ExecutionResult {
            verdict: overall_verdict,
            tests: test_results,
        })
    }
}

fn run_code(job: &Job, input_file: &Path) -> Result<String> {
    let input_content = fs::read_to_string(input_file)?;

    match job.language.as_str() {
        "python" => run_python(&job.submission_dir, &input_content),
        "cpp" => run_cpp(&job.submission_dir, &input_content),
        "c" => run_c(&job.submission_dir, &input_content),
        "java" => run_java(&job.submission_dir, &input_content),
        "bash" | "sh" => run_bash(&job.submission_dir, &input_content),
        "sql" => run_sql(&job.submission_dir, &input_content),
        _ => Err(anyhow!("Unsupported language: {}", job.language)),
    }
}

fn run_python(submission_dir: &str, input: &str) -> Result<String> {
    let main_py = Path::new(submission_dir).join("Main.py");
    if !main_py.exists() {
        return Err(anyhow!("Main.py not found"));
    }

    let output = Command::new("/opt/homebrew/bin/python3")
        .arg(&main_py)
        .current_dir(submission_dir)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;

    output.stdin.as_ref().unwrap().write_all(input.as_bytes())?;

    let output = output.wait_with_output()?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(anyhow!("Python execution failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

fn run_cpp(submission_dir: &str, input: &str) -> Result<String> {
    let main_cpp = Path::new(submission_dir).join("Main.cpp");
    if !main_cpp.exists() {
        return Err(anyhow!("Main.cpp not found"));
    }

    // Compile
    let exe_path = Path::new(submission_dir).join("main");
    let compile_output = Command::new("g++")
        .args(&["-o", exe_path.to_str().unwrap(), main_cpp.to_str().unwrap()])
        .output()?;

    if !compile_output.status.success() {
        return Err(anyhow!("Compilation failed: {}", String::from_utf8_lossy(&compile_output.stderr)));
    }

    // Run
    let output = Command::new(&exe_path)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;

    output.stdin.as_ref().unwrap().write_all(input.as_bytes())?;

    let output = output.wait_with_output()?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(anyhow!("C++ execution failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

fn run_c(submission_dir: &str, input: &str) -> Result<String> {
    let main_c = Path::new(submission_dir).join("Main.cpp"); // Using .cpp for C files too for simplicity
    if !main_c.exists() {
        return Err(anyhow!("Main.c not found"));
    }

    // Compile
    let exe_path = Path::new(submission_dir).join("main");
    let compile_output = Command::new("gcc")
        .args(&["-o", exe_path.to_str().unwrap(), main_c.to_str().unwrap()])
        .output()?;

    if !compile_output.status.success() {
        return Err(anyhow!("Compilation failed: {}", String::from_utf8_lossy(&compile_output.stderr)));
    }

    // Run
    let output = Command::new(&exe_path)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;

    output.stdin.as_ref().unwrap().write_all(input.as_bytes())?;

    let output = output.wait_with_output()?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(anyhow!("C execution failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

fn run_java(submission_dir: &str, input: &str) -> Result<String> {
    let main_java = Path::new(submission_dir).join("Main.java");
    if !main_java.exists() {
        return Err(anyhow!("Main.java not found"));
    }

    // Compile
    let compile_output = Command::new("javac")
        .arg(main_java.to_str().unwrap())
        .current_dir(submission_dir)
        .output()?;

    if !compile_output.status.success() {
        return Err(anyhow!("Compilation failed: {}", String::from_utf8_lossy(&compile_output.stderr)));
    }

    // Run
    let output = Command::new("java")
        .arg("Main")
        .current_dir(submission_dir)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;

    output.stdin.as_ref().unwrap().write_all(input.as_bytes())?;

    let output = output.wait_with_output()?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(anyhow!("Java execution failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

fn run_bash(submission_dir: &str, input: &str) -> Result<String> {
    let script_sh = Path::new(submission_dir).join("script.sh");
    if !script_sh.exists() {
        return Err(anyhow!("script.sh not found"));
    }

    // Make the script executable
    let chmod_output = Command::new("chmod")
        .args(&["+x", script_sh.to_str().unwrap()])
        .output()?;

    if !chmod_output.status.success() {
        return Err(anyhow!("Failed to make script executable: {}", String::from_utf8_lossy(&chmod_output.stderr)));
    }

    // Run the script
    let output = Command::new(script_sh.to_str().unwrap())
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;

    output.stdin.as_ref().unwrap().write_all(input.as_bytes())?;

    let output = output.wait_with_output()?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(anyhow!("Bash execution failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

fn run_sql(submission_dir: &str, _input: &str) -> Result<String> {
    let code_txt = Path::new(submission_dir).join("code.txt");

    let content = fs::read_to_string(&code_txt)
        .map_err(|e| anyhow!("Failed to read code.txt: {}", e))?;

    let sql_query = content.trim().to_string();

    // For demo purposes, validate basic SQL structure
    let query_upper = sql_query.to_uppercase();

    if query_upper.starts_with("SELECT") {
        Ok(sql_query)
    } else {
        Err(anyhow!("Only SELECT queries are supported in demo mode"))
    }
}

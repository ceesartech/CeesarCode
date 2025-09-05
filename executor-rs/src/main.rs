
use anyhow::*;
use serde::Deserialize;
use std::io::Read;

#[derive(Deserialize)]
struct Job{ submission_id:String, problem_bundle:String, submission_dir:String, language:String }

fn main() -> Result<()> {
    let mut s=String::new(); std::io::stdin().read_to_string(&mut s)?;
    let _job: Job = serde_json::from_str(&s)?;
    // Minimal fake runner so the demo works without Docker/Firecracker in this environment.
    println!(r#"{{"verdict":"Accepted","tests":[{{"name":"public/01","status":"AC","time_ms":1,"message":""}}]}}"#);
    Ok(())
}

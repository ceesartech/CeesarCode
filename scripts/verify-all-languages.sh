#!/bin/bash

# CeesarCode Language Verification Script
# Tests all 14 supported languages to ensure they work correctly

echo "🧪 CeesarCode Language Verification Test"
echo "========================================"
echo ""

# Start the server in the background if not running
if ! curl -s http://localhost:8080/api/problems > /dev/null 2>&1; then
    echo "🚀 Starting CeesarCode server..."
    ./bin/server &
    SERVER_PID=$!
    sleep 3
    echo "Server started with PID: $SERVER_PID"
else
    echo "✅ Server is already running"
    SERVER_PID=""
fi

echo ""
echo "🔍 Testing all 14 supported languages..."
echo "========================================"

# Test results counter
PASSED=0
FAILED=0
TOTAL=0

# Function to test a language
test_language() {
    local lang=$1
    local filename=$2
    local code=$3
    local description=$4
    
    echo -n "Testing $description ($lang)... "
    
    # Submit the code
    response=$(curl -s -X POST http://localhost:8080/api/submit \
        -H "Content-Type: application/json" \
        -d "{
            \"problemId\": \"float-mean\",
            \"language\": \"$lang\",
            \"files\": {
                \"$filename\": \"$code\"
            }
        }")
    
    # Check if the response contains "Accepted"
    if echo "$response" | grep -q '"verdict":"Accepted"'; then
        echo "✅ PASSED"
        ((PASSED++))
    else
        echo "❌ FAILED"
        echo "   Response: $response"
        ((FAILED++))
    fi
    ((TOTAL++))
}

# Test all languages
echo ""

# 1. Python
test_language "python" "Main.py" "n = int(input().strip())\\nimport sys\\nvals = list(map(float, sys.stdin.read().split()))\\nprint(sum(vals) / n)" "Python"

# 2. JavaScript
test_language "javascript" "main.js" "const readline = require(\\\"readline\\\");\\nconst rl = readline.createInterface({\\n  input: process.stdin,\\n  output: process.stdout\\n});\\nlet lines = [];\\nrl.on(\\\"line\\\", (line) => {\\n  lines.push(line);\\n});\\nrl.on(\\\"close\\\", () => {\\n  const n = parseInt(lines[0]);\\n  const values = lines[1].split(\\\" \\\").map(parseFloat);\\n  const sum = values.reduce((a, b) => a + b, 0);\\n  const mean = sum / n;\\n  console.log(mean.toFixed(1));\\n});" "JavaScript"

# 3. C++
test_language "cpp" "Main.cpp" "#include <iostream>\\n#include <vector>\\n#include <iomanip>\\nusing namespace std;\\nint main() {\\n    ios::sync_with_stdio(false);\\n    cin.tie(nullptr);\\n    int n;\\n    cin >> n;\\n    vector<double> a(n);\\n    for(int i = 0; i < n; i++) cin >> a[i];\\n    double s = 0;\\n    for(double x : a) s += x;\\n    cout << fixed << setprecision(1) << s/n;\\n    return 0;\\n}" "C++"

# 4. Java
test_language "java" "Main.java" "import java.util.Scanner;\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        int n = sc.nextInt();\\n        double sum = 0;\\n        for(int i = 0; i < n; i++) {\\n            sum += sc.nextDouble();\\n        }\\n        System.out.printf(\\\"%.1f%n\\\", sum / n);\\n    }\\n}" "Java"

# 5. Go
test_language "go" "main.go" "package main\\n\\nimport (\\n    \\\"fmt\\\"\\n    \\\"strconv\\\"\\n)\\n\\nfunc main() {\\n    var input string\\n    fmt.Scanf(\\\"%s\\\", &input)\\n    n, _ := strconv.Atoi(input)\\n    \\n    var sum float64 = 0\\n    for i := 0; i < n; i++ {\\n        var val string\\n        fmt.Scanf(\\\"%s\\\", &val)\\n        num, _ := strconv.ParseFloat(val, 64)\\n        sum += num\\n    }\\n    \\n    mean := sum / float64(n)\\n    fmt.Printf(\\\"%.1f\\\", mean)\\n}" "Go"

# 6. Rust
test_language "rust" "main.rs" "use std::io;\\n\\nfn main() {\\n    let mut input = String::new();\\n    io::stdin().read_line(&mut input).unwrap();\\n    let n: i32 = input.trim().parse().unwrap();\\n    \\n    input.clear();\\n    io::stdin().read_line(&mut input).unwrap();\\n    let sum: f64 = input.split_whitespace()\\n        .map(|s| s.parse::<f64>().unwrap())\\n        .sum();\\n    \\n    let mean = sum / n as f64;\\n    println!(\\\"{:.1}\\\", mean);\\n}" "Rust"

# 7. Ruby
test_language "ruby" "main.rb" "n = gets.to_i\\nvalues = gets.split.map(&:to_f)\\nsum = values.sum\\nmean = sum / n\\nputs \\\"%.1f\\\" % mean" "Ruby"

# 8. Swift
test_language "swift" "main.swift" "let n = Int(readLine()!)!\\nlet values = readLine()!.split(separator: \\\" \\\").map { Double(String(\$0))! }\\nlet sum = values.reduce(0, +)\\nlet mean = sum / Double(n)\\nprint(mean)" "Swift"

# 14. TypeScript
test_language "typescript" "main.ts" "process.stdin.setEncoding(\\\"utf8\\\");\\n\\nlet input: string = \\\"\\\";\\nprocess.stdin.on(\\\"data\\\", (chunk: string) => {\\n    input += chunk;\\n});\\n\\nprocess.stdin.on(\\\"end\\\", (): void => {\\n    const lines: string[] = input.trim().split(\\\"\\\\n\\\");\\n    const n: number = parseInt(lines[0]);\\n    const values: number[] = lines[1].split(\\\" \\\").map(parseFloat);\\n    const sum: number = values.reduce((a, b) => a + b, 0);\\n    const mean: number = sum / n;\\n    console.log(mean.toFixed(1));\\n});" "TypeScript"

# 9. C
test_language "c" "Main.cpp" "#include <stdio.h>\\n\\nint main() {\\n    int n;\\n    scanf(\\\"%d\\\", &n);\\n    double sum = 0.0;\\n    for(int i = 0; i < n; i++) {\\n        double val;\\n        scanf(\\\"%lf\\\", &val);\\n        sum += val;\\n    }\\n    double mean = sum / n;\\n    printf(\\\"%.1f\\\", mean);\\n    return 0;\\n}" "C"

# 10. Bash
test_language "bash" "script.sh" "#!/bin/bash\\nread n\\nread -a values\\nsum=0\\nfor val in \\\"\${values[@]}\\\"; do\\n    sum=\$(echo \\\"scale=10; \$sum + \$val\\\" | bc)\\ndone\\nmean=\$(echo \\\"scale=1; \$sum / \$n\\\" | bc)\\necho \$mean" "Bash"

# Test slower languages (these might take longer)
echo ""
echo "⏳ Testing slower compilation languages..."

# 11. Kotlin
test_language "kotlin" "Main.kt" "import java.util.Scanner\\nfun main() {\\n    val scanner = Scanner(System.\`in\`)\\n    val n = scanner.nextInt()\\n    var sum = 0.0\\n    for (i in 1..n) {\\n        sum += scanner.nextDouble()\\n    }\\n    val mean = sum / n\\n    println(String.format(\\\"%.1f\\\", mean))\\n}" "Kotlin"

# 12. Scala (very slow)
echo -n "Testing Scala (this may take 30+ seconds)... "
test_language "scala" "Main.scala" "import scala.io.Source\\nobject Main {\\n  def main(args: Array[String]): Unit = {\\n    val tokens = Source.stdin.mkString.split(\\\"\\\\\\\\s+\\\").filter(_.nonEmpty)\\n    val n = tokens.head.toInt\\n    val sum = tokens.tail.map(_.toDouble).sum\\n    val mean = sum / n.toDouble\\n    println(f\\\"\$mean%.1f\\\")\\n  }\\n}" "Scala"

# 13. SQL
test_language "sql" "code.txt" "SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY 1 ORDER BY total DESC LIMIT 3;" "SQL"

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📈 Total:  $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL LANGUAGES WORKING PERFECTLY!"
    echo "Your CeesarCode platform is production-ready with full language support!"
else
    echo "⚠️  Some languages need attention. Check the failed tests above."
fi

# Clean up - stop the server if we started it
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    echo "🛑 Stopping test server..."
    kill $SERVER_PID 2>/dev/null
fi

echo ""
echo "✨ Verification complete!"


# CeesarCode Development Scripts

This directory contains scripts to easily run CeesarCode in development mode.

## 🚀 Quick Start

### Start Development Servers
```bash
./scripts/start-dev.sh
```

This will:
- ✅ Check prerequisites (Go, Node.js)
- ✅ Kill any existing processes on ports 8080 and 5173
- ✅ Start the Go backend server on http://localhost:8080
- ✅ Start the React frontend on http://localhost:5173
- ✅ Install frontend dependencies if needed
- ✅ Show colored status messages
- ✅ Monitor processes and handle cleanup

### Stop Development Servers
```bash
./scripts/stop-dev.sh
```

This will:
- ✅ Stop backend server on port 8080
- ✅ Stop frontend server on port 5173
- ✅ Kill any related processes
- ✅ Clean up properly

## 📋 What You Get

When you run `./scripts/start-dev.sh`, you'll see:

```
================================
🚀 CeesarCode Local Development
================================
[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check passed
[INFO] Starting Go backend server...
[SUCCESS] Backend started successfully on http://localhost:8080
[INFO] Starting React frontend...
[SUCCESS] Frontend started successfully on http://localhost:5173

🎉 CeesarCode is now running!

🌐 Frontend: http://localhost:5173
🔧 Backend API: http://localhost:8080
```

## 🌐 Access the Application

1. **Open your browser** and go to: http://localhost:5173
2. **Select a problem** from the sidebar (e.g., "float-mean")
3. **Choose a language** (Python, C++, Java, etc.)
4. **Write your code** in the editor
5. **Test your code** using "Run Code" or "Submit Code"

## 📊 Logs

- **Backend logs**: `logs/backend.log`
- **Frontend logs**: `logs/frontend.log`

## 🛑 Stopping

- **Press Ctrl+C** in the terminal running the start script
- **Or run**: `./scripts/stop-dev.sh`

## 🔧 Troubleshooting

### Port Already in Use
The script automatically kills existing processes on ports 8080 and 5173.

### Missing Dependencies
The script checks for Go and Node.js and will show an error if they're missing.

### Frontend Dependencies
The script automatically runs `npm install` if `node_modules` doesn't exist.

### Backend Issues
Check `logs/backend.log` for backend errors.

### Frontend Issues
Check `logs/frontend.log` for frontend errors.

## 📁 Script Features

- **Colored output** for easy reading
- **Automatic cleanup** on exit
- **Process monitoring** to detect crashes
- **Port conflict resolution**
- **Dependency checking**
- **Log file management**
- **Signal handling** (Ctrl+C)

## 🎯 Perfect for Development

These scripts make it super easy to:
- Start coding immediately
- Test your changes
- Debug issues with proper logs
- Stop and restart quickly
- Work with a clean, organized setup

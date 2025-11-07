# 🚀 CeesarCode Complete Production Pipeline

This is the **ultimate one-command solution** for CeesarCode deployment. The `run-prod.sh` script chains all production scripts together for automated, professional deployment.

## 🎯 **Quick Start (Choose Your Mode)**

### **Option 1: Interactive Menu**
```bash
./scripts/quick-start.sh
```
This gives you a friendly menu to choose your deployment mode.

### **Option 2: Direct Commands**
```bash
# Local Development (build + test + start locally)
./scripts/run-prod.sh --local

# Production Deployment (build + test + deploy to system)
sudo ./scripts/run-prod.sh

# Docker Deployment (build + test + deploy with Docker)
sudo ./scripts/run-prod.sh --docker

# Test Only (build + test, no deployment)
./scripts/run-prod.sh --skip-deploy
```

## 🔄 **What the Complete Pipeline Does**

The `run-prod.sh` script automatically runs these steps in sequence:

### **1. Prerequisites Check**
- ✅ Verifies Go, Node.js, Rust are installed
- ✅ Checks Docker (if Docker mode)
- ✅ Validates systemd (if system deployment)

### **2. Process Cleanup**
- ✅ Kills any existing CeesarCode processes
- ✅ Frees up ports (8080, 3000, 5173)
- ✅ Cleans up PID files

### **3. Build Phase** (`build-prod.sh`)
- ✅ Builds Rust executor (release mode)
- ✅ Builds Go backend
- ✅ Builds React frontend
- ✅ Creates production directory structure
- ✅ Verifies build integrity

### **4. Test Phase** (`test-prod.sh`)
- ✅ Tests server connectivity
- ✅ Tests API endpoints
- ✅ Tests frontend assets
- ✅ Measures performance
- ✅ Verifies functionality

### **5. Deployment Phase** (`deploy-prod.sh`)
- ✅ Creates systemd service or Docker container
- ✅ Sets up user permissions
- ✅ Creates backup of existing deployment
- ✅ Deploys files to production directory
- ✅ Starts the service
- ✅ Verifies deployment

## 🎛️ **Command Line Options**

### **Basic Options**
```bash
-p, --port PORT          Port to listen on (default: 8080)
-h, --host HOST          Host to bind to (default: 0.0.0.0)
-d, --deploy-dir DIR     Deployment directory (default: /opt/ceesarcode)
-u, --user USER          User to run service as (default: ceesarcode)
-s, --service NAME       Service name (default: ceesarcode)
```

### **Mode Options**
```bash
--local                  Local development mode
--docker                 Deploy using Docker
--force                  Force operations without confirmation
```

### **Skip Options**
```bash
--skip-build             Skip building the application
--skip-test              Skip testing the application
--skip-deploy            Skip deployment (local mode only)
```

## 🌟 **Usage Examples**

### **Local Development**
```bash
# Start local development environment
./scripts/run-prod.sh --local

# This will:
# 1. Build the application
# 2. Test the build
# 3. Start backend on port 8080
# 4. Start frontend on port 5173
# 5. Show you the URLs to access
```

### **Production Deployment**
```bash
# Full production deployment
sudo ./scripts/run-prod.sh

# Custom port and directory
sudo ./scripts/run-prod.sh -p 3000 -d /var/www/ceesarcode

# Custom user and service name
sudo ./scripts/run-prod.sh -u www-data -s myapp
```

### **Docker Deployment**
```bash
# Docker deployment
sudo ./scripts/run-prod.sh --docker

# Docker with custom port
sudo ./scripts/run-prod.sh --docker -p 8080
```

### **Testing Only**
```bash
# Build and test, no deployment
./scripts/run-prod.sh --skip-deploy

# Test existing build
./scripts/run-prod.sh --skip-build --skip-deploy
```

### **Force Operations**
```bash
# Force deployment without backup
sudo ./scripts/run-prod.sh --force

# Force Docker deployment
sudo ./scripts/run-prod.sh --docker --force
```

## 🔧 **Local Development Mode**

When you use `--local`, the script:

1. **Builds** the application
2. **Tests** the build
3. **Starts** backend server (`go run main.go`)
4. **Starts** frontend server (`npm run dev`)
5. **Shows** you the access URLs
6. **Waits** for you to press Ctrl+C to stop

### **Access URLs:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api/problems

### **Management:**
- **Stop**: Press Ctrl+C or run `./scripts/stop-dev.sh`
- **Logs**: `tail -f logs/backend.log` and `tail -f logs/frontend.log`

## 🚀 **Production Deployment**

When you use the default mode, the script:

1. **Builds** the application
2. **Tests** the build
3. **Deploys** to `/opt/ceesarcode`
4. **Creates** systemd service
5. **Starts** the service
6. **Verifies** deployment

### **Access URLs:**
- **Application**: http://your-server:8080
- **API**: http://your-server:8080/api/problems

### **Management:**
- **Stop**: `sudo systemctl stop ceesarcode`
- **Start**: `sudo systemctl start ceesarcode`
- **Status**: `sudo systemctl status ceesarcode`
- **Logs**: `sudo journalctl -u ceesarcode -f`

## 🐳 **Docker Deployment**

When you use `--docker`, the script:

1. **Builds** the application
2. **Tests** the build
3. **Builds** Docker image
4. **Stops** existing container
5. **Runs** new container
6. **Verifies** deployment

### **Access URLs:**
- **Application**: http://your-server:8080
- **API**: http://your-server:8080/api/problems

### **Management:**
- **Stop**: `docker stop ceesarcode`
- **Start**: `docker start ceesarcode`
- **Logs**: `docker logs -f ceesarcode`
- **Restart**: `docker restart ceesarcode`

## 📊 **Pipeline Status**

The script provides real-time status updates:

```
🚀 CeesarCode Complete Pipeline
================================
[INFO] Checking prerequisites...
[SUCCESS] All prerequisites found
[INFO] Cleaning up previous processes...
[SUCCESS] Process cleanup complete
[INFO] Running build script...
[SUCCESS] Build completed successfully
[INFO] Running test script...
[SUCCESS] Tests completed successfully
[INFO] Running deployment script...
[SUCCESS] Deployment completed successfully

🎉 Complete pipeline finished successfully!
```

## 🛡️ **Error Handling**

The script handles errors gracefully:

- **Missing dependencies**: Shows what to install
- **Port conflicts**: Automatically kills conflicting processes
- **Build failures**: Stops pipeline and shows error
- **Test failures**: Stops pipeline and shows error
- **Deployment failures**: Stops pipeline and shows error

## 🔄 **Rollback Support**

If deployment fails, you can rollback:

```bash
# Restore from backup
sudo cp -r /opt/ceesarcode.backup.YYYYMMDD_HHMMSS /opt/ceesarcode

# Restart service
sudo systemctl restart ceesarcode
```

## 📈 **Performance**

The complete pipeline typically takes:

- **Local Development**: 2-3 minutes
- **Production Deployment**: 3-5 minutes
- **Docker Deployment**: 4-6 minutes

## 🎯 **Best Practices**

### **Before Running:**
1. ✅ Ensure all dependencies are installed
2. ✅ Check available disk space
3. ✅ Verify network connectivity
4. ✅ Review configuration options

### **After Running:**
1. ✅ Test the deployed application
2. ✅ Check service status
3. ✅ Monitor logs
4. ✅ Verify performance

## 🚨 **Troubleshooting**

### **Common Issues:**

**Permission Denied:**
```bash
# Fix script permissions
chmod +x scripts/*.sh

# Run with sudo for system deployment
sudo ./scripts/run-prod.sh
```

**Port Already in Use:**
```bash
# The script automatically handles this, but you can manually:
lsof -i :8080
sudo kill -9 <PID>
```

**Build Failures:**
```bash
# Check prerequisites
go version
node --version
cargo --version

# Clean and rebuild
rm -rf dist bin
./scripts/run-prod.sh
```

**Service Won't Start:**
```bash
# Check service status
sudo systemctl status ceesarcode

# Check logs
sudo journalctl -u ceesarcode -n 50
```

## 🎉 **Ready to Deploy!**

You now have the **ultimate deployment solution**:

- **One command** for everything
- **Multiple deployment modes**
- **Automatic error handling**
- **Professional logging**
- **Easy management**

**Start with:** `./scripts/quick-start.sh`

**Or directly:** `./scripts/run-prod.sh --local`

**Deploy to production:** `sudo ./scripts/run-prod.sh`

Your CeesarCode application is now ready for professional deployment! 🚀

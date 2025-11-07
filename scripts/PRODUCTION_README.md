# CeesarCode Production Scripts

This directory contains comprehensive scripts for building, deploying, and managing CeesarCode in production environments.

## 🚀 **Quick Start**

### **Complete Production Deployment**
```bash
# Build, test, and deploy everything
sudo ./scripts/deploy-prod.sh

# Or step by step:
./scripts/build-prod.sh      # Build production version
./scripts/test-prod.sh       # Test the build
sudo ./scripts/deploy-prod.sh # Deploy to production
```

### **Local Production Testing**
```bash
# Build and start locally
./scripts/build-prod.sh
./scripts/start-prod.sh

# Test the production build
./scripts/test-prod.sh

# Stop when done
./scripts/stop-prod.sh
```

## 📋 **Script Overview**

| Script | Purpose | Usage |
|--------|---------|-------|
| `build-prod.sh` | Build production-ready application | `./scripts/build-prod.sh` |
| `start-prod.sh` | Start production server | `./scripts/start-prod.sh [options]` |
| `stop-prod.sh` | Stop production server | `./scripts/stop-prod.sh [options]` |
| `test-prod.sh` | Test production server | `./scripts/test-prod.sh [options]` |
| `deploy-prod.sh` | Full production deployment | `sudo ./scripts/deploy-prod.sh [options]` |

## 🏗️ **Build Script (`build-prod.sh`)**

Builds the complete production-ready application.

### **Features:**
- ✅ Prerequisites checking (Go, Node.js, Rust)
- ✅ Clean previous builds
- ✅ Build Rust executor (release mode)
- ✅ Build Go backend
- ✅ Build React frontend
- ✅ Create production directory structure
- ✅ Verify build integrity
- ✅ Colored output and progress tracking

### **Usage:**
```bash
./scripts/build-prod.sh
```

### **Output:**
- `dist/server` - Go backend binary
- `dist/release/executor` - Rust executor binary
- `dist/assets/` - Frontend assets
- `dist/data/` - Problem data
- `dist/index.html` - Frontend entry point

## 🚀 **Start Script (`start-prod.sh`)**

Starts the production server with various options.

### **Features:**
- ✅ Multiple start modes (foreground/daemon)
- ✅ Configurable host and port
- ✅ Process monitoring and cleanup
- ✅ Log file management
- ✅ PID file handling
- ✅ Graceful shutdown handling

### **Usage:**
```bash
# Start in foreground (default)
./scripts/start-prod.sh

# Start as daemon
./scripts/start-prod.sh -d

# Custom port and host
./scripts/start-prod.sh -p 3000 -h 127.0.0.1

# Custom log file
./scripts/start-prod.sh -l logs/custom.log
```

### **Options:**
- `-p, --port PORT` - Port to listen on (default: 8080)
- `-h, --host HOST` - Host to bind to (default: 0.0.0.0)
- `-l, --log FILE` - Log file path (default: logs/production.log)
- `-d, --daemon` - Run as daemon in background
- `-f, --foreground` - Run in foreground (default)

## 🛑 **Stop Script (`stop-prod.sh`)**

Stops the production server gracefully.

### **Features:**
- ✅ Graceful shutdown (SIGTERM then SIGKILL)
- ✅ PID file support
- ✅ Port-based process killing
- ✅ Force kill option
- ✅ Process verification

### **Usage:**
```bash
# Stop using PID file
./scripts/stop-prod.sh

# Stop process on specific port
./scripts/stop-prod.sh --port 3000

# Force kill
./scripts/stop-prod.sh -f
```

### **Options:**
- `-p, --pid-file FILE` - PID file path (default: logs/production.pid)
- `--port PORT` - Port to check (default: 8080)
- `-f, --force` - Force kill without graceful shutdown

## 🧪 **Test Script (`test-prod.sh`)**

Comprehensive testing of the production server.

### **Features:**
- ✅ Server connectivity testing
- ✅ API endpoint testing
- ✅ Frontend asset testing
- ✅ Performance testing
- ✅ Response time measurement
- ✅ Verbose output option

### **Usage:**
```bash
# Test localhost:8080
./scripts/test-prod.sh

# Test specific host/port
./scripts/test-prod.sh -h 192.168.1.100 -p 3000

# Verbose output
./scripts/test-prod.sh -v
```

### **Options:**
- `-h, --host HOST` - Server host (default: localhost)
- `-p, --port PORT` - Server port (default: 8080)
- `-t, --timeout SEC` - Request timeout (default: 10)
- `-v, --verbose` - Verbose output

### **Tests Performed:**
1. **Connectivity** - Basic server response
2. **API Endpoints** - Problems list, specific problem, code submission
3. **Frontend Assets** - HTML content, asset loading
4. **Performance** - Response time measurement

## 🚀 **Deploy Script (`deploy-prod.sh`)**

Complete production deployment with systemd service or Docker.

### **Features:**
- ✅ Full build and test pipeline
- ✅ Systemd service creation
- ✅ Docker deployment option
- ✅ User and permission management
- ✅ Backup creation
- ✅ Service management
- ✅ Deployment verification

### **Usage:**
```bash
# Full deployment (requires sudo)
sudo ./scripts/deploy-prod.sh

# Docker deployment
sudo ./scripts/deploy-prod.sh --docker

# Custom configuration
sudo ./scripts/deploy-prod.sh -d /var/www/ceesarcode -p 3000 -u www-data
```

### **Options:**
- `-p, --port PORT` - Port to listen on (default: 8080)
- `-h, --host HOST` - Host to bind to (default: 0.0.0.0)
- `-d, --deploy-dir DIR` - Deployment directory (default: /opt/ceesarcode)
- `-u, --user USER` - User to run service as (default: ceesarcode)
- `-s, --service NAME` - Service name (default: ceesarcode)
- `--skip-build` - Skip building the application
- `--skip-test` - Skip testing the application
- `--skip-service` - Skip creating systemd service
- `--docker` - Deploy using Docker
- `--no-backup` - Skip creating backup

### **Deployment Steps:**
1. **Prerequisites Check** - Verify required tools
2. **Build Application** - Run build-prod.sh
3. **Test Application** - Run test-prod.sh
4. **Create Backup** - Backup existing deployment
5. **Deploy Files** - Copy files to deployment directory
6. **Create Service** - Systemd service or Docker container
7. **Start Service** - Start the production server
8. **Verify Deployment** - Test the deployed application

## 🔧 **Production Management**

### **Systemd Service Management:**
```bash
# Service control
sudo systemctl start ceesarcode
sudo systemctl stop ceesarcode
sudo systemctl restart ceesarcode
sudo systemctl status ceesarcode

# View logs
sudo journalctl -u ceesarcode -f
```

### **Docker Management:**
```bash
# Container control
docker start ceesarcode
docker stop ceesarcode
docker restart ceesarcode

# View logs
docker logs -f ceesarcode
```

### **Manual Management:**
```bash
# Start manually
cd dist && ./server

# Start with custom options
cd dist && ./server -port 3000 -host 127.0.0.1
```

## 📊 **Monitoring and Logs**

### **Log Files:**
- **Application Logs**: `logs/production.log`
- **System Logs**: `journalctl -u ceesarcode`
- **Docker Logs**: `docker logs ceesarcode`

### **Health Checks:**
```bash
# Check if server is running
curl http://localhost:8080/api/problems

# Check service status
systemctl status ceesarcode

# Check Docker container
docker ps | grep ceesarcode
```

## 🛡️ **Security Features**

### **Systemd Service Security:**
- ✅ NoNewPrivileges=true
- ✅ PrivateTmp=true
- ✅ ProtectSystem=strict
- ✅ ProtectHome=true
- ✅ Resource limits (NOFILE, NPROC)

### **Docker Security:**
- ✅ Non-root user in container
- ✅ Read-only filesystem where possible
- ✅ Resource limits
- ✅ Network isolation

## 🔄 **Update Process**

### **Zero-Downtime Updates:**
```bash
# 1. Build new version
./scripts/build-prod.sh

# 2. Test new version
./scripts/test-prod.sh

# 3. Deploy with backup
sudo ./scripts/deploy-prod.sh

# 4. Verify deployment
curl http://localhost:8080/api/problems
```

### **Rollback Process:**
```bash
# Restore from backup
sudo cp -r /opt/ceesarcode.backup.YYYYMMDD_HHMMSS /opt/ceesarcode

# Restart service
sudo systemctl restart ceesarcode
```

## 🎯 **Production Checklist**

### **Before Deployment:**
- ✅ All tests passing
- ✅ Production build successful
- ✅ Security configurations applied
- ✅ Backup strategy in place
- ✅ Monitoring setup

### **After Deployment:**
- ✅ Service running and healthy
- ✅ API endpoints responding
- ✅ Frontend loading correctly
- ✅ Logs being written
- ✅ Performance acceptable

## 🚨 **Troubleshooting**

### **Common Issues:**

**Port Already in Use:**
```bash
# Find process using port
lsof -i :8080

# Kill process
sudo kill -9 <PID>
```

**Permission Issues:**
```bash
# Fix ownership
sudo chown -R ceesarcode:ceesarcode /opt/ceesarcode

# Fix permissions
sudo chmod +x /opt/ceesarcode/server
```

**Service Won't Start:**
```bash
# Check service status
sudo systemctl status ceesarcode

# Check logs
sudo journalctl -u ceesarcode -n 50
```

**Docker Issues:**
```bash
# Check container logs
docker logs ceesarcode

# Restart container
docker restart ceesarcode
```

## 📈 **Performance Optimization**

### **System Tuning:**
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize kernel parameters
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
sysctl -p
```

### **Application Tuning:**
- ✅ Use production Go build flags
- ✅ Enable Rust optimizations
- ✅ Minify frontend assets
- ✅ Enable gzip compression
- ✅ Set appropriate timeouts

## 🎉 **Ready for Production!**

These scripts provide a complete, professional production deployment system for CeesarCode. They handle everything from building to monitoring, with proper security, logging, and management features.

**Start with:** `./scripts/build-prod.sh && ./scripts/test-prod.sh`

**Deploy with:** `sudo ./scripts/deploy-prod.sh`

**Manage with:** `systemctl` or `docker` commands

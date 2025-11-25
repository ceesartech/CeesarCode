# CeesarCode Gamma Environment Architecture

## Overview

The gamma environment is a **pre-production** staging environment that mirrors production configuration while running on lower-cost infrastructure. It serves as the final validation step before changes are promoted to production.

## Three-Environment Model

CeesarCode follows a 3-environment deployment model:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     DEV     │ → │    GAMMA    │ → │    PROD     │
│   (Local)   │    │ (Staging)   │    │(Production) │
└─────────────┘    └─────────────┘    └─────────────┘
     ↓                   ↓                   ↓
 Development        Validation          Live Users
 & Testing         & Integration         & Traffic
```

### Environment Characteristics

| Aspect | Dev | Gamma | Prod |
|--------|-----|-------|------|
| **Purpose** | Development | Pre-production validation | Live traffic |
| **Infrastructure** | Local | Low-cost cloud | Production cloud |
| **Data** | Sample/Mock | Production-like | Real |
| **Executor Mode** | Stub | Docker | Docker/Firecracker |
| **AI API Keys** | Optional | Separate quota | Production |
| **Monitoring** | Console logs | Basic monitoring | Full observability |

## Configuration

### Environment Variables

All environments share the same configuration structure with different values:

```bash
# config/env.dev, config/env.gamma, config/env.prod

APP_ENV=gamma                    # Environment identifier
PORT=8080                        # Server port
FRONTEND_ORIGIN=https://...      # CORS origin
EXECUTOR_MODE=docker             # stub/docker/firecracker
LOG_LEVEL=info                   # debug/info/warn/error

# AI Provider Keys
GEMINI_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Feature Flags
ENABLE_PAIR_PROGRAMMING=true
ENABLE_SYSTEM_DESIGN_AGENT=true
ENABLE_WEB_SEARCH=true

# Resource Limits (gamma has lower limits)
MAX_CONCURRENT_EXECUTIONS=5
EXECUTION_TIMEOUT_SECONDS=30
MAX_MEMORY_MB=256
```

### Scripts

| Script | Purpose |
|--------|---------|
| `./scripts/build-gamma.sh` | Build artifacts for gamma |
| `./scripts/start-gamma.sh` | Start gamma server locally |
| `./scripts/stop-gamma.sh` | Stop gamma server |

## Deployment Architecture

### Containerization

Gamma uses the same Docker images as production but with reduced resource allocation:

```dockerfile
# config/Dockerfile.gamma

# Multi-stage build for smaller image
FROM ubuntu:22.04 AS builder
# ... build steps ...

FROM ubuntu:22.04
# ... runtime with production deps ...

# Gamma-specific configuration
ENV APP_ENV=gamma
ENV EXECUTOR_MODE=docker
```

### Cloud Platform Options

Gamma is designed to run on **low-cost** or **free-tier** cloud platforms:

#### Recommended Platforms

1. **Render** (Free tier available)
   - Free tier: 750 hours/month
   - Auto-scaling
   - Easy GitHub integration

2. **Railway** (Usage-based pricing)
   - $5 credit/month
   - PostgreSQL included
   - Quick deployment

3. **Fly.io** (Generous free tier)
   - 3 shared VMs free
   - Global edge deployment
   - Built-in SSL

4. **Koyeb** (Free tier)
   - 2 nano instances free
   - Auto-deploy from Git
   - Global CDN

### Resource Allocation

```yaml
# config/docker-compose.gamma.yml

services:
  ceesarcode-gamma:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## CI/CD Pipeline

### Branch-Based Deployment

```
main branch     → Production
gamma branch    → Gamma environment
feature/*       → PR previews (optional)
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml

on:
  push:
    branches: [main, gamma]

jobs:
  deploy-gamma:
    if: github.ref == 'refs/heads/gamma'
    steps:
      - Build Docker image
      - Push to registry
      - Deploy to gamma platform
      - Run smoke tests
```

### Deployment Flow

```
1. Push to gamma branch
         ↓
2. GitHub Actions triggered
         ↓
3. Build & test
         ↓
4. Build Docker image
         ↓
5. Push to container registry
         ↓
6. Deploy to gamma platform
         ↓
7. Run smoke tests
         ↓
8. Notify team (Slack/Discord)
```

## Testing in Gamma

### Types of Tests

1. **Smoke Tests** - Basic health checks after deployment
2. **Integration Tests** - API and service integration
3. **Performance Tests** - Load and latency checks
4. **UI Smoke Tests** - Critical user flows

### Automated Verification

```bash
# Example smoke test script
GAMMA_URL="https://gamma.ceesarcode.example.com"

# Health check
curl -f "$GAMMA_URL/api/health"

# API test
curl -f "$GAMMA_URL/api/problems"

# Code execution test
curl -X POST "$GAMMA_URL/api/run" \
  -H "Content-Type: application/json" \
  -d '{"language":"python","files":{"Main.py":"print(\"Hello\")"}}'
```

## Monitoring & Observability

### Logging

- All logs written to stdout/stderr
- Platform captures and aggregates logs
- Log level configurable via `LOG_LEVEL`

### Health Checks

```bash
# Health endpoint
GET /api/health

# Response
{
  "status": "healthy",
  "environment": "gamma",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Uptime Monitoring

Consider using free uptime monitoring services:
- UptimeRobot
- Freshping
- Better Uptime (free tier)

## Best Practices

### 1. Configuration Parity

Keep gamma configuration as close to production as possible:
- Same Docker images
- Same API surface
- Same feature flags
- Only differ in scale/resources

### 2. Separate AI Quotas

Use separate AI API keys for gamma to:
- Avoid impacting production quotas
- Enable independent rate limits
- Track usage separately

### 3. Data Management

- Use production-like data schemas
- Avoid storing real user data
- Regularly refresh test data

### 4. Secret Management

- Never commit secrets
- Use platform secret management
- Rotate keys regularly

### 5. Rollback Strategy

- Keep previous versions tagged
- Test rollback procedure
- Document recovery steps

## Promotion to Production

### Checklist

- [ ] All smoke tests passing
- [ ] Integration tests passing
- [ ] Performance within acceptable limits
- [ ] No critical errors in logs
- [ ] Business stakeholder approval
- [ ] Rollback plan documented

### Promotion Process

```bash
# After gamma validation
git checkout main
git merge gamma
git push origin main

# This triggers production deployment
```

## Troubleshooting

### Common Issues

1. **Container fails to start**
   - Check resource limits
   - Verify all env vars set
   - Check platform logs

2. **AI features not working**
   - Verify API keys in secrets
   - Check rate limits
   - Review error logs

3. **Executor timeouts**
   - Increase timeout setting
   - Check resource availability
   - Review execution logs

## Cost Optimization

### Strategies

1. **Use free tiers** - Most platforms offer generous free tiers
2. **Auto-scaling** - Scale down during low usage
3. **Spot instances** - Use preemptible VMs if available
4. **Resource right-sizing** - Monitor and adjust limits

### Estimated Costs

| Platform | Estimated Monthly Cost |
|----------|----------------------|
| Render Free | $0 |
| Railway | $0-5 |
| Fly.io Free | $0 |
| Koyeb Free | $0 |

## Future Improvements

1. **Preview environments** - Per-PR deployments
2. **Canary deployments** - Gradual rollouts
3. **Feature flags** - Remote feature toggling
4. **Chaos engineering** - Resilience testing


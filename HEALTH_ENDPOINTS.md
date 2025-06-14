# Health Endpoints Documentation

This document describes the health check endpoints available across all services in the quote-copilot project.

## Overview

Health endpoints are implemented using `@nestjs/terminus` and follow standard Kubernetes health check patterns:

- **`/health`** - Comprehensive health check (all dependencies)
- **`/health/ready`** - Readiness probe (service ready to accept traffic)
- **`/health/live`** - Liveness probe (service is running)

## Services and Endpoints

### 1. Core Service
**Base URL:** `http://localhost:3000/core-service`

#### Endpoints:
- `GET /health` - Full health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

#### Dependencies Checked:
- **MongoDB** - Database connectivity
- **AI Provider** - Gemini/OpenAI service availability
- **NATS** - Message broker connectivity

#### Example Response:
```json
{
  "status": "ok",
  "info": {
    "mongodb": {
      "status": "up"
    },
    "ai-provider": {
      "status": "up",
      "provider": "gemini",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "nats": {
      "status": "up",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  },
  "error": {},
  "details": {
    "mongodb": {
      "status": "up"
    },
    "ai-provider": {
      "status": "up",
      "provider": "gemini",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "nats": {
      "status": "up",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 2. Email Workers
**Base URL:** `http://localhost:3001/email-workers`

#### Endpoints:
- `GET /health` - Full health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

#### Dependencies Checked:
- **MongoDB** - Database connectivity
- **Gmail API** - OAuth credentials and API availability
- **NATS** - Message broker connectivity

#### Example Response:
```json
{
  "status": "ok",
  "info": {
    "mongodb": {
      "status": "up"
    },
    "gmail-api": {
      "status": "up",
      "hasRefreshToken": true,
      "hasClientCredentials": true,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "nats": {
      "status": "up",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 3. Agent Orchestrator
**Base URL:** `http://localhost:3002/agent-orchestrator`

#### Endpoints:
- `GET /health` - Full health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

#### Dependencies Checked:
- **Temporal** - Workflow engine connectivity
- **NATS** - Message broker connectivity

#### Example Response:
```json
{
  "status": "ok",
  "info": {
    "temporal": {
      "status": "up",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "nats": {
      "status": "up",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 4. Telegram Workers
**Base URL:** `http://localhost:3003/telegram-workers`

#### Endpoints:
- `GET /health` - Full health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

#### Dependencies Checked:
- **Telegram Bot API** - Bot token availability
- **NATS** - Message broker connectivity

#### Example Response:
```json
{
  "status": "ok",
  "info": {
    "telegram-bot": {
      "status": "up",
      "hasBotToken": true,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "nats": {
      "status": "up",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 5. WhatsApp Workers
**Base URL:** `http://localhost:3004/whatsapp-workers`

#### Endpoints:
- `GET /health` - Full health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

#### Dependencies Checked:
- **WhatsApp API** - API key and webhook configuration
- **NATS** - Message broker connectivity

#### Example Response:
```json
{
  "status": "ok",
  "info": {
    "whatsapp-api": {
      "status": "up",
      "hasApiKey": true,
      "hasWebhookUrl": true,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "nats": {
      "status": "up",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Health Check Status Values

- **`up`** - Service/dependency is healthy and operational
- **`down`** - Service/dependency is not available or failing
- **`degraded`** - Service is partially functional (e.g., missing configuration)

## HTTP Status Codes

- **200 OK** - All health checks passed
- **503 Service Unavailable** - One or more health checks failed

## Kubernetes Integration

These endpoints are designed to work with Kubernetes health probes:

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: core-service
    image: quote-copilot/core-service
    ports:
    - containerPort: 3000
    livenessProbe:
      httpGet:
        path: /health/live
        port: 3000
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 3000
      initialDelaySeconds: 5
      periodSeconds: 5
```

## Monitoring and Alerting

Health endpoints can be monitored by:

- **Prometheus** - Scrape `/health` endpoints for metrics
- **Datadog** - HTTP check monitors
- **New Relic** - Synthetic monitoring
- **Custom scripts** - Automated health checks

## Testing

Test all health endpoints:

```bash
# Core Service
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
curl http://localhost:3000/health/live

# Email Workers
curl http://localhost:3001/health
curl http://localhost:3001/health/ready
curl http://localhost:3001/health/live

# Agent Orchestrator
curl http://localhost:3002/health
curl http://localhost:3002/health/ready
curl http://localhost:3002/health/live

# Telegram Workers
curl http://localhost:3003/health
curl http://localhost:3003/health/ready
curl http://localhost:3003/health/live

# WhatsApp Workers
curl http://localhost:3004/health
curl http://localhost:3004/health/ready
curl http://localhost:3004/health/live
```

## Environment Variables Impact

Some health checks depend on environment variables:

- **Gmail API**: `GMAIL_REFRESH_TOKEN`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- **AI Provider**: `AI_STRATEGY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`
- **Telegram**: `TELEGRAM_BOT_TOKEN`
- **WhatsApp**: `WHATSAPP_API_KEY`, `WHATSAPP_WEBHOOK_URL`
- **NATS**: `NATS_URL`
- **MongoDB**: `MONGODB_URI`
- **Temporal**: `TEMPORAL_SERVER_URL`

Missing environment variables will cause services to report `degraded` or `down` status for the corresponding dependencies. 
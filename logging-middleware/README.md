# @campus-notify/logging-middleware

> Production-grade, reusable logging middleware for the Campus Notifications Platform.  
> Works seamlessly across **backend** and **frontend** applications.

---

## 🌟 Overview

A type-safe, modular logging package that sends structured logs to a remote logging API. Built with TypeScript following SOLID principles and clean architecture patterns.

Every invocation of `Log()` makes an API call to the centralized logging server, ensuring all application events are captured and persisted remotely.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Dual-Stack Support** | Works for both backend (Node.js/Express) and frontend (React/Next.js) |
| **Type-Safe** | Full TypeScript support with strict union types |
| **Input Validation** | Validates stack, level, package, and message before sending |
| **Retry Mechanism** | Exponential backoff with jitter (500ms → 1000ms → 2000ms) |
| **Timeout Handling** | AbortController-based request timeout (default: 5000ms) |
| **Console Fallback** | Falls back to console logging when API is unreachable |
| **Log Batching** | Optional batch mode for high-throughput scenarios |
| **Configurable** | Fully configurable via `configure()` function |
| **Descriptive Errors** | Throws `LogValidationError` with field name and invalid value |
| **Zero Dependencies** | Only depends on `axios` for HTTP requests |

---

## 📁 Folder Structure

```
logging-middleware/
├── src/
│   ├── config/
│   │   └── constants.ts          # All valid values, defaults, and configuration
│   ├── types/
│   │   └── logger.types.ts       # TypeScript interfaces and types
│   ├── validators/
│   │   └── logger.validator.ts   # Input validation with descriptive errors
│   ├── services/
│   │   └── logger.service.ts     # Core logging engine with retry + timeout
│   ├── utils/
│   │   ├── retry.ts              # Exponential backoff retry mechanism
│   │   ├── timeout.ts            # AbortController timeout utilities
│   │   └── formatter.ts          # Log formatting and metadata injection
│   ├── examples/
│   │   ├── backend.example.ts    # Backend usage examples
│   │   └── frontend.example.ts   # Frontend usage examples
│   ├── __tests__/
│   │   ├── logger.validator.test.ts
│   │   ├── retry.test.ts
│   │   └── formatter.test.ts
│   └── index.ts                  # Public API entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🚀 Installation

```bash
cd logging-middleware
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
LOG_API_URL=http://4.224.186.213/evaluation-service/logs
APP_NAME=campus-notifications
NODE_ENV=development
LOG_TIMEOUT_MS=5000
LOG_MAX_RETRIES=3
LOG_CONSOLE_FALLBACK=true
```

---

## 📖 Usage

### Basic Usage

```typescript
import { Log } from "@campus-notify/logging-middleware";

// Backend log
await Log("backend", "info", "service", "Fetched 50 notifications successfully");

// Frontend log
await Log("frontend", "error", "api", "Failed to fetch notifications from backend API");
```

### Configuration

```typescript
import { Log, configure } from "@campus-notify/logging-middleware";

// Configure before first use
configure({
  appName: "my-campus-app",
  environment: "production",
  maxRetries: 5,
  timeoutMs: 3000,
  consoleFallback: true,
  enableBatching: false,
});

await Log("backend", "info", "service", "App started");
```

### Batch Mode (High Throughput)

```typescript
import { configure, Log, flush, shutdown } from "@campus-notify/logging-middleware";

configure({
  enableBatching: true,
  batchSize: 10,
  batchFlushIntervalMs: 5000,
});

// Logs are queued and sent in batches
await Log("backend", "debug", "cache", "Cache miss for key 'notifications:page:1'");

// Manually flush before shutdown
await flush();

// Graceful shutdown
await shutdown();
```

---

## 📚 API Reference

### `Log(stack, level, packageName, message)`

Sends a log entry to the remote logging API.

| Parameter | Type | Description |
|-----------|------|-------------|
| `stack` | `"backend" \| "frontend"` | Application stack |
| `level` | `"debug" \| "info" \| "warn" \| "error" \| "fatal"` | Severity level |
| `packageName` | `PackageType` | Package/module name (see valid values below) |
| `message` | `string` | Descriptive log message (1-2000 chars) |

### `configure(config)`

Updates logger configuration. Merges with existing config.

### `flush()`

Manually flushes the batch queue. Call before app shutdown.

### `shutdown()`

Gracefully shuts down the logger. Stops timers and flushes pending logs.

### `getConfig()`

Returns the current logger configuration (read-only).

---

## ✅ Validation Rules

### Stack

| Rule | Example |
|------|---------|
| Must be `"backend"` or `"frontend"` | ✅ `"backend"` / ❌ `"Backend"` |
| Must be lowercase | ❌ `"FRONTEND"` → use `"frontend"` |

### Level

| Rule | Example |
|------|---------|
| Must be one of: `debug`, `info`, `warn`, `error`, `fatal` | ✅ `"error"` |
| Must be lowercase | ❌ `"ERROR"` → use `"error"` |

### Package

**Backend Packages:** `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`

**Frontend Packages:** `api`, `component`, `hook`, `page`, `state`, `style`

**Common (Both):** `auth`, `config`, `middleware`, `utils`

> ⚠️ Using a frontend-only package with `"backend"` stack (or vice versa) will throw a validation error.

### Message

| Rule | Description |
|------|-------------|
| Required | Cannot be empty or whitespace |
| Min length | 1 character |
| Max length | 2000 characters |
| Auto-trimmed | Leading/trailing whitespace is removed |

---

## 🔄 Retry Strategy

When the logging API fails, requests are automatically retried with exponential backoff:

| Attempt | Delay | Formula |
|---------|-------|---------|
| Retry 1 | ~500ms | 500 × 2⁰ + jitter |
| Retry 2 | ~1000ms | 500 × 2¹ + jitter |
| Retry 3 | ~2000ms | 500 × 2² + jitter |

- **Maximum retries:** 3 (configurable)
- **Jitter:** 0-100ms random to prevent thundering herd
- **Max delay cap:** 5000ms

If all retries fail, the log is output to console as a fallback.

---

## ⏱️ Timeout Strategy

- **Default timeout:** 5000ms
- Uses `AbortController` for clean request cancellation
- Configurable via `configure({ timeoutMs: 3000 })`
- Throws descriptive timeout error with duration

---

## 🛡️ Error Handling

| Error Type | Description |
|------------|-------------|
| `LogValidationError` | Invalid input parameters (stack, level, package, message) |
| `LogApiError` | API communication failures with status code |
| Network Error | Handled via retry mechanism + console fallback |
| Timeout Error | Clean abort via AbortController |

All errors include:
- Field name
- Invalid value
- Descriptive message with valid alternatives

---

## 🖥️ Backend Integration

### Express Middleware

```typescript
import { Log } from "@campus-notify/logging-middleware";
import { Request, Response, NextFunction } from "express";

export const requestLogger = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    await Log(
      "backend",
      res.statusCode >= 400 ? "error" : "info",
      "middleware",
      `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
};
```

### Service Layer

```typescript
import { Log } from "@campus-notify/logging-middleware";

export async function fetchNotifications() {
  try {
    await Log("backend", "info", "service", "Starting notification fetch from external API");
    const data = await api.get("/notifications");
    await Log("backend", "info", "service", `Fetched ${data.length} notifications successfully`);
    return data;
  } catch (error) {
    await Log("backend", "error", "service", `Notification fetch failed: ${error.message}`);
    throw error;
  }
}
```

---

## 🌐 Frontend Integration

### React Component

```typescript
import { Log } from "@campus-notify/logging-middleware";
import { useEffect } from "react";

function NotificationsPage() {
  useEffect(() => {
    Log("frontend", "info", "page", "NotificationsPage mounted");
    return () => {
      Log("frontend", "debug", "page", "NotificationsPage unmounted");
    };
  }, []);

  return <div>...</div>;
}
```

### API Service

```typescript
import { Log } from "@campus-notify/logging-middleware";
import axios from "axios";

export async function getNotifications(page: number, limit: number) {
  try {
    await Log("frontend", "info", "api", `Fetching notifications: page=${page}, limit=${limit}`);
    const response = await axios.get(`/api/notifications?page=${page}&limit=${limit}`);
    await Log("frontend", "info", "api", `Received ${response.data.notifications.length} notifications`);
    return response.data;
  } catch (error) {
    await Log("frontend", "error", "api", `Failed to fetch notifications: ${error.message}`);
    throw error;
  }
}
```

---

## 📝 Example Log Messages

### ✅ Good Logs (Contextual & Actionable)

```
"Fetched 50 notifications from API in 120ms"
"Priority queue insertion failed due to invalid timestamp in notification ID abc-123"
"Cache miss for key 'notifications:page:1:limit:20' — fetching from API"
"JWT token expires in 5 minutes — triggering refresh"
"GET /api/notifications 200 45ms — returned 25 results"
```

### ❌ Bad Logs (Vague & Unhelpful)

```
"Something failed"
"Error occurred"
"Success"
"Done"
"Processing..."
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run examples
npm run example:backend
npm run example:frontend
```

---

## 🏭 Production Recommendations

1. **Set `consoleFallback: false`** in production to avoid console noise
2. **Increase `maxRetries`** for critical applications
3. **Enable batching** for high-throughput systems
4. **Use environment variables** for API URL and configuration
5. **Call `shutdown()`** on process exit to flush pending logs
6. **Monitor retry rates** — high retries indicate API issues

---

## 📈 Scalability Notes

- **Batching** reduces API calls by grouping logs (configurable batch size)
- **Retry with jitter** prevents thundering herd on API recovery
- **Timeout handling** prevents connection pool exhaustion
- **Modular architecture** allows swapping transports (file, queue, etc.)
- **Can be published to npm** for cross-project reuse

---

## 📄 License

MIT

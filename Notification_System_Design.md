# Notification System Design Document

## 1. Problem Statement

A Campus Notifications Platform sends notifications related to Placements, Results, and Events. Users receive many notifications and lose track of important ones. The system must prioritize important unread notifications and display the top N most critical ones efficiently.

## 2. Algorithm Design

### 2.1 Priority Scoring

Each notification receives a priority score based on two factors:

**Formula:** `score = (typeWeight × 1,000,000,000,000) + epochTime`

| Type | Weight | Rationale |
|------|--------|-----------|
| Placement | 3 | Highest priority — career-critical |
| Result | 2 | Medium priority — academic |
| Event | 1 | Lower priority — informational |

The multiplier (1 trillion) ensures type weight **always dominates** over recency. Within the same type, more recent notifications score higher due to the epoch timestamp component.

**Example:**
```
Placement (2026-05-08): 3 × 1T + 1778234400 = 3,001,778,234,400
Result    (2026-05-08): 2 × 1T + 1778234400 = 2,001,778,234,400
Event     (2026-05-08): 1 × 1T + 1778234400 = 1,001,778,234,400
```

### 2.2 Min-Heap for Top-N Extraction

We use a **Min-Heap** (not Max-Heap) to maintain the top N highest-priority notifications.

**Why Min-Heap?**

The key insight: we want the top N *highest* priority items, so we use a min-heap where the root is the *lowest* priority item in our collection. When a new notification arrives:

1. If heap is not full → insert normally
2. If new item's score > root's score → replace root with new item
3. If new item's score ≤ root's score → discard (it's not in top N)

This strategy ensures we always have exactly the top N items.

```
        Min-Heap (capacity = 5)
        
             [1.001T]          ← Root = lowest priority in top-N
            /        \
       [2.001T]    [2.002T]
       /      \
  [3.001T]  [3.002T]           ← Leaves = highest priority
```

### 2.3 Complexity Analysis

| Operation | Time | Space | Description |
|-----------|------|-------|-------------|
| Insert | O(log n) | O(1) | Bubble up after insert |
| Extract Min | O(log n) | O(1) | Bubble down after remove |
| Peek Min | O(1) | O(1) | Return root |
| Get Top N (sorted) | O(n log n) | O(n) | Sort heap copy |
| Contains (by ID) | O(n) | O(1) | Linear scan |
| Build heap | O(k log n) | O(n) | Insert k items |

Where n = heap capacity, k = number of incoming notifications.

### 2.4 Why Heap Over Alternatives

| Data Structure | Insert | Get Top N | Why Not? |
|---------------|--------|-----------|----------|
| **Min-Heap** ✅ | O(log n) | O(n log n) | **Best balance** |
| Sorted Array | O(n) | O(n) | Expensive insert |
| Unsorted Array | O(1) | O(n log n) | No advantage |
| BST | O(log n) | O(n) | More complex, no benefit |
| Hash Map | O(1) | O(n log n) | No ordering |

## 3. API Handling

### 3.1 External API Integration

```
GET http://4.224.186.213/evaluation-service/notifications
Query: ?limit=20&page=1&notification_type=Placement
```

**Fallback Strategy:** When the external API is unavailable (401/timeout), the system generates realistic mock notifications to ensure the platform remains functional for demonstration.

### 3.2 Internal API Endpoints

| Endpoint | Purpose | Complexity |
|----------|---------|-----------|
| `GET /api/notifications` | Paginated, filtered list | O(k log k) |
| `GET /api/notifications/priority` | Top N from heap | O(n log n) |
| `PATCH /api/notifications/:id/read` | Mark as read | O(1) |

### 3.3 Data Flow

```
External API → Fetch → Normalize → Prioritize → Insert into Heap
                                        ↓
                                 Calculate Score
                                 typeWeight × 1T + epoch
                                        ↓
                                   Min-Heap Insert
                                   O(log n)
```

## 4. Logging Strategy

### 4.1 Express Middleware Logger

Format: `[YYYY-MM-DD HH:mm:ss] METHOD /path STATUS TIMEms`

Example output:
```
[2026-05-08 10:00:01] GET /api/notifications 200 45ms
[2026-05-08 10:00:02] GET /api/notifications/priority?n=10 200 120ms
[2026-05-08 10:00:03] GET /api/invalid 404 3ms
```

### 4.2 Remote Logging API

All logs are also sent to `POST http://4.224.186.213/evaluation-service/logs` with:
- Exponential backoff retry (500ms → 1000ms → 2000ms)
- 5-second timeout with AbortController
- Console fallback on failure

### 4.3 What Gets Logged

- API request lifecycle (method, path, status, duration)
- Error details with stack traces
- Notification fetch results (count, source)
- Heap operations (insertions, evictions)
- Authentication/validation failures

## 5. Error Handling

| Error Type | Backend Response | Frontend Display |
|------------|-----------------|-----------------|
| API Timeout | 500 + error details | ErrorState + Retry button |
| Invalid Type | 400 + valid types | Snackbar alert |
| Network Failure | Fallback to mock data | Loading → Data |
| Empty Results | 200 + empty array | EmptyState component |
| Server Error | 500 + stack trace | ErrorState + Retry |

## 6. Frontend Architecture

### 6.1 Component Hierarchy

```
App
└── ThemeProvider (MUI Dark Theme)
    └── BrowserRouter
        └── MainLayout
            ├── Navbar
            └── Routes
                ├── NotificationsPage
                │   ├── FilterBar
                │   ├── SkeletonLoader (loading)
                │   ├── ErrorState (error)
                │   ├── EmptyState (empty)
                │   ├── NotificationCard[] (data)
                │   │   └── PriorityBadge
                │   └── PaginationControl
                └── PriorityInboxPage
                    ├── Stats Chips
                    ├── Priority Legend
                    └── Ranked NotificationCard[]
```

### 6.2 Performance Optimizations

| Technique | Where | Why |
|-----------|-------|-----|
| `React.memo` | NotificationCard, FilterBar, PaginationControl | Prevent unnecessary re-renders |
| `useMemo` | Sorted notifications list | Avoid re-sorting on every render |
| `useCallback` | Event handlers, markRead | Stable references for memo |
| Debounced filter | FilterBar → useDebounce | Reduce API calls during rapid clicks |
| Skeleton loaders | Loading state | Better perceived performance |

## 7. Scalability Considerations

### 7.1 Current Limitations

- In-memory heap (lost on server restart)
- Single-server architecture
- No WebSocket real-time updates

### 7.2 Production Improvements

| Improvement | Benefit |
|-------------|---------|
| Redis-backed heap | Persistent across restarts |
| WebSocket notifications | Real-time push updates |
| Database (PostgreSQL) | Durable notification storage |
| Rate limiting | API abuse prevention |
| CDN for frontend | Faster global delivery |
| Horizontal scaling | Handle more concurrent users |
| Message queue (RabbitMQ) | Decouple notification ingestion |
| Caching layer | Reduce API calls |

### 7.3 Future Enhancements

1. User authentication and personalized inboxes
2. Notification read receipts and analytics
3. Push notifications (FCM/APNs)
4. Notification grouping by category
5. Search functionality
6. Batch mark-as-read
7. Notification preferences/settings
8. Email digest notifications
9. Notification archiving
10. Admin dashboard for notification management

## 8. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Node.js + Express + TypeScript | API server |
| Frontend | React + TypeScript + Vite | SPA framework |
| Styling | Material UI v9 | Component library |
| HTTP | Axios | API calls |
| Routing | React Router v7 | Client-side routing |
| State | React Hooks (useState, useCallback, useMemo) | State management |
| Algorithm | Custom Min-Heap | Priority queue |
| Logging | Custom middleware + Remote API | Observability |
| Testing | Vitest | Unit tests |

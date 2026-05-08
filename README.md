# Campus Notifications Platform

> A production-grade full-stack Campus Notifications Platform with priority inbox powered by a custom Min-Heap algorithm.

## 🌟 Overview

This platform fetches campus notifications (Placements, Results, Events) from an external API, prioritizes them using a custom Min-Heap data structure, and displays them through a responsive React frontend with Material UI.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (React + MUI)                 │
│            http://localhost:3000                          │
│  ┌─────────────────┐  ┌──────────────────────┐          │
│  │ /notifications   │  │ /priority-inbox      │          │
│  │ Filter, Paginate │  │ Top N from Heap      │          │
│  └────────┬────────┘  └──────────┬───────────┘          │
└───────────┼──────────────────────┼───────────────────────┘
            │   Vite Proxy /api    │
┌───────────┼──────────────────────┼───────────────────────┐
│           ▼    Backend (Express + TypeScript)    ▼        │
│            http://localhost:5000                          │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ Controllers  │  │ Services │  │ Min-Heap Engine  │    │
│  │ Routes       │  │ Fetch    │  │ Priority Queue   │    │
│  │ Middleware   │  │ Normalize│  │ O(log n) insert  │    │
│  └──────────────┘  └─────┬────┘  └──────────────────┘    │
└──────────────────────────┼───────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────┐
│            External Notification API                      │
│  http://4.224.186.213/evaluation-service/notifications    │
│  (with mock data fallback when unavailable)               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              Logging Middleware Package                    │
│  POST http://4.224.186.213/evaluation-service/logs       │
│  Retry: 500ms → 1000ms → 2000ms (exponential backoff)   │
└──────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
7376232AL159/
├── logging-middleware/     # Reusable logging package
│   ├── src/
│   │   ├── config/constants.ts
│   │   ├── types/logger.types.ts
│   │   ├── validators/logger.validator.ts
│   │   ├── services/logger.service.ts
│   │   ├── utils/retry.ts, timeout.ts, formatter.ts
│   │   ├── examples/backend.example.ts, frontend.example.ts
│   │   ├── __tests__/
│   │   └── index.ts
│   └── README.md
│
├── backend/               # Express + TypeScript API
│   ├── src/
│   │   ├── config/index.ts
│   │   ├── types/notification.ts
│   │   ├── heap/MinHeap.ts
│   │   ├── middleware/logger.ts
│   │   ├── utils/priorityCalculator.ts
│   │   ├── services/notificationService.ts
│   │   ├── controllers/notificationController.ts
│   │   ├── routes/notificationRoutes.ts
│   │   └── index.ts
│   └── .env
│
├── frontend/              # React + TypeScript + MUI
│   ├── src/
│   │   ├── components/    # Navbar, NotificationCard, FilterBar, etc.
│   │   ├── pages/         # NotificationsPage, PriorityInboxPage
│   │   ├── hooks/         # useNotifications, useDebounce
│   │   ├── services/api.ts
│   │   ├── utils/formatters.ts
│   │   ├── types/notification.ts
│   │   ├── styles/theme.ts
│   │   ├── layouts/MainLayout.tsx
│   │   └── App.tsx
│   └── vite.config.ts
│
├── README.md
├── Notification_System_Design.md
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Run

```bash
# 1. Install logging middleware
cd logging-middleware && npm install

# 2. Install backend
cd ../backend && npm install

# 3. Install frontend
cd ../frontend && npm install

# 4. Start backend (port 5000)
cd ../backend && npm run dev

# 5. Start frontend (port 3000) — in a new terminal
cd ../frontend && npm run dev
```

Open **http://localhost:3000** in your browser.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/notifications?page=1&limit=20&notification_type=Placement` | Paginated notifications |
| GET | `/api/notifications/priority?n=10` | Top N priority notifications |
| GET | `/api/notifications/types` | Available types |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| GET | `/api/notifications/stats` | Heap statistics |

## ✨ Features

### Backend
- Custom Min-Heap priority queue (no external algorithm libraries)
- Priority scoring: `score = typeWeight × 1T + epochTime`
- Logging middleware with timestamp, route, status, response time
- API fallback with realistic mock data
- TypeScript strict mode

### Frontend
- **All Notifications** page with filtering and pagination
- **Priority Inbox** page with top-N ranked notifications
- Material UI dark theme with glassmorphism effects
- Skeleton loaders, error states, empty states
- Read/unread distinction with visual indicators
- Responsive design (mobile + desktop)
- `React.memo`, `useMemo`, `useCallback` optimizations
- Debounced filtering

### Logging Middleware
- Reusable across backend and frontend
- Strict TypeScript validation
- Exponential backoff retry (500ms → 1000ms → 2000ms)
- AbortController timeout (5000ms)
- Console fallback when API unavailable
- 33 unit tests passing

## 📸 Screenshot Instructions

1. **API Response**: Open Postman → GET `http://localhost:5000/api/notifications?page=1&limit=5`
2. **Terminal Output**: Capture the backend terminal showing logging middleware output
3. **All Notifications**: Screenshot `http://localhost:3000/notifications`
4. **Priority Inbox**: Screenshot `http://localhost:3000/priority-inbox`
5. **Filtering**: Click a filter chip, screenshot the filtered view
6. **Mobile View**: Open DevTools → Toggle device toolbar → Screenshot

## 🎬 Video Demo Instructions

Record a screen capture showing:
1. Start backend and frontend servers
2. Open `http://localhost:3000` — show All Notifications page
3. Click filter chips (Placement, Result, Event, All)
4. Navigate pages using pagination
5. Navigate to Priority Inbox — show ranked notifications
6. Click "Mark as read" on a notification
7. Show responsive view (resize browser / mobile DevTools)
8. Show terminal logging output
9. Show error handling (stop backend, show error state, restart, click retry)

## 🧪 Testing

```bash
# Logging middleware tests (33 tests)
cd logging-middleware && npm test

# Backend type check
cd backend && npx tsc --noEmit

# Frontend type check
cd frontend && npx tsc -b --noEmit
```

## 📝 Git Commit Strategy

1. `Initial project setup`
2. `Add logging middleware`
3. `Implement notification fetch service`
4. `Build priority heap algorithm`
5. `Add top N notification feature`
6. `Add frontend setup`
7. `Create notifications page`
8. `Add filtering and pagination`
9. `Implement priority inbox`
10. `Improve responsiveness`
11. `Add error handling`
12. `Final documentation`

## 📄 License

MIT
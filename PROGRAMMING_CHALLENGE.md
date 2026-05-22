# Industrial Data Monitoring Dashboard - Programming Challenge

**Position:** Software Engineer (Frontend Focus)  
**Challenge Type:** Production-Ready Frontend Application with Integration Focus  
**Time Allocation:** 8-10 hours (take-home)  
**Difficulty:** 3-5 years experience

---

## Challenge Overview

Build a **Production-Ready Industrial Symbol Monitoring Dashboard** that connects to a REST API to visualize and manage real-time device metrics. This challenge demonstrates your ability to architect a maintainable, scalable frontend application using modern web technologies.

**Key Focus Areas:**

1. **System Integration** - REST API authentication and data fetching (like PI integrations)
2. **Real-Time Data** - Polling and state management for live updates
3. **Production Quality** - TypeScript strict mode, testing, error handling
4. **DevOps Ready** - Docker support, environment configuration
5. **User Experience** - Accessibility, responsive design, error states

---

## What You'll Build

A single-page application with these core features:

### 1. **Secure Authentication** (30 minutes)

- Basic Auth → Bearer token flow
- Token storage and automatic header injection
- Session management and logout
- Error handling for auth failures

### 2. **Symbol Monitoring Dashboard** (2-3 hours)

- Table displaying real-time values for 50+ industrial symbols (each row shows a `SymbolValue`: name, current value, timestamp, last updated, and status)
- Real-time polling (configurable interval: 1s, 2s, 5s, or 10s)
- Search and sort functionality
- Symbol status indicators (Active/Stale/Inactive)
- CSV export capability

### 3. **Data Visualization** (1.5-2 hours)

- Detail view modal with symbol metadata

- Line chart showing historical trends (5-minute rolling window, built client-side from polled values — there is no history API)
- Quality indicators and status badges
- Timestamp and value display

### 4. **Production Features** (2-3 hours)

- Connection status monitoring (connected/disconnected indicator)
- User preferences (theme: light/dark/auto)
- LocalStorage persistence for theme and credentials
- Comprehensive error handling with user-friendly messages
- Loading states for all async operations
- Responsive design (works on screens 768px and larger)

### 5. **Testing & Documentation** (2-3 hours)

- Unit tests for services and utilities (70%+ coverage)
- Component tests for critical UI
- README with setup instructions
- Docker support (Dockerfile + docker-compose.yml)

---

## API Specification

### Base URL

```text
https://192.168.3.2/api/v1
```

### Authentication

**Endpoint:** `GET /auth/token`

**Request:**

```http
GET /api/v1/auth/token
Authorization: Basic {base64(username:password)}
```

**Success Response (200):**

```json
{
  "AccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "ExpiresIn": 3600,
  "Scope": "api",
  "TokenType": "Bearer"
}
```

**Field Notes:**

- `AccessToken`: The Bearer token to use in subsequent requests.
- `ExpiresIn`: Token lifetime in seconds (3600 = 1 hour).
- `Scope`: Informational field returned by the server. The value will always be `"api"`. Your client does **not** need to validate or use this field.
- `TokenType`: Will always be `"Bearer"`. Your client should hardcode `Bearer` in the Authorization header rather than reading this field.

**Error Response (401):**

```json
{
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid credentials"
}
```

**Implementation Notes:**

- Store token in memory (component state or app-level state)
- Store token in localStorage for persistence across page refreshes
- Automatically inject Bearer token in all authenticated requests using interceptors
- Clear token from both memory and localStorage on logout or 401 responses
- Token refresh is NOT required (tokens are valid for 1 hour)

---

### Get Symbols

**Endpoint:** `GET /logic-engine/symbols`

**Request:**

```http
GET /api/v1/logic-engine/symbols?sort=asc&limit=50
Authorization: Bearer {token}
```

**Query Parameters:**

- `sort` (optional): "asc" | "desc" - Sort by symbol name
- `limit` (optional): number - Max symbols to return (default: 50)

**Success Response (200):**

```json
[
  {
    "Name": "AnalogDeadband",
    "Type": "INS",
    "Description": "Analog input deadband threshold"
  },
  {
    "Name": "BinaryDebounce",
    "Type": "INT",
    "Description": "Binary input debounce delay"
  }
]
```

**Important — Field Casing:**

The API returns PascalCase field names (`Name`, `Type`, `Description`). Your `Symbol` interface should use camelCase (`name`, `type`, `description`). You must map the API response fields to camelCase when storing them in your application (e.g., `{ name: item.Name, type: item.Type, description: item.Description }`).

**Client-Side Filtering:**

- Filter to show only symbols where `Type === 'INS'` (Integer 16-bit) — note: filter on the **raw API field** before or during the mapping
- This simulates the type filtering you'd do with PI Historian data

---

### Get Symbol Value

**Endpoint:** `GET /logic-engine/symbols/{symbolName}`

**Request:**

```http
GET /api/v1/logic-engine/symbols/AnalogDeadband
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
  "stVal": 42,
  "q": {
    "validity": "good",
    "source": "process",
    "test": false,
    "operatorBlocked": false,
    "detailQual": {
      "overflow": false,
      "outOfRange": false,
      "badReference": false,
      "oscillatory": false,
      "failure": false,
      "oldData": false,
      "inconsistent": false,
      "inaccurate": false
    }
  },
  "t": {
    "value": "2024-12-03T14:30:00.000Z",
    "leapSecondsKnown": true,
    "clockFailure": false,
    "clockNotSynchronized": false,
    "timeAccuracy": 10,
    "source": "ntp"
  },
  "range": "normal",
  "units": "mV",
  "multiplier": 1.0,
  "d": "Analog input deadband threshold"
}
```

**Field Descriptions:**

- `stVal`: Current integer value
- `q`: Quality object — extract `q.validity` for the quality string (`"good"` | `"invalid"` | `"questionable"`). Also contains `source`, `test`, `operatorBlocked`, and `detailQual` sub-fields
- `t`: Timestamp object — extract `t.value` for the ISO 8601 timestamp string (e.g., `"2024-12-03T14:30:00.000Z"`). Also contains clock quality metadata
- `range`: "normal" | "high" | "low" | "high-high" | "low-low"
- `units`: Engineering units string
- `multiplier`: Scale factor
- `d`: Description

---

## Technical Requirements

### Technology Stack

**Required:**

- **Framework**: Modern frontend framework with TypeScript (your choice)
- **Build Tool**: Vite or equivalent
- **HTTP Client**: Axios or native Fetch API with interceptors
- **State Management**: Framework-appropriate state management solution
- **Charting**: Chart.js or equivalent charting library
- **Testing**: Vitest or Jest with appropriate testing utilities
- **Styling**: CSS framework or methodology of your choice
- **Internationalization**: Framework-appropriate i18n solution (optional)

---

### Architecture Requirements

**1. Service Layer (`src/services/apiService.ts`)**

Create a robust API service class:

```typescript
interface ApiServiceConfig {
  baseURL: string;
  timeout?: number;
}

interface AuthCredentials {
  username: string;
  password: string;
  serverUrl: string;
}

interface AuthTokenResponse {
  AccessToken: string;
  ExpiresIn: number;
  Scope: string;
  TokenType: string;
}

class SELApiService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: ApiServiceConfig);
  
  // Authentication
  authenticate(credentials: AuthCredentials): Promise<boolean>;
  setToken(token: string, expiresIn: number): void;
  clearToken(): void;
  isTokenValid(): boolean;
  
  // Symbols
  getSymbols(params?: { sort?: 'asc' | 'desc'; limit?: number }): Promise<Symbol[]>;
  getSymbolValue(symbolName: string): Promise<SymbolValue>;
  
  // Error handling
  private handleError(error: any): never;
}
```

**Requirements:**

- Implement request/response interceptors for centralized error handling
- Automatically inject Bearer token in Authorization header for all authenticated requests
- Handle 401 responses by clearing token and redirecting to login
- Convert network errors to user-friendly messages (e.g., "Network connection failed")
- Set request timeout to 10 seconds
- Retry logic for transient failures is NOT required

---

**2. State Management (`src/hooks/useSymbolPolling.ts` or `src/composables/useSymbolPolling.ts`)**

Create a reusable hook/composable for polling orchestration:

```typescript
// Framework-agnostic interface example
export function useSymbolPolling() {
  // Reactive state (use your framework's reactivity system)
  const symbols: Symbol[] = [];
  const symbolValues: Map<string, SymbolValue> = new Map();
  const symbolHistory: Map<string, SymbolHistory> = new Map();
  const connectionStatus: ConnectionStatus = { isConnected: false };
  const pollingState: PollingState = { isPolling: false, interval: 2000 };
  const loading: boolean = false;
  const error: ApiError | null = null;

  // Methods
  const authenticate = async (credentials: AuthCredentials): Promise<boolean> => { /* ... */ };
  const loadSymbols = async (): Promise<void> => { /* ... */ };
  const startPolling = (): void => { /* ... */ };
  const stopPolling = (): void => { /* ... */ };
  const setPollingInterval = (ms: number): void => { /* ... */ };
  const disconnect = (): void => { /* ... */ };

  // Cleanup logic (framework-specific)
  // Add cleanup for intervals/timers when component unmounts

  return {
    // State
    symbols,
    symbolValues,
    symbolHistory,
    connectionStatus,
    pollingState,
    loading,
    error,
    // Methods
    authenticate,
    loadSymbols,
    startPolling,
    stopPolling,
    setPollingInterval,
    disconnect
  };
}
```

**Implementation Requirements:**

- Fetch all symbols on initial load
- Poll individual symbol values at configured interval
- Use `Promise.all()` for parallel fetching
- Handle individual symbol failures gracefully (don't stop polling)
- **Build history client-side:** There is no history API endpoint. Accumulate polled values into `SymbolHistoryPoint` objects (rolling 5-minute window, max 50 points per symbol)
- Cleanup intervals on unmount
- Detect stale data (not updated in 30+ seconds)

**Client-Side History Implementation:**

```typescript
// On each successful poll for a symbol:
const newPoint: SymbolHistoryPoint = {
  value: symbolValue.stVal,
  timestamp: new Date(),
  formattedTime: new Date().toLocaleTimeString()
};

// Append to history and trim to max points
history.dataPoints.push(newPoint);
if (history.dataPoints.length > MAX_POINTS) {
  history.dataPoints = history.dataPoints.slice(-MAX_POINTS);
}
```

---

#### 3. Component Structure

**Required Components:**

```text
src/
├── components/
│   ├── AuthenticationForm.*         # Login form (Basic Auth)
│   ├── ConnectionStatus.*           # Status bar with user/server info
│   ├── ErrorDisplay.*               # Modal for error messages
│   ├── SymbolsDashboard.*           # Main table with search/sort
│   ├── SymbolDetailView.*           # Modal with chart and metadata
│   ├── UserMenu.*                   # Theme switcher, preferences
│   ├── ConfirmDialog.*              # Reusable confirmation dialog
│   └── ToastNotification.*          # Toast notifications
├── services/
│   ├── apiService.ts                # API client
│   └── storageService.ts            # localStorage wrapper
├── hooks/ (or composables/)         # Business logic hooks/composables
│   └── useSymbolPolling.ts          # Polling logic
├── types/
│   └── api.ts                       # TypeScript interfaces
├── i18n/ (optional)                 # Internationalization
│   ├── index.ts                     # i18n configuration
│   └── locales/                     # Translation files
└── tests/
    ├── apiService.test.ts
    ├── useSymbolPolling.test.ts
    └── *.test.ts                    # Component tests
```

---

### TypeScript Type Definitions

**Required Interfaces (`src/types/api.ts`):**

```typescript
// Authentication
export interface AuthCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  AccessToken: string;
  ExpiresIn: number;
  Scope: string;
  TokenType: string;
}

export interface AuthErrorResponse {
  title: string;
  status: number;
  detail: string;
}

// Symbols
export interface Symbol {
  name: string;  // Mapped from API's PascalCase "Name" field
  type: string;  // Mapped from API's PascalCase "Type" field
  description?: string;  // Mapped from API's PascalCase "Description" field
}

export interface SymbolValue {
  symbolName: string;
  stVal: number;
  t: string; // Parsed timestamp string (from API's nested `t.value` field, formatted for display)
  lastUpdated: Date;
  rawData?: Record<string, unknown>; // Full API response — use this to access additional fields like `range`, `units`, `multiplier`, `d`, and the quality object `q`
}

// Historical data
export interface SymbolHistoryPoint {
  value: number;
  timestamp: Date;
  formattedTime: string;
}

export interface SymbolHistory {
  symbolName: string;
  dataPoints: SymbolHistoryPoint[];
  maxPoints: number;
}

// Connection and Polling State
export interface ConnectionStatus {
  isConnected: boolean;
  lastConnection?: Date;
  error?: string;
}

export interface PollingState {
  isPolling: boolean;
  interval: number;
  lastPoll?: Date;
}

export interface ApiError {
  message: string;
  status?: number;
  timestamp: Date;
  cancelled?: boolean;
}
```

---

### Understanding Symbol vs SymbolValue (Important Clarification)

There are two distinct data types that work together:

| Type          | API Source                         | Purpose       | Contents                                              |
|---------------|------------------------------------|---------------|-------------------------------------------------------|
| `Symbol`      | `GET /logic-engine/symbols`        | Metadata list | `name`, `type`, `description`                         |
| `SymbolValue` | `GET /logic-engine/symbols/{name}` | Runtime data  | `symbolName`, `stVal`, `t`, `lastUpdated`, `rawData`  |

**Data Flow:**

1. After authentication, call `getAllSymbols()` → returns array of `Symbol` objects (filter to `Type === 'INS'`)
2. Initialize an empty `SymbolValue` entry for each symbol in a Map
3. When polling runs, call each symbol's individual endpoint to get `stVal` and `t` values
4. Store the response in the `SymbolValue` map and update the dashboard table

**Dashboard Table displays `SymbolValue` objects:**

| Column       | Source Field                                                              |
|--------------|---------------------------------------------------------------------------|
| Symbol Name  | `symbolValue.symbolName`                                                  |
| Value        | `symbolValue.stVal` (the integer value from API)                          |
| Timestamp    | `symbolValue.t` (device timestamp from `t.value` in response)             |
| Last Updated | `symbolValue.lastUpdated` (client-side Date when data was received)       |
| Status       | Derived: Active (<30s), Stale (30-60s), Inactive (>60s since lastUpdated) |

---

### Client-Side History Building (No History API)

**Important:** There is NO API endpoint for retrieving historical data. History is built entirely client-side by accumulating polled values over time.

**How it works:**

1. Each time `fetchSymbolValues()` runs successfully, for every `SymbolValue` received:
   - Create a new `SymbolHistoryPoint`: `{ value: stVal, timestamp: new Date(), formattedTime: "HH:MM:SS" }`
   - Push it to that symbol's history array in the `symbolHistory` Map
   - Trim array to max points (50 points = ~5 minutes at 2s polling)
2. The `SymbolDetailView` chart reads from `symbolHistory.get(symbolName).dataPoints`
3. Chart will be empty initially and populate as polling continues

**Polling → History Flow:**

```text
Poll interval fires → GET /symbols/{name} for each symbol →
Extract stVal → Create SymbolHistoryPoint → Append to history array →
Chart renders dataPoints array
```

---

## User Interface Requirements

### 1. Authentication Form

**Layout:**

```text
┌─────────────────────────────────────────┐
│     Industrial Data Monitor             │
│                                         │
│  Server URL                             │
│  [https://192.168.3.2              ]    │
│                                         │
│  Username                               │
│  [testuser                         ]    │
│                                         │
│  Password                               │
│  [••••••••                         ]    │
│                                         │
│         [  Connect to Server  ]         │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**

- Form validation (URL format, required fields)
- Loading state during authentication
- Error display below form
- Remember credentials option (localStorage)
- Enter key submits form
- Auto-focus on first field

---

### 2. Symbols Dashboard

**Layout:**

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ Industrial Data Monitor                                        [Settings] │
├───────────────────────────────────────────────────────────────────────────┤
│ Connected | User: testuser | Server: 192.168.3.2                          │
│ Last updated: 2 seconds ago                        [Refresh] [Logout]     │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ [Search symbols...]                                  [Start Polling] [2s] │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ Symbol Name ↕  │ Value ↕ │ Timestamp        │ Last Updated │ Status   │ │
│ ├───────────────────────────────────────────────────────────────────────┤ │
│ │ AnalogDeadband │ 42      │ 14:30:00         │ 1s ago       │ Active   │ │
│ │ BinaryDebounce │ 150     │ 14:29:58         │ 1s ago       │ Active   │ │
│ │ CommTimeout    │ 5000    │ 14:29:25         │ 35s ago      │ Stale    │ │
│ │ SystemTimer    │ 12458   │ 14:30:00         │ 1s ago       │ Active   │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ Showing 4 of 50 symbols                     [← 1 2 3 4 5 →]  [Export CSV] │
└───────────────────────────────────────────────────────────────────────────┘
```

**Features:**

- **Search**: Real-time filter by symbol name
- **Sort**: Click column headers to sort (Symbol Name or Value)
- **Status Indicators**:
  - Active: Updated within last 30 seconds
  - Stale: 30-60 seconds since update
  - Inactive: 60+ seconds since update
- **Polling Controls**: Start/stop, interval selector (1s, 2s, 5s, 10s)
- **Pagination**: 10/25/50 per page
- **Row Click**: Opens detail modal
- **CSV Export**: Download button that generates a CSV file with the same columns as the table: Symbol Name, Value, Timestamp, Last Updated, Status

---

### 3. Symbol Detail View (Modal)

**Layout:**

```text
┌─────────────────────────────────────────────────┐
│ AnalogDeadband                         [Close X]│
├─────────────────────────────────────────────────┤
│                                                 │
│  Current Value: 42 mV                           │
│  Status: Normal Range                           │
│  Quality: Good                                  │
│  Last Updated: 2024-12-03 14:30:00 (2s ago)     │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │           Value History (5 min)           │  │
│  │                                           │  │
│  │   45│          ╭─────╮                    │  │
│  │     │        ╭─╯     ╰─╮                  │  │
│  │   40│     ╭──╯          ╰───╮             │  │
│  │     │  ╭──╯                 ╰──╮          │  │
│  │   35│──╯                       ╰────      │  │
│  │     └────────────────────────────────     │  │
│  │      14:25   14:27   14:29   14:30        │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Description: Analog input deadband threshold   │
│  Type: INS (16-bit Integer)                     │
│  Units: mV                                      │
│  Multiplier: 1.0                                │
│                                                 │
│  Quality Details:                               │
│  Valid data      Process source                 │
│  Not blocked     Clock synchronized             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Features:**

- Live updating while modal is open
- Historical chart (last 5 minutes, max 50 points)
- Quality indicators with icons (extract quality from `rawData.q.validity`)
- Formatted timestamp (relative + absolute)
- Detailed quality breakdown (from `rawData.q.detailQual`)
- Additional metadata from `rawData`: `range`, `units`, `multiplier`, `d`
- Close on ESC key or backdrop click

---

### 4. Settings Menu (User Preferences)

**Features:**

- Theme selector: Auto / Light / Dark
- Polling interval: 1s / 2s / 5s / 10s
- Auto-start polling: On / Off
- Persist to localStorage

---

## Testing Requirements

### Unit Tests (70%+ coverage required)

**Services:**

```typescript
// apiService.test.ts
describe('SELApiService', () => {
  it('should authenticate with valid credentials');
  it('should store token after successful auth');
  it('should inject Bearer token in requests');
  it('should handle 401 and clear token');
  it('should fetch symbols with query params');
  it('should fetch individual symbol values');
  it('should handle network errors gracefully');
});
```

**Hooks:**

```typescript
// useSymbolPolling.test.ts
describe('useSymbolPolling', () => {
  it('should load symbols on mount');
  it('should start polling when startPolling called');
  it('should stop polling when stopPolling called');
  it('should update values at configured interval');
  it('should handle individual symbol fetch failures');
  it('should maintain 5-minute rolling window');
  it('should detect stale data after 30 seconds');
});
```

**Components:**

```typescript
// AuthenticationForm.test.ts
import { /* your test utilities */ } from '@testing-library/[framework]';
import AuthenticationForm from '@/components/AuthenticationForm';

describe('AuthenticationForm', () => {
  it('should render form fields', () => {
    // Test that URL, username, and password fields are present
  });
  
  it('should validate URL format');
  it('should submit on Enter key');
  it('should display error message on auth failure');
  it('should disable button during loading');
});

// SymbolsDashboard.test.ts
import { /* your test utilities */ } from '@testing-library/[framework]';
import SymbolsDashboard from '@/components/SymbolsDashboard';

describe('SymbolsDashboard', () => {
  it('should render symbols table');
  it('should filter symbols by search term');
  it('should sort by column click');
  it('should paginate results');
  it('should open detail modal on row click');
  it('should export CSV with current data');
});
```

---

## Docker Support

**Dockerfile (Multi-stage build):**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5173:80"
    environment:
      - NODE_ENV=production
```

**nginx.conf (with API proxy):**

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass https://192.168.3.2;
    proxy_ssl_verify off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## Development Setup

### CORS Proxy Configuration (Vite)

**vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://192.168.3.2',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
      },
    },
  },
});
```

---

## Evaluation Criteria

### Total: 100 points

### 1. Code Quality & Architecture (30 points)

- **TypeScript Usage** (10 pts)
  - Strict mode enabled
  - Proper interfaces for all data structures
  - No `any` types (or justified with comments)
  - Generic types where appropriate
  
- **Service Layer** (10 pts)
  - Clean API service with error handling
  - Request/response interceptors
  - Token management
  - Request timeout (10 seconds)

- **Component Architecture** (10 pts)
  - Separation of concerns (UI vs logic)
  - Reusable components
  - Custom hooks for business logic
  - Clean file structure

---

### 2. Functionality (35 points)

- **Authentication** (8 pts)
  - Basic Auth → Bearer token flow
  - Token storage and injection
  - Logout functionality
  - Error handling

- **Symbols Dashboard** (12 pts)
  - Fetch and display symbols
  - Search and sort
  - Pagination
  - CSV export

- **Real-Time Polling** (10 pts)
  - Configurable interval polling
  - Start/stop controls
  - Status indicators (active/stale/inactive)
  - Historical data tracking (5-min window)

- **Detail View** (5 pts)
  - Modal with symbol metadata
  - Historical chart
  - Quality indicators

---

### 3. Testing (20 points)

- **Unit Tests** (10 pts)
  - API service tests
  - Polling hook tests
  - 70%+ coverage

- **Component Tests** (10 pts)
  - Form validation
  - User interactions
  - Loading/error states

---

### 4. User Experience (10 points)

- **UI/UX** (5 pts)
  - Responsive design
  - Loading states
  - Error messages
  - Accessible (ARIA labels, keyboard nav)

- **Polish** (5 pts)
  - Clean styling
  - Consistent design
  - Smooth transitions
  - Professional appearance

---

### 5. Documentation & DevOps (5 points)

- **README** (3 pts)
  - Setup instructions
  - Environment variables
  - Available scripts
  - Architecture overview

- **Docker** (2 pts)
  - Working Dockerfile
  - docker-compose.yml
  - Production-ready configuration

---

## Submission Requirements

### Required Files

```text
submission.zip
├── src/                      # All source code
├── public/                   # Static assets
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Build tool config
├── README.md                 # Documentation
└── coverage/                 # Test coverage report
```

### README.md Template

> Copy the template below into your `README.md` and fill in the bracketed sections.

---

#### Industrial Data Monitoring Dashboard

##### Overview

[Brief description of your implementation]

##### Tech Stack

- Framework: [Your chosen framework] with TypeScript
- Build Tool: Vite (or equivalent)
- State Management: [Your approach]
- Testing: Vitest (or Jest) with testing utilities
- Charts: Chart.js (or equivalent)
- Styling: [Your choice]
- Internationalization: [If implemented]

##### Setup Instructions

**Prerequisites:**

- Node.js 18+
- npm or yarn

**Installation:**

```bash
npm install
```

**Development:**

```bash
npm run dev
```

**Testing:**

```bash
npm run test
npm run test:coverage
```

**Production Build:**

```bash
npm run build
npm run preview
```

**Docker:**

```bash
docker-compose up --build
```

##### Architecture

**Project Structure:**
[Explain your folder organization]

**Key Design Decisions:**
[Explain major architectural choices]

##### Features Implemented

- [ ] Authentication with token management
- [ ] Symbol dashboard with search/sort/pagination
- [ ] Real-time polling with configurable intervals
- [ ] Historical data visualization
- [ ] CSV export
- [ ] Theme support (light/dark)
- [ ] Responsive design
- [ ] Unit and component tests (70%+ coverage)

##### Known Issues / Future Improvements

[List any limitations or planned enhancements]

##### Time Spent

Approximately [ ] hours

##### Questions or Notes

[Any clarifications or assumptions you made]

---

## Tips for Success

### Production Mindset

1. **Reliability**: Handle errors gracefully without crashing the application
2. **Error Handling**: Display user-friendly messages for all error scenarios
3. **Monitoring**: Show clear connection status and last update time
4. **Security**: Never expose tokens in console logs or error messages

### Best Practices

1. **Start with types** - Define all interfaces in `src/types/api.ts` first
2. **Build the service layer** - Implement and test `apiService.ts` before building UI components
3. **Incremental development** - Build and test one component at a time
4. **Test as you go** - Write tests alongside implementation, not at the end

### Time Management

- **Hour 1-2**: Setup, API service, authentication
- **Hour 3-4**: Dashboard component, basic table
- **Hour 5-6**: Polling logic, real-time updates
- **Hour 7-8**: Detail view, charts, polish
- **Hour 9-10**: Testing, Docker, documentation

---

## Optional Enhancements

These are **not required** and will not affect your evaluation score. However, they demonstrate advanced thinking:

### Advanced Features

- WebSocket support for real-time push instead of polling
- IndexedDB for offline symbol caching
- Internationalization (i18n) with multiple language support
- Advanced filtering by type, range, or quality
- Keyboard shortcuts for common actions
- E2E tests with Playwright or Cypress

Implementing these features will not increase your score but may provide discussion points during the technical interview.

---

## Questions?

**Default Credentials:**

- Server: `https://192.168.3.2`
- Username: `testuser`
- Password: `testpass`

**API Notes:**

- The API uses self-signed SSL certificates (hence `secure: false` in proxy)
- Token expires after 3600 seconds (1 hour)
- Symbol polling should handle individual failures gracefully
- Quality values follow IEC 61850 standard

**Allowed Resources:**

- Official documentation (React, TypeScript, Vite, etc.)
- Stack Overflow, MDN, GitHub public repositories
- AI coding assistants (ChatGPT, GitHub Copilot, etc.)
- npm packages from npm registry (must be actively maintained)

**Not Allowed:**

- Copying complete projects or pre-built templates
- Using paid code solutions or outsourcing services
- Collaboration with other developers

---

## Submission

**Format:** ZIP file named `FirstNameLastName_IndustrialDashboard.zip`

**Required Contents:**

1. Complete source code (all files in project structure)
2. README.md with setup instructions
3. Test coverage report (HTML report from `npm run test:coverage` in `/coverage` folder)
4. package.json and package-lock.json (or yarn.lock)
5. All configuration files (tsconfig.json, vite.config.ts, etc.)

**Submission Instructions:** Will be provided via email.

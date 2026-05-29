#### Industrial Data Monitoring Dashboard

##### Overview

This is a single page application built with React and Typescript. Its authenticates with Basic Auth and Bearer Token, fetches symbols and filters them, fetches each symbols value, and creates a 5 minute rolling history chart. The main dashboard lets the user filter, sort, paginate and also export the data as a CSV. LocalStorage presists authTokens, credentials and user preferences.

##### Tech Stack

- Framework: React with TypeScript
- Build Tool: Vite
- HTTP Client: Axios
- State Management: React Hooks
- Testing: Vitest & React Testing Library
- Charts: shadcn/ui Chart
- Styling: shadcn/ui & Tailwind CSS
- Internationalization: Not Implemented

##### Setup Instructions

**Prerequisites:**

- Node.js 18+
- yarn

**Installation:**

```bash
yarn install
```

**Development:**

The dev env needs a `.env.development` with the values. This enables MSW

```bash
VITE_USE_MOCKS=true
VITE_BASE_URL=https://192.168.3.2/api/v1
```
`VITE_USE_MOCKS=true` lets MSW intercept requests so the build works without a live server

```bash
yarn dev
```

**Testing:**

```bash
yarn test
yarn test:coverage
```

**Production Build:**

The build embeds environment variables at build time and runs in `production` mode, which does not read `.env.development`. To preview a build with the MSW mock enabled, create a `.env.production` file first:
```bash
VITE_USE_MOCKS=true
VITE_BASE_URL=https://192.168.3.2/api/v1
```


Then:

```bash
yarn build
yarn preview
```

To build against a real backend instead, set `VITE_USE_MOCKS=false` and point `VITE_BASE_URL` at a reachable server before building.

**Docker:**

The dockerfile is baked with `VITE_USE_MOCKS=true` and `VITE_BASE_URL=https://192.168.3.2/api/v1`, so the container runs against the MSW mock and works without a live server.

If you want to run the docker setup against a real backend instead, set `VITE_USE_MOCKS` to false and point `VITE_BASE_URL` at your server's base URL.

Then:

```bash
docker-compose up --build
```

##### Architecture

**Project Structure:**

```text
src/
├── components/      UI components 
│   ├── ui/          shadcn/ui primitives 
│   └── skeletons/   Loading-state skeletons
├── context/         SymbolPollingContext — shares one polling/state instance
│                    across the dashboard
├── hooks/           useSymbolPolling (polling orchestration) and useTheme
├── lib/             Shared helpers 
├── mocks/           MSW setup: browser worker, request handlers, and seed data
├── services/        httpClient (Axios instance), apiService (SELApiService),
│                    storageService (localStorage wrapper)
├── tests/           Vitest unit and component tests
└── types/           Shared TypeScript interfaces (api.ts)
```

**Key Design Decisions:**

- **Single polling source via Context.** `useSymbolPolling` owns all live state. It is instantiated once in `SymbolPollingContext` and then used through `useSymbolPollingContext()`. This makes it so that every component reads the same data without excessive prop-drilling or duplicate intervals.
- **MSW for the API.** The app ships with Mock Service Worker handlers (toggled by `VITE_USE_MOCKS`) to run end-to-end. The env files toggle the service worker to true while dockerfile is baked to toggle the service worker to false
- **shadcn/ui & Tailwind.** Using shadcn/ui enabled accessiblility, consistent UI, themes, and additional functionality with tables, graphs and fields components. Their library is different from MUI where with shadcn you get to download and modify the actual code for the components being used.
- **Using One Source of Truth.** Using `useSymbolPolling` and `SELApiService` as a single source of truth made data inconsistencies across components non-existent during development. 
- **Easy Access for User.** Earlier iteration for the dashboard had a navbar which had the settings and connection status interactions as clickable interactions and in a dropdown. However, this increased the number of clicks it would take to change something simple like the theme. It also would make it harder to navigate for users unfamiliar with the system. Now the components have been moved to the main page which makes it easier to understand what's going on at a glance.

##### Features Implemented

- [x] Authentication with token management
- [x] Symbol dashboard with search/sort/pagination
- [x] Real-time polling with configurable intervals
- [x] Historical data visualization
- [x] CSV export
- [x] Theme support (light/dark/auto)
- [x] Responsive design
- [x] Unit and component tests (70%+ coverage)

##### Known Issues / Future Improvements
I could greatly improve the filtering system for future imporovements. I could add a filter to only display symbols that have a specific status. I could also add ranges filters for the timestamp and lastUpdated fields

##### Time Spent

Approximately 20 hours

##### Questions or Notes
- The AuthenticationForm doesn't sanitize the server url. The MSW takes in any base url and appends the path to it. The dashboard however defaults to https://192.168.3.2. This makes it so that when the server needs to be changed, the backend can handle the validation for the url. The username and password however are authenticated since I'm using Basic Auth.
- Ran into an issue trying to figure out what the purpose of the refresh button was on the ConnectionStatus Bar/Box. I believe I now understand how its meant to be used. I have connected the refresh button to the loadSymbols method in useSymbolPolling. This makes it possible for additional symbols to be added to the polling cycle without restarting the system and loosing polling data for older symbols.
- The challenge doc asks me to use Promise.all to fetch Symbol Values. However, Promise.all can abort and stop polling if a single fetch is resolved to a failure. The challenge doc specifically asks me to continue fetching even if there has been a failure in fetching a SymbolValue. This is why i used Promise.allSettled. It fetches in parallel and fails gracefully without stopping the polling.
# Project Repository

## Overview
This repository contains a React-based dashboard frontend that connects to an existing Supabase-managed PostgreSQL database. The dashboard operates in a read-only mode and updates its UI in real time using Supabase Realtime subscriptions. No database mutations are performed by the frontend.

## Architecture

### Read-only data model and flow
The dashboard fetches data using read-only SELECT queries and maintains local component state. Initial data is loaded on mount and subsequent updates are pushed via Realtime channels:

- Initial fetches:
  - KPI tiles (counts): sales, customers, projects in progress, applications
  - Visitor statistics (past 12 months, aggregated on client)
  - Tasks distribution (status counts)
  - Recent activities feed (optionally joined to users)
  - Active campaign
- Realtime subscriptions:
  - INSERT on sales, customers, applications, visits, activities
  - UPDATE on projects (to refresh “Projects In Progress” KPI)
  - All events (*) on tasks (to recompute status distribution)

On each matching event the dashboard re-runs the corresponding read-only selector and updates the local state. There are no INSERT/UPDATE/DELETE operations issued by the UI for this implementation.

Relevant code:
- supabase client and channel utility: dashboard_frontend/src/lib/supabaseClient.js
- read-only query hooks: dashboard_frontend/src/hooks/useQueries.js
- realtime subscription hook: dashboard_frontend/src/hooks/useRealtimeDashboard.js
- app integration: dashboard_frontend/src/App.js

### Realtime channel structure
The application creates a single channel (default name “dashboard-realtime”) and attaches multiple postgres_changes listeners:
- sales: INSERT → refresh KPIs
- customers: INSERT → refresh KPIs
- applications: INSERT → refresh KPIs
- projects: UPDATE → refresh KPIs (Projects In Progress)
- visits: INSERT → refresh Visitor Statistics
- tasks: * (INSERT/UPDATE/DELETE) → refresh Tasks distribution
- activities: INSERT → refresh Activity feed

Handlers are debounced to avoid excessive re-renders during bursts of events.

## Security and Supabase RLS

### Read-only guarantees at the app layer
- The codebase only performs SELECT operations and never issues INSERT/UPDATE/DELETE. Adapters are pure transformations and do not modify the database.
- All realtime-triggered updates re-run read-only selectors to refresh state.

### RLS policies and read access requirements
To operate correctly with Row Level Security enabled, the anonymous or authenticated role used by the frontend must be permitted to:
- SELECT from the following tables at minimum: sales, customers, projects, applications, visits, tasks, activities, campaigns, and optionally users for the activity feed join.
- Access Realtime (replication) for those tables. Supabase’s Realtime respects RLS; ensure policies allow the role to receive row changes for the same rows it can SELECT.

Example policy intent (expressed conceptually)
- Enable read access for authenticated users:
  - For each table used by the dashboard, create a policy allowing SELECT when appropriate (e.g., for public dashboards, a permissive SELECT policy; for tenant-restricted dashboards, a policy constrained to the user’s tenant).
- Ensure Realtime works under the same constraints. If you rely on joins (activities → users), either:
  - Permit SELECT on users fields used by the UI (name, avatar_url), or
  - Fallback to activities without user details (the code already supports a fallback path).

Note: The frontend already includes a fallback for the activities join; if the join is blocked by RLS, it gracefully degrades to activity items without user fields.

### Required permissions in deployed environments
- Database:
  - SELECT on: sales, customers, projects, applications, visits, tasks, activities, campaigns
  - Optional SELECT on users (limited fields) if you want author name/avatar in the feed
- Realtime:
  - Realtime enabled for the public schema tables listed above
  - Role used by the frontend must be allowed by RLS to receive change events for those rows

No INSERT/UPDATE/DELETE permissions are required for the dashboard.

## Environment configuration

The dashboard_frontend uses Create React App and requires the following environment variables (exposed to the browser via REACT_APP_ prefix):

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Place these in your .env file at the project root for local development, and in your deployment environment’s configuration. The Supabase client performs a runtime check and logs an error if these variables are missing.

## Implementation notes

- SELECT queries and mappings:
  - See dashboard_frontend/src/hooks/useQueries.js for read-only selectors.
  - See dashboard_frontend/src/lib/adapters.js for mapping/aggregation helpers (e.g., KPI tiles, task distribution, monthly visitors).
- Realtime wiring:
  - See dashboard_frontend/src/hooks/useRealtimeDashboard.js for the unified subscription channel and event-to-refresh mapping.
  - The utility to create channels lives in dashboard_frontend/src/lib/supabaseClient.js.
- UI integration:
  - dashboard_frontend/src/App.js wires initial reads and realtime-driven refreshes to components.

## Container details

- Container name: dashboard_frontend
- Environment variables: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_KEY
- Frontend framework: React (Create React App)
- Interface: Browser-based web application

## Limitations and future extension

- This implementation is intentionally read-only. If future requirements include moderation actions (e.g., approve/reject activities), introduce server-side role separation and secure RLS policies for write paths, and update the frontend to call RPCs/mutations accordingly.
- For large datasets or aggregations, consider server-side views/RPCs that expose pre-aggregated, RLS-safe results to keep client SELECTs efficient.

## Getting started

1) Configure .env with:
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_or_service_role_key_suitable_for_frontend

2) Ensure the Supabase project grants:
- SELECT on required tables to the chosen role
- Realtime access on those tables, with RLS aligned to your visibility rules

3) Run the frontend:
cd dashboard_frontend
npm install
npm start

Open http://localhost:3000 to view the dashboard.
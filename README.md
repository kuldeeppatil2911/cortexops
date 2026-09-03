# CortexOps Incident Management System

CortexOps is a full-stack incident management system for reporting, tracking, updating, and resolving operational incidents. It demonstrates a practical MERN-style application with a React client, an Express REST API, and MongoDB persistence.

## What The Project Does

Users can create incidents with a title, description, and severity, then monitor the incident queue, update status, edit details, or remove incidents. The application is intentionally small enough to understand quickly while still showing the complete path from browser interaction to database persistence.

## Features

- Create incidents with `Low`, `Medium`, or `High` severity
- View incidents sorted newest first
- Update title, description, severity, and status
- Track `Open`, `In Progress`, and `Resolved` states
- Delete incidents
- Responsive React interface
- MongoDB Atlas persistence through Mongoose
- REST API with JSON responses
- Production server that serves both the API and built React app
- Health endpoint for Render or other hosting platforms
- Automated CRUD integration tests using an isolated in-memory MongoDB
- Socket.IO live incident and agent progress updates
- Automatic agent activation when an incident is created
- Persisted agent activity, incident timeline, root-cause context, and recommendations
- Separate active queue and resolved archive in the dashboard
- Service Registry for monitored service ownership and dependencies

## Technology Stack

| Layer | Technology | Role |
| --- | --- | --- |
| UI | React 19, React Hooks, CSS | Dashboard and incident workflows |
| API | Node.js, Express 5 | HTTP routes and request handling |
| Database | MongoDB, Mongoose | Incident persistence and schema validation |
| Testing | Node test runner, Supertest, MongoDB Memory Server | API and lifecycle verification |
| Deployment | Render, Docker, GitHub | Production hosting and delivery |

## Architecture

```mermaid
flowchart TD
    ROOT[CortexOps]
    ROOT --> CLIENT[React Frontend]
    CLIENT --> DASH[Dashboard, filters, resolved archive]
    CLIENT --> AGENT_UI[Live agent panel and incident context]
    ROOT --> API[Express REST API]
    API --> INCIDENTS[Incident CRUD]
    API --> AGENT[Agent workflow endpoint]
    ROOT --> REALTIME[Socket.IO realtime layer]
    REALTIME --> EVENTS[Created, updated, deleted, agent progress]
    ROOT --> DATA[(MongoDB Atlas)]
    DATA --> HISTORY[Timeline, activity, knowledge, resolution]
    AGENT --> DATA
    AGENT --> REALTIME
    REALTIME --> CLIENT
```

The production process runs `backend/server-prod.js`. It mounts the incident API under `/api/incidents`, serves the compiled files from `frontend/build`, and sends browser routes to the React entry page.

## Request Flow

```mermaid
flowchart TD
    DETECTED[Incident created]
    DETECTED --> ACTIVATED[Agent activated automatically]
    ACTIVATED --> HEALTH[Check service health]
    HEALTH --> SIGNALS[Check incident signals]
    SIGNALS --> KB[Search incident knowledge base]
    KB --> RECOMMEND[Prepare recommendation]
    RECOMMEND --> PERSIST[Persist activity and timeline]
    PERSIST --> EVENT[Broadcast Socket.IO progress event]
    EVENT --> UI[Update selected incident in every open dashboard]
```

## Data Model

```text
Incident
├── _id: MongoDB ObjectId
├── title: required string
├── raisedBy: required string
├── description: optional string
├── knowledgeBase: incident-specific note
├── severity: Low | Medium | High
├── status: Open | In Progress | Resolved
├── statusChangedBy: status transition actor
├── statusChangeReason: required for transitions
├── agentState: idle | analyzing | completed
├── agentActivity[]: persisted investigation steps
├── timeline[]: persisted incident events
├── rootCause: evidence-based context
├── resolution: recommendation and execution boundary
├── resolvedAt: resolution timestamp
├── createdAt: date
└── updatedAt: date
```

## API Reference

Base URL: `/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/incidents` | List all incidents, newest first |
| `POST` | `/incidents` | Create an incident |
| `GET` | `/incidents/:id` | Fetch one incident |
| `PUT` | `/incidents/:id` | Update an incident |
| `DELETE` | `/incidents/:id` | Delete an incident |
| `POST` | `/incidents/:id/agent/start` | Start an incident investigation manually |
| `GET` | `/services` | List registered services |
| `POST` | `/services` | Register a service |
| `GET` | `/services/:id` | Fetch one service |
| `PUT` | `/services/:id` | Update a service |
| `DELETE` | `/services/:id` | Remove a service |

Example create request:

```json
{
  "title": "Database connection failure",
  "description": "The primary database is unavailable.",
  "severity": "High"
}
```

New incidents default to `Open` and automatically activate the agent workflow. Status transitions require `statusChangedBy` and `statusChangeReason`. Mongoose validates severity and status values before writing to MongoDB.

## Incident Lifecycle

```mermaid
flowchart TD
    NEW[Open / new incident]
    NEW --> INVESTIGATING[In Progress / investigation]
    INVESTIGATING --> RESOLVED[Resolved after operator confirmation]
    RESOLVED --> ARCHIVE[Resolved archive]
    ARCHIVE --> HISTORY[Timeline and knowledge history retained]
```

The current API uses the existing `Open -> In Progress -> Resolved` states. Resolved incidents are never deleted or mixed into the active queue.

## Service Registry

Phase 1 adds a database-backed service catalog. Each registered service stores its name, description, environment, health endpoint, owner, operational status, and dependency list. The frontend Services page uses the same REST and Socket.IO layers as incidents, so changes made in one open dashboard appear in other connected dashboards.

```mermaid
flowchart TD
    Registry[Service Registry]
    Registry --> ServiceModel[Service model]
    ServiceModel --> ServiceData[(MongoDB Atlas)]
    Registry --> ServiceAPI[/api/services CRUD]
    ServiceAPI --> Socket[Socket.IO service events]
    Socket --> Dashboard[Services page and Overview health panel]
```

## Live Agent And Guide

The incident agent is a backend workflow, not a fake ChatGPT response. After creation, it persists and broadcasts these real steps:

1. Check service health
2. Check incident signals
3. Search the incident knowledge-base note
4. Prepare a recommendation

The agent does not claim to execute production changes. Recommendations are stored separately from operator status changes. The Guide panel answers questions from the current incident counts, status, severity, and knowledge-base notes.

## Realtime Events

The Socket.IO server broadcasts:

| Event | Trigger |
| --- | --- |
| `incident:created` | New incident saved |
| `incident:updated` | Incident or agent state saved |
| `incident:deleted` | Incident deleted |
| `agent:started` | Investigation activated |
| `agent:progress` | Investigation step persisted |

Open dashboards reconcile these events immediately without a page refresh. On reconnect, the frontend reloads the REST list on page load, so persisted state remains the source of truth.

## Project Structure

```text
cortexops/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── model/Incident.js            # Incident schema and validation
│   ├── model/Service.js             # Service Registry schema
│   ├── routes/incidentRoutes.js     # CRUD API routes
│   ├── routes/serviceRoutes.js      # Service Registry API routes
│   ├── test/incidentRoutes.test.js  # Integration tests
│   ├── test/serviceRoutes.test.js   # Service Registry tests
│   ├── server.js                    # Local API server
│   └── server-prod.js               # Production API + static server
├── frontend/
│   ├── public/index.html            # Browser metadata and title
│   └── src/
│       ├── App.js                   # Dashboard state and workflows
│       └── App.css                  # Interface styling
├── Dockerfile                       # Production container
├── docker-compose.prod.yml          # Container runtime definition
├── render.yaml                      # Render Blueprint
├── package.json                     # Root commands
└── DEPLOYMENT.md                    # Deployment reference
```

## Run Locally

Prerequisites: Node.js 18 or newer and a MongoDB connection string.

```powershell
cd C:\Users\kp494\OneDrive\Desktop\cortexops
npm run install:all
```

Create `backend/.env`:

```env
MONGO_URI=your-mongodb-connection-string
```

Start the API:

```powershell
npm start
```

Start the React development server in another terminal:

```powershell
npm --prefix frontend start
```

The API runs on `http://localhost:5000`; the React development server normally runs on `http://localhost:3000`.

## Testing And Quality Checks

Run the backend integration tests:

```powershell
npm --prefix backend test
```

Run the production frontend build:

```powershell
npm run build
```

Run syntax checks:

```powershell
node --check backend/server.js
node --check backend/server-prod.js
node --check backend/config/db.js
```

The test suite creates a temporary MongoDB instance, exercises incident and Service Registry create/list/get/update/delete lifecycles, verifies missing-resource behavior, validates required fields, and confirms realtime event emission. It does not modify MongoDB Atlas data.

## Production Deployment

The repository includes a Render Blueprint in `render.yaml`.

1. Open Render and choose **New + -> Blueprint**.
2. Select `kuldeeppatil2911/cortexops` on branch `main`.
3. Set the secret `MONGO_URI` environment variable in Render.
4. Apply the Blueprint.

Render runs:

```text
Build: npm install --prefix backend --omit=dev && npm install --prefix frontend && npm run build --prefix frontend
Start: npm run start:production
Health: /api/health
```

The live deployment is currently available at:

https://cortexops-1.onrender.com

## Deployment Flow

```mermaid
flowchart TD
    Commit[Push commit to GitHub] --> Render[Render detects main branch]
    Render --> Install[Install backend and frontend dependencies]
    Install --> Build[Build React production bundle]
    Build --> Start[Start server-prod.js]
    Start --> Health{GET /api/health}
    Health -->|200 OK| Live[Service marked live]
    Health -->|Failure| Logs[Inspect Render deploy logs]
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `PORT` | Render assigns | HTTP listening port |
| `REACT_APP_API_BASE_URL` | No | Optional separate API origin; same-origin is the production default |

Never commit `backend/.env` or expose database credentials in client-side code.

## Future Improvements

- Authentication and role-based access control
- Incident assignment and team ownership
- Audit history and comments
- Search, filters, pagination, and dashboard metrics
- WebSocket notifications for live updates
- Automated CI checks and coverage reporting

## Repository

https://github.com/kuldeeppatil2911/cortexops

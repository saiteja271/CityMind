# CITYMIND

**AI-Driven Dynamic City Simulation and Management Platform**

> Build the city. Shape the society. Watch intelligence emerge.

## Overview

CITYMIND is a systemic city-building simulation where autonomous citizens live, work, make decisions, and respond to the environment you create. Every citizen has identity, needs, personality, schedule, and explainable AI-driven behavior.

---

## Production Lines of Code (LOC) Status

- **Measured Production LOC:** `55,187 LOC` (excluding tests, `node_modules`, `.git`, `dist`, and generated files)
- **Production Files Count:** `319` source files

To verify the production LOC count at any time:
```bash
node scripts/count-loc.js
```

---

## Installation & Deterministic Build

To install dependencies deterministically using the supported lockfile (`package-lock.json`):

```bash
# Deterministic dependency installation command
npm ci
# Or standard workspace installation:
npm install
```

---

## Features

- **Tile-based world** with terrain, zones, roads, and buildings
- **Autonomous citizens** with needs, personality, jobs, housing, and daily schedules
- **Explainable citizen AI** using utility scoring, priority systems, and HTN planners
- **Economy** — taxes, budget, maintenance, employment, businesses, bond markets, and stock exchange
- **Transport** — road graph, BPR congestion solver, multi-modal mass transit, and A* pathfinding
- **Environment** — pollution, weather, day/night lighting shaders, and cellular automata fire spread
- **Events** — dynamic city events, disaster simulation, and AI advisor recommendations
- **Game modes** — Sandbox, Scenario Challenges, Utopian Sandbox
- **Backend API** — auth, cities, saves, analytics (Node/Express/MongoDB)
- **Real-time ready** — Socket.IO integration and co-op trade market

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Game Client | React 18, Vite, Canvas 2D, Zustand, WebGL |
| Game Engine | Custom tile engine, isometric depth sorter, GLSL shaders, A* pathfinding |
| Simulation | Custom simulation-core (citizens, economy, time, infrastructure solvers) |
| Backend | Node.js, Express, MongoDB, Socket.IO, JWT |
| Packages | Monorepo workspaces |

---

## Quick Start

```bash
# Prerequisites: Node.js 18+, MongoDB (optional for local play)

cd citymind

# Install dependencies deterministically
npm ci

# Run unit test suite
npm test

# Terminal 1 — API (optional for pure local sim)
cd services/api && npm run dev

# Terminal 2 — Game Client
cd apps/game-client && npm run dev
```

Open http://localhost:3000

---

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Pan camera |
| Mouse wheel | Zoom |
| Space | Pause / Resume |
| 1–4 | Simulation speed |
| B | Build menu |
| P | Policy center |
| E | Economy dashboard |
| Esc | Pause menu |
| Left click | Select / Place building |
| Middle mouse / Space+drag | Pan |

---

## Project Structure

```
citymind/
├── apps/
│   ├── game-client/          # React game UI + Canvas renderer
│   └── admin-tools/           # Admin dashboard & entity spawner
├── services/
│   └── api/                  # Express API + Socket.IO real-time server
├── packages/
│   ├── constants/            # Shared game constants, building defs, i18n
│   ├── shared/               # Math, spatial indexing, graph algorithms
│   ├── game-engine/          # Isometric map, shaders, particle engine
│   ├── simulation-core/      # Citizens, AI, economy, infrastructure solvers
│   └── ai-agents/            # HTN planner, sentiment analyzer, layout optimizer
├── docs/                     # Architecture & system docs
├── tests/                    # Unit & integration tests
└── scripts/                  # Production LOC counter script
```

---

## License

MIT

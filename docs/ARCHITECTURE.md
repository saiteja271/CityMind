# CITYMIND Architecture

## Overview

CITYMIND uses a monorepo workspace structure separating the game client, simulation engine, shared packages, and backend services.

```
                    CITYMIND
                        |
          +-------------+-------------+
          |                           |
    GAME CLIENT                  BACKEND API
  React + Canvas                  Express
          |                           |
          v                           v
    SIMULATION ENGINE  <----->   MongoDB
  (runs in browser or              |
   simulation-service)         Socket.IO
```

## Packages

### @citymind/constants
Central configuration: map sizes, building definitions, citizen parameters, economy rates, time speeds, UI colors.

### @citymind/utilities
Pure helpers: math, spatial queries, ID generation, formatting, EventEmitter, PriorityQueue (for A*).

### @citymind/game-engine
- **MapGrid / Tile** — tile-based world, terrain, zones, buildings, road graph
- **Camera** — pan, zoom, screen↔world conversion
- **Pathfinder** — A* on road graph and grid
- **CanvasRenderer** — efficient tile rendering
- **InputManager** — keyboard/mouse
- **EntityManager** — dynamic entities

### @citymind/simulation-core
- **SimulationEngine** — orchestrates all systems
- **Citizen / CitizenAI / CitizenManager** — agents, decisions, lifecycle
- **EconomySystem** — budget, taxes, maintenance
- **TimeSystem** — clock, pause, speed
- **BuildingManager** — construction, efficiency

## Data Flow

1. Player places buildings via UI → SimulationEngine.placeBuilding
2. TimeSystem advances → citizens update needs & AI decisions
3. Pathfinder routes citizens to work/home/shop
4. Economy ticks monthly; population yearly
5. Advisor reads live state for recommendations
6. Optional: state persisted via API save endpoints

## Performance

- Citizen updates batched (cursor-based, ~100/tick)
- Only visible tiles rendered
- Road graph for fast pathfinding
- Simulation tick decoupled from render frame

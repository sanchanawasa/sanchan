# CLAUDE.md - Project Guide for AI Assistants

## Project Overview

**sanchan** is a browser-based vertical scrolling shooter game built entirely with vanilla HTML5, CSS3, and JavaScript (ES6+). No build tools, package managers, or external dependencies are required.

## Repository Structure

```
sanchan/
├── CLAUDE.md      # This file - AI assistant guide
├── README.md      # Project readme
├── index.html     # Game entry point (HTML structure, canvas, UI overlays)
├── style.css      # UI styling (overlays, buttons, HUD)
└── game.js        # All game logic (~600 lines, single file)
```

## Tech Stack

- **HTML5 Canvas** - All game rendering (480x640px canvas)
- **Vanilla JavaScript (ES6+)** - Game logic, no frameworks or libraries
- **CSS3** - UI overlay styling only (HUD, menus)
- **Zero external dependencies** - Everything built from browser APIs

## Running the Game

No build step required. Open `index.html` in any modern browser:

```bash
# Option 1: Local HTTP server (recommended)
python3 -m http.server 8000
# Then open http://localhost:8000

# Option 2: Node.js
npx serve .

# Option 3: Direct file open
open index.html
```

## Testing

No automated test framework. Test by opening the game in a browser and verifying:
- Player movement (Arrow keys / WASD)
- Shooting (Spacebar)
- Enemy spawning and collision
- Power-up collection
- Score tracking and game over flow

## Architecture

### Game Loop

Uses `requestAnimationFrame()` for 60fps rendering. Single `gameLoop()` function with this pipeline:

1. Clear canvas (dark background `#0a0a2e`)
2. Update & draw scrolling star background
3. Spawn enemies based on timer and difficulty
4. Update all entities (player, bullets, enemies, particles, power-ups)
5. Run collision detection
6. Render all entities in layered order

### Entity Classes

All game objects follow the `update()` / `draw()` pattern:

| Class | Purpose | Key Properties |
|-------|---------|---------------|
| `Player` | Player ship | speed=5, shootRate=10, powerLevel 1-3, invincibility frames |
| `Bullet` | Player projectiles | velocity-based, yellow with glow |
| `EnemyBullet` | Enemy projectiles | circle-based, red, aimed at player |
| `Enemy` | Enemy entities | 4 types (basic/fast/tank/shooter), type-specific HP/speed/behavior |
| `PowerUp` | Dropped items | 8% drop chance, increases powerLevel (max 3) |
| `Particle` | Visual effects | Explosions on defeat, velocity decay, alpha fade |

### Enemy Types

| Type | HP | Score | Shape | Behavior |
|------|-----|-------|-------|----------|
| `basic` | 1 | 100 | Diamond | Drifts downward, bounces off walls |
| `fast` | 1 | 150 | Triangle | High speed movement |
| `tank` | 5 | 300 | Hexagon | Slow, high HP, shoots at player |
| `shooter` | 2 | 200 | Diamond | Fires aimed bullets at player |

### Difficulty Progression

- Enemy spawn interval starts at 60 frames, decreases by 5 every 600 frames (min 20)
- Enemy type distribution changes based on score thresholds: 0, 1000, 3000, 6000
- Higher scores introduce harder enemy types with increasing frequency

### Collision Detection

- `rectsOverlap(a, b)` - AABB rectangle overlap for most collisions
- `circleRectOverlap(circle, rect)` - Circle-to-rectangle for enemy bullets vs player

### Power-Up System

- 3 power levels controlling bullet spread:
  - Level 1: Single center bullet
  - Level 2: Triple shot (center + two diagonals)
  - Level 3: Five-shot spread pattern
- Power level resets to 1 on player hit

### Game State

Global variables manage state:
- `gameRunning`, `score`, `lives` (starts at 3), `frameCount`
- Entity arrays: `enemies`, `bullets`, `enemyBullets`, `particles`, `powerUps`, `stars`
- Difficulty: `spawnInterval`, `enemySpawnTimer`, `difficultyTimer`

### Input

- Arrow keys or WASD for movement
- Spacebar for shooting
- Default browser behavior prevented for game keys

### Key Constants

```
Canvas:              480 x 640 px
Player speed:        5 px/frame
Shoot cooldown:      10 frames
Bullet velocity:     -8 vy (center), -7 vy (spread)
Invincibility:       90 frames after hit
Initial spawn rate:  every 60 frames
Min spawn rate:      every 20 frames
Power-up drop rate:  8%
```

## Code Style Conventions

- Use `const` / `let` only (no `var`)
- ES6 class syntax for all game entities
- `camelCase` for variables and functions
- `PascalCase` for class names
- Keep all game logic in `game.js` unless complexity demands splitting
- Use `requestAnimationFrame` for the game loop (not `setInterval`)
- Filter-based entity lifecycle: `array = array.filter(e => e.alive)`

## File Responsibilities

- **`index.html`** - DOM structure only: canvas element, HUD overlays (score/lives), start/game-over screens with buttons
- **`style.css`** - Visual styling for HTML overlays; all in-game rendering is done via Canvas API in `game.js`
- **`game.js`** - Complete game logic: classes, input handling, game loop, rendering, collision, spawning, state management

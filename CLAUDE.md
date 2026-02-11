# CLAUDE.md - Project Guide for AI Assistants

## Project Overview

**sanchan** is a browser-based shooting game built with vanilla HTML, CSS, and JavaScript. No build tools or package managers are required.

## Repository Structure

```
sanchan/
├── CLAUDE.md          # This file - AI assistant guide
├── README.md          # Project readme
├── index.html         # Main game entry point
├── style.css          # Game styles
└── game.js            # Game logic
```

## Development

### Running the Game

Open `index.html` directly in a browser, or use any local HTTP server:

```bash
# Python
python3 -m http.server 8000

# Node.js (if npx available)
npx serve .
```

### Tech Stack

- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** (ES6+, no frameworks)
- **CSS** for UI overlay styling

### Key Conventions

- No build step required - all files are served directly
- Game logic is contained in `game.js`
- Use `requestAnimationFrame` for the game loop
- Keep code in a single JS file unless complexity demands splitting

## Testing

No automated test framework is configured. Test by opening the game in a browser.

## Code Style

- Use `const`/`let` (no `var`)
- Use ES6 class syntax for game entities
- Descriptive variable and function names in camelCase
- Classes in PascalCase

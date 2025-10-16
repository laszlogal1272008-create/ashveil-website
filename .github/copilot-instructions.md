# Copilot Instructions for AI Agents

## Project Overview
- This is a React web application bootstrapped with Create React App.
- Main source code is in `src/`, with components in `src/components/`.
- Entry point: `src/index.js`. Main app logic: `src/App.js`.
- Static assets are in `public/` (e.g., `index.html`, `manifest.json`).

## Key Components & Structure
- Major UI sections are implemented as React components in `src/components/`:
  - `Home.jsx`, `Games.jsx`, `Inventory.jsx`, `Leaderboards.jsx`, `Market.jsx`, `Profile.jsx`, `Shop.jsx`, `Information.jsx`, `LightRays.jsx`
- Shared styles: `src/App.css`, `src/index.css`.
- Animation components: `LightRays.jsx` with `LightRays.css` for visual effects.
- Assets (images, etc.): `src/assets/`.

## Developer Workflows
- **Start development server:** `npm start` (runs on http://localhost:3000)
- **Run tests:** `npm test` (Jest, interactive watch mode)
- **Build for production:** `npm run build` (outputs to `build/`)
- **Eject (advanced, irreversible):** `npm run eject`

## Project Conventions
- Use functional React components (see `src/components/`).
- File naming: PascalCase for components, camelCase for variables/functions.
- Component props and state are managed locally; no global state management detected.
- **React Router**: Used for navigation between pages (Home, Games, Shop, etc.).
- **Multi-page application**: Each section has its own route and component.

## Patterns & Examples
- Each major feature is a separate component (e.g., `Games.jsx` for games UI).
- Import assets and styles at the top of each component file.
- Example import pattern:
  ```js
  import React from 'react';
  import './App.css';
  import Header from './components/Header';
  ```

## External Dependencies
- Standard Create React App dependencies (React, ReactDOM, Jest, etc.).
- **react-router-dom**: For page navigation and routing.
- **ogl**: WebGL library for animations and visual effects.
- **netlify-cli**: For deployment to live website.

## How to Extend
- Add new UI features as components in `src/components/`.
- Update `App.js` to include new components in the main app view.
- Place static assets in `public/` or `src/assets/` as appropriate.

## References
- See `README.md` for more on available scripts and workflows.

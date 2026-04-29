# Habit Tracker PWA

A mobile-first Habit Tracker Progressive Web App built for Stage 3.

## Overview
This is a Habit Tracker PWA that allows users to sign up, log in, manage daily habits, track streaks, and use the app offline thanks to Service Worker caching. The application persists state locally in the browser using `localStorage`.

## Setup Instructions
1. Ensure you have Node.js installed.
2. Run `npm install` to install all dependencies.
3. Run `npx playwright install` to download browser binaries for E2E tests.

## Run Instructions
- Development server: `npm run dev`
- Production build: `npm run build` followed by `npm run start`

The application will be available at [http://localhost:3000](http://localhost:3000).

## Test Instructions
The project uses Vitest for unit/integration tests and Playwright for E2E tests.
- Unit Tests: `npm run test:unit`
- Integration Tests: `npm run test:integration`
- E2E Tests: `npm run test:e2e`
- Run All Tests: `npm run test`

## Local Persistence Structure
All data is stored in `localStorage` under the following keys:
- `habit-tracker-users`: JSON array of registered users (`{ id, email, password, createdAt }`).
- `habit-tracker-session`: JSON object of the currently logged-in user (`{ userId, email }`), or null.
- `habit-tracker-habits`: JSON array of all habits created by all users (`{ id, userId, name, description, frequency, createdAt, completions }`). 

## PWA Implementation
The PWA implementation uses a custom `sw.js` (Service Worker) registered manually in `src/app/layout.tsx`.
- The `manifest.json` specifies the standalone display mode, theme colors, and icons.
- The `sw.js` caches the app shell (including root `/`, manifest, and icons) on install.
- On fetch events, it falls back to the network, and if offline, it returns the cached `/` route so the app does not hard-crash, fulfilling the offline capability requirement.

## Trade-offs and Limitations
- **Security**: Passwords are stored in plaintext in localStorage. This is purely for demonstration purposes and would not be used in a real application.
- **Scalability**: All users and habits are stored in a single JSON array per key in `localStorage`. This could slow down with excessive data, but is sufficient for the required constraints.
- **Duplicate Data on User Change**: For simplicity, `habit-tracker-habits` is filtered upon login. The save logic replaces current user habits while keeping others.

## Required Test Mapping
| Test File | Verified Behavior |
|-----------|------------------|
| `tests/unit/slug.test.ts` | Validates deterministic slug generation from habit names. |
| `tests/unit/validators.test.ts` | Validates habit name requirements (non-empty, max 60 chars). |
| `tests/unit/streaks.test.ts` | Verifies streak logic correctly calculates consecutive days backwards from today. |
| `tests/unit/habits.test.ts` | Verifies pure-function toggling of habit completions (no duplicates, no mutation). |
| `tests/integration/auth-flow.test.tsx` | Simulates user flows for signup, login, duplicate detection, and session creation. |
| `tests/integration/habit-form.test.tsx` | Simulates creating, editing, and deleting habits from the UI and reflects local storage updates. |
| `tests/e2e/app.spec.ts` | Playwright E2E testing of the full user journey: splash screens, routing, habits management, page reloads, logout, and offline PWA rendering. |

# Summarist

[![CI](https://github.com/seb-giraldo/summarist/actions/workflows/ci.yml/badge.svg)](https://github.com/seb-giraldo/summarist/actions/workflows/ci.yml)

Summarist is a React web app for discovering concise book summaries and listening to them as audio. Browse recommendations, search for books, save titles to a personal library, track finished books, and choose a subscription plan.

## Features

- Book discovery with selected, recommended, and suggested titles
- Search by book title or author
- Book detail pages and an in-app audio player
- Account registration and sign-in with Firebase Authentication
- Saved and finished book lists stored in Firebase
- Basic and premium subscription status, with Stripe checkout and billing-portal flows
- Responsive layouts and loading placeholders

## Tech stack

- React 19 and TypeScript
- Vite
- React Router
- Redux Toolkit and React Redux
- Firebase Authentication and Cloud Firestore
- Stripe via Firebase's Stripe payments extension

## Getting started

### Requirements

- Node.js and npm
- Access to the Firebase project used by the app
- The book API and, if testing subscriptions, the configured Stripe integration

### Install and run

```sh
npm install
npm run dev
```

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check the app and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode with Vitest |
| `npm test -- --run` | Run tests once and exit |

## Testing

The unit and component tests use **Vitest** for the test runner and **React Testing Library** for component testing. Tests are written in `.test.jsx` files alongside their components. End-to-end tests use **Playwright** and live in the `e2e/` folder; see [End-to-end tests](#end-to-end-tests).

### Running tests

```sh
# Watch mode (re-runs tests on file changes)
npm test

# Single run
npm test -- --run

# Run a specific test file
npm test -- src/components/Authmodal.test.jsx
```

### Test coverage

| Component / Page | Tests | Notes |
| --- | --- | --- |
| **AuthModal** | Opens/closes on icon and overlay clicks; shows error on failed sign-in; guest login calls sign-in with correct credentials | Mocks `firebase/auth` |
| **Searchbar** | Calls `getBooksByAuthorOrTitle` with search term and renders results | Mocks `axios` |
| **LibraryTab** | Shows correct item counts for saved and finished books | Mocks Firebase and `axios`; sets user in Redux |
| **ChoosePlanPage** | Renders premium plan cards; validates plan selection; calls checkout with chosen plan | Mocks `getCheckoutUrl` and `window.location` |

### Mocking strategy

- **External APIs:** `axios` is mocked globally in tests that need HTTP requests (Searchbar, LibraryTab).
- **Firebase:** `firebase/auth` is mocked to control sign-in behavior. Firebase Firestore and Auth are mocked per-test where needed (LibraryTab, ChoosePlanPage).
- **Redux:** The real store is used, but actions are dispatched before rendering to set initial state (for example, opening the AuthModal or setting a logged-in user).
- **React Router:** Tests wrap components in `MemoryRouter` for routing support.
- **jest-dom matchers:** `toBeInTheDocument()` and other matchers are available via `@testing-library/jest-dom`.

### Writing new tests

1. Create a `.test.jsx` file next to the component.
2. Import `render` and `screen` from `@testing-library/react` and `@testing-library/jest-dom/vitest`.
3. Arrange: Set up mocks, dispatch Redux actions, and render the component wrapped in `<Provider>` and `<MemoryRouter>`.
4. Act: Interact with the component using `userEvent` (for example, `userEvent.type()`, `userEvent.click()`).
5. Assert: Check the rendered output with `screen.getByText()`, `expect(...).toBeInTheDocument()`, and mock call assertions.

### Example test

```jsx
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MyComponent from "./MyComponent";

vi.mock("axios");

test("my component works", async () => {
  axios.get.mockResolvedValueOnce({ data: "test" });
  render(<MyComponent />);
  await userEvent.type(screen.getByPlaceholderText(/search/i), "query");
  expect(await screen.findByText("test")).toBeInTheDocument();
});
```

## End-to-end tests

The end-to-end suite uses **Playwright** (`@playwright/test`) to drive the app in real browsers: Chromium, Firefox, and WebKit. Specs live in `e2e/` and run against the Vite dev server at `http://localhost:5173`.

### Running e2e tests

```sh
# One-time setup: download the browser binaries
npx playwright install

# Run all e2e tests in all three browsers
npx playwright test

# Run a single spec, or a single browser
npx playwright test e2e/browsing-and-streaming.spec.js
npx playwright test --project=firefox

# Open the HTML report from the last run
npx playwright show-report
```

The Playwright config starts `npm run dev` automatically if port 5173 is not already in use. The tests use the real Firebase project, so they need the same configuration as the app (see [Services and configuration](#services-and-configuration)).

### E2E test coverage

| Spec | Test | What it covers | Notes |
| --- | --- | --- | --- |
| **browsing-and-streaming** | Browse For You, open a book, and play its audio | Guest login, For You recommendations, book details, player page, audio starts and pauses | Uses the live book API; checks the `<audio>` element's `src` and `currentTime` |
| **browsing-and-streaming** | A finished book is added to Finished in the Library tab | Plays a book to its end, then confirms it appears under **Finished** in the Library tab | Seeks near the end of the track so playback finishes quickly |

### E2E results

Last full run: **6 of 6 passed** (2 tests × Chromium, Firefox, WebKit).

| Browser | browsing-and-streaming: play audio | browsing-and-streaming: Finished in Library |
| --- | --- | --- |
| Chromium | Passed | Passed |
| Firefox | Passed | Passed |
| WebKit | Passed | Passed |

Results depend on the live book API and Firebase, so a failure may come from an external service rather than the app. The `test-results/` folder keeps artifacts (error context and traces) for failed runs.

### E2E conventions

- **Role-based locators:** Specs prefer `getByRole`, `getByText`, and `getByPlaceholder` over CSS selectors. Class selectors are used only where the UI has no accessible name (for example `.book--wrapper` and `.audio__controls--btn-play`).
- **Real services, no mocks:** Unlike the component tests, e2e tests do not mock Firebase or the book API.
- **Waiting on async results:** Use `expect(...).toBeVisible({ timeout })` and `expect.poll(...)` for data and audio state instead of fixed sleeps.

## Continuous integration

GitHub Actions runs the checks automatically. The workflows live in `.github/workflows/`:

| Workflow | File | Runs on | What it does |
| --- | --- | --- | --- |
| CI | `ci.yml` | Every push and pull request | Three parallel jobs: `lint` (`npm run lint`), `test` (`npx vitest run src`), and `build` (`npm run build`) |
| Playwright Tests | `playwright.yml` | Pushes and pull requests to `main` or `master` | Installs browsers, runs `npx playwright test`, and uploads `playwright-report/` as an artifact (kept 30 days) |

The status badge at the top of this README shows the result of the CI workflow. Each job uses Node 22.x with the npm cache, and installs dependencies with `npm ci`.

The CI test job runs `vitest run src` rather than `npm test`. `npm test` runs in watch mode, which never exits in CI. Limiting the run to `src` also keeps Vitest from picking up the Playwright spec in `e2e/`.

To reproduce a CI job locally, run the same commands in order:

```bash
npm ci
npm run lint
npx vitest run src
npm run build
```

Playwright tests are kept in their own workflow because they need browser installs and take much longer than the other checks. See [End-to-end tests](#end-to-end-tests) for how to run them locally.

## App routes

| Path | Description |
| --- | --- |
| `/` | Landing page |
| `/for-you` | Personalized book recommendations |
| `/library` | Saved and finished books |
| `/settings` | Account and subscription settings |
| `/book/:bookId` | Book details |
| `/player/:bookId` | Book summary and audio player |
| `/choose-plan` | Subscription plan selection |

Sign in or create an account to access the account, library, and listening features.

## Services and configuration

- **Firebase:** The Firebase app configuration is currently defined in `src/firebase.tsx`. The app uses Firebase Authentication and Cloud Firestore for account and library data. Use the intended Firebase project and enable the required services before running authenticated flows.
- **Book data:** Discovery, search, and book details are fetched from the Summarist Cloud Functions API. The API is referenced directly in the app, so those endpoints must be available for book-related features.
- **Subscriptions:** Checkout and subscription management use Stripe integration through Firebase. Configure the Firebase Stripe payments extension, its Cloud Functions, and matching product prices for subscription flows.

Do not put private service credentials in client-side code. If adapting the app to another Firebase project or backend, configure the appropriate public client settings and update the corresponding service integrations.

## Project structure

```text
src/
  components/  Shared UI, discovery, library, account, and audio components
  functions/   Book rendering, Firebase data helpers, and loading states
  pages/       Landing, account, and plan pages
  redux/       Application and authentication state
  stripe/      Checkout, portal, and premium-status integration
  types/       Shared TypeScript types
  firebase.tsx Firebase app, Authentication, and Firestore setup
  main.tsx     React entry point and route configuration
```

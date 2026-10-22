# Summarist

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

The test suite uses **Vitest** for the test runner and **React Testing Library** for component testing. Tests are written in `.test.jsx` files alongside their components.

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

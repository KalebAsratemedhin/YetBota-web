import { setupServer } from "msw/node";

// Shared MSW server. Tests register handlers per-case with `server.use(...)`;
// any unhandled request fails the test (configured in setup.ts).
export const server = setupServer();

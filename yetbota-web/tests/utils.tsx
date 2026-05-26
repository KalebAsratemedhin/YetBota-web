import type { ReactElement, ReactNode } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, type RenderOptions } from "@testing-library/react";
import { baseApi } from "@/store/api/baseApi";
import { contentBaseApi } from "@/store/api/contentBaseApi";
import { aiBaseApi } from "@/store/api/aiBaseApi";
import authReducer, { type AuthState } from "@/store/authSlice";
import localeReducer from "@/store/localeSlice";

// Importing the endpoint modules injects their endpoints (and registers the
// query/mutation hooks) onto the base APIs before a store is created.
import "@/store/api/authApi";
import "@/store/api/contentApi";
import "@/store/api/notificationApi";
import "@/store/api/deviceApi";

export interface PreloadedRootState {
  auth?: AuthState;
}

export function makeStore(preloadedState?: PreloadedRootState) {
  return configureStore({
    reducer: {
      locale: localeReducer,
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
      [contentBaseApi.reducerPath]: contentBaseApi.reducer,
      [aiBaseApi.reducerPath]: aiBaseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        baseApi.middleware,
        contentBaseApi.middleware,
        aiBaseApi.middleware,
      ),
    preloadedState: preloadedState as never,
  });
}

export type TestStore = ReturnType<typeof makeStore>;

/** An authed auth-slice state, for rendering screens behind RequireAuth. */
export function authedState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
    user: { username: "tester" },
    ...overrides,
  };
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: PreloadedRootState;
  store?: TestStore;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store = makeStore(preloadedState), ...options }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export * from "@testing-library/react";

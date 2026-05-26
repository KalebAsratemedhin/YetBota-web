import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./server";

// --- MSW lifecycle ---------------------------------------------------------
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// --- next/link --------------------------------------------------------------
// The real next/link pulls in the Next runtime; render a plain anchor instead.
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode;
      href?: string | { pathname?: string };
    } & Record<string, unknown>) =>
      React.createElement(
        "a",
        { href: typeof href === "string" ? href : (href?.pathname ?? "#"), ...props },
        children,
      ),
  };
});

// --- next/image -------------------------------------------------------------
// Render a plain <img>; the real component needs the Next image runtime.
vi.mock("next/image", async () => {
  const React = await import("react");
  return {
    default: ({
      src,
      alt = "",
      ...props
    }: {
      src?: string | { src?: string };
      alt?: string;
    } & Record<string, unknown>) => {
      // Drop next-specific props that aren't valid on a bare <img>.
      const { fill, priority, loader, quality, placeholder, blurDataURL, ...rest } =
        props as Record<string, unknown>;
      void fill;
      void priority;
      void loader;
      void quality;
      void placeholder;
      void blurDataURL;
      return React.createElement("img", {
        src: typeof src === "string" ? src : (src?.src ?? ""),
        alt,
        ...rest,
      });
    },
  };
});

// --- jsdom polyfills ---------------------------------------------------------
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (!("ResizeObserver" in globalThis)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - assigning the polyfill onto the global scope
  globalThis.ResizeObserver = ResizeObserver;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

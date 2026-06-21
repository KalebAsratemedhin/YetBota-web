import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

// Cross-subscriber request deduper for the RTK Query base layer. Solves two
// distinct failure modes that show up when the backend is slow or down:
//
//  1. In-flight dedup. While a request is pending, any concurrent call with
//     the same method/URL/params attaches to the same in-flight promise
//     instead of opening a parallel connection. RTK Query *already* dedupes
//     identical cache keys via its `condition()` ("status === pending"), but
//     concurrent fetches that arrive at fetchBaseQuery before the thunk has
//     marked the state as pending — or that come from different cache keys
//     hitting the same URL — would otherwise stampede the backend.
//
//  2. Short-window error cache. Without this, /users/me — subscribed by ~16
//     components — fires one fresh request per subscriber whenever the
//     backend is unreachable, because RTK Query's `condition()` only short-
//     circuits on a *fulfilled* cache entry; a `rejected` entry still lets
//     each new mount re-run the thunk. We hold the last error result for a
//     few seconds and replay it to subsequent callers without going to the
//     network.
//
// Auth failures (401 / "invalid token") and ordinary 4xx responses are NOT
// cached so withReauth can still refresh-and-retry, and so a user fixing
// their input gets a real round trip.

const DEFAULT_TTL_MS = 5000;

type AnyBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
type AwaitedResult = Awaited<ReturnType<AnyBaseQuery>>;

function requestKey(args: string | FetchArgs): string {
  if (typeof args === "string") return `GET ${args}`;
  const method = (args.method ?? "GET").toUpperCase();
  const params = args.params ? JSON.stringify(args.params) : "";
  return `${method} ${args.url}${params ? `?${params}` : ""}`;
}

function isInfraError(err: FetchBaseQueryError): boolean {
  const status = err.status;
  if (status === "FETCH_ERROR") return true;
  if (status === "TIMEOUT_ERROR") return true;
  if (status === "PARSING_ERROR") return true;
  if (typeof status === "number" && status >= 500) return true;
  return false;
}

export function withErrorWindow(
  underlying: AnyBaseQuery,
  ttlMs: number = DEFAULT_TTL_MS
): AnyBaseQuery {
  const errorCache = new Map<string, { until: number; result: AwaitedResult }>();
  const inFlight = new Map<string, Promise<AwaitedResult>>();

  return async (args, api, extraOptions) => {
    const key = requestKey(args);
    const now = Date.now();

    const cached = errorCache.get(key);
    if (cached) {
      if (cached.until > now) return cached.result;
      errorCache.delete(key);
    }

    const pending = inFlight.get(key);
    if (pending) return pending;

    const promise = (async (): Promise<AwaitedResult> => {
      const result = await underlying(args, api, extraOptions);

      if (result.error && isInfraError(result.error)) {
        errorCache.set(key, { until: Date.now() + ttlMs, result });
      } else if (!result.error) {
        // Success on this URL clears any prior infra-error window so the next
        // failure starts a fresh cooldown instead of inheriting an old one.
        errorCache.delete(key);
      }

      return result;
    })().finally(() => {
      inFlight.delete(key);
    });

    inFlight.set(key, promise);
    return promise;
  };
}

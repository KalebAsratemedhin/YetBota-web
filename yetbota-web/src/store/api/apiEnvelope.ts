export type ApiCode = string;

export interface ApiEnvelope<TData> {
  code: ApiCode;
  success: boolean;
  message: string;
  data: TData;
}

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.code === "string" && typeof v.success === "boolean" && typeof v.message === "string" && "data" in v;
}

export function envelopeHttpStatus(code: string): number {
  // REST_API.md: toddler errors use 4 digits where first 3 digits map to HTTP status.
  if (/^\d{4}$/.test(code)) return Number(code.slice(0, 3));
  return 500;
}

export function unwrapEnvelope<T>(value: unknown): { data?: T; error?: { status: number; data: unknown } } {
  if (!isApiEnvelope(value)) {
    return { error: { status: 500, data: { message: "Invalid response from server", raw: value } } };
  }

  if (!value.success) {
    return {
      error: {
        status: envelopeHttpStatus(value.code),
        data: value,
      },
    };
  }

  return { data: value.data as T };
}


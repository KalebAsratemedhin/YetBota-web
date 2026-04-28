export type ApiCode = string;

type EnvelopeV1<TData> = {
  success: boolean;
  message?: string;
  data?: TData;
};

type EnvelopeLegacy<TData> = {
  code: ApiCode;
  success: boolean;
  message: string;
  data: TData;
};

export type ApiEnvelope<TData> = EnvelopeV1<TData> | EnvelopeLegacy<TData>;

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.success === "boolean") return true;
  return typeof v.code === "string" && typeof v.success === "boolean";
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
        status: "code" in value && typeof value.code === "string" ? envelopeHttpStatus(value.code) : 400,
        data: value,
      },
    };
  }

  return { data: ("data" in value ? (value.data as T) : undefined) as T };
}


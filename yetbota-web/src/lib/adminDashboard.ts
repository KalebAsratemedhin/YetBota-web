// Presentation helpers for the admin dashboard — turn API payloads into the
// tones (see AdminUI), SVG sparkline geometry and labels the cards render.
import type { Tone } from "@/components/admin/AdminUI";
import type { AuditActionType, TrendDirection } from "@/types/admin";

/** KPI change indicator → accent tone (up = good, down = bad, flat = neutral). */
export function trendTone(direction?: TrendDirection): Tone {
  if (direction === "up") return "brand";
  if (direction === "down") return "red";
  return "slate";
}

/** Signed percentage label (e.g. `+12%`, `-5%`), or undefined to hide it. */
export function formatChangePct(changePct?: number): string | undefined {
  if (changePct === undefined || changePct === null) return undefined;
  const sign = changePct > 0 ? "+" : "";
  return `${sign}${changePct}%`;
}

/**
 * Build `line` and `area` SVG path strings for a sparkline from a series of
 * values, scaled into a `width`×`height` viewBox (y inverted). Handles any
 * point count (7d/30d/90d) and degenerate (0–1 point, flat) series.
 */
export function buildSparklinePaths(
  values: number[],
  width = 400,
  height = 100
): { line: string; area: string } {
  if (values.length === 0) return { line: "", area: "" };

  const pad = 8; // keep the stroke off the top/bottom edges
  if (values.length === 1) {
    const y = (height / 2).toFixed(2);
    const line = `M0,${y} L${width},${y}`;
    return { line, area: `${line} V${height} H0 Z` };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const usable = height - pad * 2;
  const stepX = width / (values.length - 1);

  const pts = values.map((v, i) => ({
    x: i * stepX,
    y: pad + (1 - (v - min) / span) * usable,
  }));

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  const area = `${line} L${last.x.toFixed(2)},${height} L0,${height} Z`;
  return { line, area };
}

/** Short absolute timestamp for the activity feed (e.g. "May 25, 08:30"). */
export function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const AUDIT_ACTION_META: Record<AuditActionType, { label: string; tone: Tone }> = {
  DELETE: { label: "Delete", tone: "red" },
  BAN: { label: "Ban", tone: "orange" },
  DISMISS: { label: "Dismiss", tone: "slate" },
  UNHIDE: { label: "Unhide", tone: "brand" },
};

/** First two initials of an actor's display name, for the avatar chip. */
export function actorInitials(display: string): string {
  const parts = display.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

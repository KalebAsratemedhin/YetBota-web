"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ tones */
// Semantic accent tones from the mockup, remapped to work in both themes.
// Soft = low-opacity fill + readable text; the brand tone reuses the app token.
export type Tone = "brand" | "red" | "orange" | "blue" | "purple" | "slate";

export const TONE_SOFT: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  slate: "bg-fg-faint/10 text-fg-muted",
};

export const TONE_DOT: Record<Tone, string> = {
  brand: "bg-brand",
  red: "bg-red-500",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  slate: "bg-fg-faint",
};

/* ------------------------------------------------------------- page header */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-fg text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-fg-muted text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

/* -------------------------------------------------------------- stat card */
export function StatCard({
  label,
  value,
  delta,
  deltaTone = "brand",
  icon: Icon,
  iconTone = "brand",
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: Tone;
  icon?: LucideIcon;
  iconTone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-fg-muted text-sm font-medium">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              TONE_SOFT[iconTone]
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-fg text-2xl font-bold sm:text-3xl">{value}</h3>
        {delta && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-bold",
              TONE_SOFT[deltaTone]
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ section card */
export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm",
        className
      )}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-6 py-5">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-brand" />}
            <div>
              {title && <h2 className="text-fg text-lg font-bold">{title}</h2>}
              {subtitle && <p className="text-fg-muted text-sm">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------- tone pill */
export function TonePill({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        TONE_SOFT[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- pagination */
export function AdminPagination({
  page,
  totalPages,
  onPageChange,
  label,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  // Render up to 3 page buttons centered on the current page.
  const start = Math.max(1, Math.min(page - 1, Math.max(1, totalPages - 2)));
  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i).filter(
    (p) => p <= totalPages
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-6 py-4">
      <p className="text-fg-muted text-sm">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-fg-muted transition-colors hover:bg-overlay disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "h-8 min-w-8 rounded-lg px-3 text-sm font-semibold transition-colors",
              p === page
                ? "bg-brand text-white"
                : "border border-border-subtle text-fg-muted hover:bg-overlay"
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-fg-muted transition-colors hover:bg-overlay disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

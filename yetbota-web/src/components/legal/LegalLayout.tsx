import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  /** Short lead paragraph shown under the title. */
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, intro, updated, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-fg text-3xl sm:text-4xl font-bold tracking-tight mb-3">{title}</h1>
        {updated && <p className="text-fg-faint text-xs uppercase tracking-widest mb-6">Last updated: {updated}</p>}
        {intro && <p className="text-fg-muted text-base leading-relaxed mb-10">{intro}</p>}

        <div className="space-y-8">{children}</div>
      </div>
    </main>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-fg text-lg sm:text-xl font-semibold mb-2.5">{heading}</h2>
      <div className="text-fg-muted text-sm sm:text-base leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

"use client";

import { Tag } from "lucide-react";

export default function QaDetailQuestionSection({
  title,
  body,
  tags,
}: {
  title: string;
  body: string;
  tags: string[];
}) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-fg">{title}</h2>
      {body ? (
        <p className="text-fg-muted text-lg leading-relaxed mb-6 whitespace-pre-wrap">{body}</p>
      ) : null}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-2 px-4 py-2 bg-overlay hover:bg-overlay-strong rounded-full transition-colors border border-border-subtle text-fg"
            >
              <Tag className="w-3.5 h-3.5 text-brand" />
              <span className="text-sm font-medium">{t}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

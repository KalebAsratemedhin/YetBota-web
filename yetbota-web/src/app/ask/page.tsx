"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AskQuestionTopNav from "@/components/ask/AskQuestionTopNav";
import AskGuidelinesCard from "@/components/ask/AskGuidelinesCard";
import AskQuestionForm from "@/components/ask/AskQuestionForm";
import AskTipsRail from "@/components/ask/AskTipsRail";
import AskMobileBottomNav from "@/components/ask/AskMobileBottomNav";
import CreatePostLocationModal from "@/components/create/CreatePostLocationModal";
import { useCreatePostMutation, useGetPostByIdQuery } from "@/store/api/contentApi";
import { useToast } from "@/hooks/use-toast";
import RedirectAdminsToPortal from "@/components/admin/RedirectAdminsToPortal";

const DEFAULT_ASK_TAGS = ["Recommendations", "LocalEvents", "Safety", "General"];
// Holds the in-progress question while the user steps over to /discovery to pick
// a post to attach, so nothing typed is lost on the round trip.
const ASK_DRAFT_KEY = "yetbota.askDraft";

interface AskDraft {
  question: string;
  tags: string[];
  tagOptions: string[];
  location: { latitude: number; longitude: number } | null;
  attachedPostId: string | null;
}
const ASK_TIPS = [
  "Be specific about the location if you're looking for local recommendations.",
  "Use relevant tags so the right people see your question.",
  "Avoid posting private information like phone numbers.",
];

function deriveTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const firstLine =
    trimmed.split(/\r?\n/).find((l) => l.trim().length > 0)?.trim() ?? trimmed;
  if (firstLine.length <= 100) return firstLine;
  return firstLine.slice(0, 97).trimEnd() + "...";
}

export default function AskQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createPost, { isLoading }] = useCreatePostMutation();

  const [question, setQuestion] = useState("");
  const [tagOptions, setTagOptions] = useState<string[]>(DEFAULT_ASK_TAGS);
  const [tags, setTags] = useState<string[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [attachedPostId, setAttachedPostId] = useState<string | null>(null);

  // Resolve the attached post for the minimized preview.
  const { data: attachedRes, isFetching: attachedFetching } = useGetPostByIdQuery(
    { id: attachedPostId ?? "", resolution: "WEB" },
    { skip: !attachedPostId }
  );
  const attachedPost = attachedRes?.post ?? null;

  // On mount, restore any draft saved before navigating to /discovery and pick
  // up a post the user selected there (returned as ?attached_post_id=<id>).
  // Reads run client-side only; this hydrates local state from sessionStorage
  // and the URL exactly once.
  useEffect(() => {
    let restored: Partial<AskDraft> | null = null;
    let picked: string | null = null;
    try {
      const raw = window.sessionStorage.getItem(ASK_DRAFT_KEY);
      if (raw) {
        restored = JSON.parse(raw) as Partial<AskDraft>;
        window.sessionStorage.removeItem(ASK_DRAFT_KEY);
      }
      picked = new URLSearchParams(window.location.search).get("attached_post_id");
      if (picked) {
        // Strip the query so a refresh doesn't re-apply it.
        window.history.replaceState(null, "", "/ask");
      }
    } catch {
      // ignore malformed drafts / unavailable storage
    }

    // One-time hydration of local state from an external source (sessionStorage
    // draft + URL param) on mount — the "sync from an external system" case.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (restored) {
      if (typeof restored.question === "string") setQuestion(restored.question);
      if (Array.isArray(restored.tags)) setTags(restored.tags);
      if (Array.isArray(restored.tagOptions)) setTagOptions(restored.tagOptions);
      if (restored.location) setLocation(restored.location);
    }
    // A freshly-picked post (from the URL) wins over the saved draft's value.
    const nextAttached = picked ?? (typeof restored?.attachedPostId === "string" ? restored.attachedPostId : null);
    if (nextAttached) setAttachedPostId(nextAttached);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const tips = useMemo(() => ASK_TIPS, []);
  const canPost = question.trim().length > 0 && !isLoading;

  function startSelectPost() {
    try {
      const draft: AskDraft = { question, tags, tagOptions, location, attachedPostId };
      window.sessionStorage.setItem(ASK_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // sessionStorage unavailable — proceed anyway; only the draft is lost.
    }
    router.push("/discovery?select=1&returnTo=%2Fask");
  }

  function handleToggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleAddTag(raw: string) {
    const candidate = raw.trim();
    if (!candidate) return;
    const existing = tagOptions.find((t) => t.toLowerCase() === candidate.toLowerCase());
    const canonical = existing ?? candidate;
    if (!existing) setTagOptions((prev) => [...prev, canonical]);
    setTags((prev) => (prev.includes(canonical) ? prev : [...prev, canonical]));
  }

  async function handlePost() {
    if (!canPost) {
      toast({
        title: "Missing question",
        description: "Please type your question before posting.",
        variant: "destructive",
      });
      return;
    }
    try {
      const title = deriveTitle(question);
      const description = question.trim();
      const res = await createPost({
        title,
        description,
        tags,
        is_question: true,
        ...(location ? { location } : {}),
        ...(attachedPostId ? { attached_post_id: attachedPostId } : {}),
      }).unwrap();

      try {
        window.sessionStorage.removeItem(ASK_DRAFT_KEY);
      } catch {
        // ignore
      }
      toast({ title: "Posted", description: "Your question was published." });
      router.push(`/qa/${encodeURIComponent(res.post.id)}`);
    } catch {
      toast({
        title: "Failed to post",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }

  const locationSubtitle = location
    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    : "Help people nearby find your post";

  return (
    <RedirectAdminsToPortal authedSurface>
    <div className="bg-bg text-fg min-h-screen transition-colors duration-200">
      <AskQuestionTopNav title="Ask a Question" onClose={() => router.back()} />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <AskGuidelinesCard />
            <AskQuestionForm
              question={question}
              onChangeQuestion={setQuestion}
              tags={tags}
              tagOptions={tagOptions}
              onToggleTag={handleToggleTag}
              onAddTag={handleAddTag}
              locationSubtitle={locationSubtitle}
              onClickLocation={() => setLocationOpen(true)}
              onClickSelectPost={startSelectPost}
              attachedPost={attachedPost}
              attachedPostLoading={Boolean(attachedPostId) && attachedFetching && !attachedPost}
              onRemovePost={() => setAttachedPostId(null)}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <AskTipsRail tips={tips} />
            
          </div>
        </div>
      </main>

      <div className="h-28" />

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg/80 backdrop-blur-md border-t border-border-subtle">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
          <button
            type="button"
            onClick={handlePost}
            disabled={!canPost}
            className="px-7 h-12 bg-brand text-black font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all active:scale-95 disabled:active:scale-100"
          >
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      <AskMobileBottomNav />

      <CreatePostLocationModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onConfirm={() => setLocationOpen(false)}
        value={location ?? { latitude: 9.03, longitude: 38.74 }}
        onChange={setLocation}
      />
    </div>
    </RedirectAdminsToPortal>
  );
}

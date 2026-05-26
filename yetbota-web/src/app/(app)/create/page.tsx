"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CreatePostHeader from "@/components/create/CreatePostHeader";
import CreatePostPhotoDropzone from "@/components/create/CreatePostPhotoDropzone";
import CreatePostForm from "@/components/create/CreatePostForm";
import CreatePostLocationRow from "@/components/create/CreatePostLocationRow";
import CreatePostTags from "@/components/create/CreatePostTags";
import CreatePostLocationModal from "@/components/create/CreatePostLocationModal";
import { useCreatePostMutation } from "@/store/api/contentApi";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/store";
import RequireAuth from "@/components/auth/RequireAuth";
import { ScrollArea } from "@/components/ui/scroll-area";

const DEFAULT_POPULAR_TAGS = ["History", "CoffeeCulture", "Lalibela", "Nature"];

export default function CreatePostPage() {
  return (
    <RequireAuth>
      <CreatePostPageContent />
    </RequireAuth>
  );
}

function CreatePostPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [createPost, { isLoading }] = useCreatePostMutation();

  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 9.03,
    longitude: 38.74,
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [tagOptions, setTagOptions] = useState<string[]>(DEFAULT_POPULAR_TAGS);
  const [selectedTags, setSelectedTags] = useState<string[]>(["History"]);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  function handleAddTag(raw: string) {
    const candidate = raw.trim();
    if (!candidate) return;
    const existing = tagOptions.find((t) => t.toLowerCase() === candidate.toLowerCase());
    const canonical = existing ?? candidate;
    if (!existing) setTagOptions((prev) => [...prev, canonical]);
    setSelectedTags((prev) => (prev.includes(canonical) ? prev : [...prev, canonical]));
  }

  const canPost = title.trim().length > 0 && description.trim().length > 0 && !isLoading;

  async function handlePost() {
    if (process.env.NODE_ENV !== "production") {
      console.log("[create] auth snapshot", {
        reduxAccessToken: store.getState().auth.accessToken,
        localStorageHasAuth:
          typeof window !== "undefined" ? Boolean(window.localStorage.getItem("yetbota.localAuth")) : null,
      });
    }

    if (!canPost) {
      toast({
        title: "Missing info",
        description: "Please add a title and description before posting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const trimmedAddress = address.trim();
      const res = await createPost({
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags,
        is_question: false,
        photos: photoBase64 ? [{ photo_base64: photoBase64, position: 0 }] : [],
        location,
        ...(trimmedAddress.length > 0 ? { address: trimmedAddress } : {}),
      }).unwrap();

      toast({ title: "Posted", description: "Your post was created successfully." });
      const detailsHref = res.post.is_question
        ? `/qa/${encodeURIComponent(res.post.id)}`
        : `/locations/${encodeURIComponent(res.post.id)}`;
      router.push(detailsHref);
    } catch {
      toast({
        title: "Failed to post",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="h-full flex flex-col bg-bg text-fg overflow-hidden">
      <CreatePostHeader title="Create Post" onClose={() => router.back()} />

      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 py-8 space-y-7">
          <section>
            <CreatePostPhotoDropzone onPhotoBase64Change={setPhotoBase64} />
          </section>

          <section className="space-y-6">
            <CreatePostForm
              title={title}
              description={description}
              address={address}
              onChangeTitle={setTitle}
              onChangeDescription={setDescription}
              onChangeAddress={setAddress}
            />
          </section>

          <section>
            <CreatePostLocationRow
              onClick={() => setLocationOpen(true)}
              subtitle={`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            />
          </section>

          <section>
            <CreatePostTags
              tags={tagOptions}
              selected={selectedTags}
              onToggle={(t) => {
                setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
              }}
              onAddTag={handleAddTag}
            />
          </section>
        </div>
      </ScrollArea>

      <div className="shrink-0 bg-white/80 dark:bg-bg/80 backdrop-blur-md border-t border-slate-200 dark:border-border-subtle">
        <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 py-4 flex justify-end">
          <button
            type="button"
            onClick={handlePost}
            disabled={!canPost}
            className="px-7 h-12 bg-brand text-black font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      <CreatePostLocationModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onConfirm={() => setLocationOpen(false)}
        value={location}
        onChange={setLocation}
      />
    </div>
  );
}


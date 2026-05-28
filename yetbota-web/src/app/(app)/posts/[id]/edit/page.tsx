"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import CreatePostHeader from "@/components/create/CreatePostHeader";
import CreatePostForm from "@/components/create/CreatePostForm";
import CreatePostLocationModal from "@/components/create/CreatePostLocationModal";
import CreatePostLocationRow from "@/components/create/CreatePostLocationRow";
import CreatePostPhotoDropzone from "@/components/create/CreatePostPhotoDropzone";
import CreatePostTags from "@/components/create/CreatePostTags";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetMeQuery } from "@/store/api/authApi";
import { useGetPostByIdQuery, useUpdatePostByIdMutation } from "@/store/api/contentApi";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { resolveApiUrl } from "@/lib/resolveApiUrl";
import type { Post } from "@/types/content";

const DEFAULT_POPULAR_TAGS = ["History", "CoffeeCulture", "Lalibela", "Nature"];

export default function EditPostPage() {
  return (
    <RequireAuth>
      <EditPostShell />
    </RequireAuth>
  );
}

function EditPostShell() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: postRes, isLoading, isError } = useGetPostByIdQuery(
    { id, resolution: "WEB" },
    { skip: !id }
  );
  const { data: me } = useGetMeQuery();
  const post = postRes?.post;
  const meId = me?.user?.id;
  const isAuthor = Boolean(post && meId && post.user_id === meId);

  function goBackToPost() {
    if (!post) {
      router.back();
      return;
    }
    router.push(post.is_question ? `/qa/${post.id}` : `/locations/${post.id}`);
  }

  return (
    <div className="h-full flex flex-col bg-bg text-fg overflow-hidden">
      <CreatePostHeader title="Edit Post" onClose={goBackToPost} />

      {isLoading ? (
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 py-8">
            <p className="text-fg-muted text-sm">Loading…</p>
          </div>
        </ScrollArea>
      ) : isError || !post ? (
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 py-8">
            <p className="text-fg-muted text-sm">Couldn&apos;t load this post.</p>
          </div>
        </ScrollArea>
      ) : !isAuthor ? (
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 py-8">
            <p className="text-fg-muted text-sm">You don&apos;t have permission to edit this post.</p>
          </div>
        </ScrollArea>
      ) : (
        // Keying by post.id ensures the form's internal state is initialized
        // fresh from the loaded post — no useEffect-based hydration needed.
        <EditPostForm key={post.id} post={post} onDone={goBackToPost} />
      )}
    </div>
  );
}

function EditPostForm({ post, onDone }: { post: Post; onDone: () => void }) {
  const { toast } = useToast();
  const [updatePost, { isLoading: saving }] = useUpdatePostByIdMutation();

  const [title, setTitle] = useState(post.title ?? "");
  const [description, setDescription] = useState(post.description ?? "");
  const [address, setAddress] = useState(post.address ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post.tags ?? []);
  const [tagOptions, setTagOptions] = useState<string[]>(() =>
    Array.from(new Set([...DEFAULT_POPULAR_TAGS, ...(post.tags ?? [])]))
  );
  // null = no new photo picked → omit upsert_photos so the existing one is
  // untouched (per the photo upsert semantics in docs/post-update.md).
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);

  // Coordinates default to the post's stored location, falling back to (0, 0)
  // when the post had none. Rule #2 from docs/post-update.md: we must always
  // send `location` on PATCH — omitting it would reset the post to (0, 0).
  const [location, setLocation] = useState(() =>
    post.location ?? { latitude: 0, longitude: 0 }
  );
  const [locationOpen, setLocationOpen] = useState(false);

  // Replace the existing cover photo at its position when the user picks a new
  // file. If there's no existing photo, fall back to position 0.
  const existingFirstPhoto = post.photos?.[0];
  const photoTargetPosition = existingFirstPhoto?.position ?? 0;
  const existingPhotoUrl = existingFirstPhoto?.photo_url
    ? resolveApiUrl(existingFirstPhoto.photo_url)
    : null;

  const canSave = !saving && title.trim().length > 0 && description.trim().length > 0;

  function handleAddTag(raw: string) {
    const candidate = raw.trim();
    if (!candidate) return;
    const existing = tagOptions.find((t) => t.toLowerCase() === candidate.toLowerCase());
    const canonical = existing ?? candidate;
    if (!existing) setTagOptions((prev) => [...prev, canonical]);
    setSelectedTags((prev) => (prev.includes(canonical) ? prev : [...prev, canonical]));
  }

  async function handleSave() {
    if (!canSave) return;
    try {
      // Per docs/post-update.md: PATCH overwrites every field. Resend the full
      // payload, including `location` (omitting it resets coordinates to 0,0)
      // and `attached_post_id` (preserved from the fetched post).
      await updatePost({
        id: post.id,
        body: {
          title: title.trim(),
          description: description.trim(),
          tags: selectedTags,
          address: address.trim(),
          attached_post_id: post.attached_post_id ?? null,
          location,
          ...(newPhotoBase64
            ? { upsert_photos: [{ photo_base64: newPhotoBase64, position: photoTargetPosition }] }
            : {}),
        },
      }).unwrap();
      toast({ title: "Updated", description: "Your post was saved." });
      onDone();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't save post",
        description: getAuthErrorMessage(err),
      });
    }
  }

  return (
    <>
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 py-8 space-y-7">
          <section>
            <CreatePostPhotoDropzone
              initialPreviewUrl={existingPhotoUrl}
              onPhotoBase64Change={setNewPhotoBase64}
            />
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
              onToggle={(t) =>
                setSelectedTags((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                )
              }
              onAddTag={handleAddTag}
            />
          </section>
        </div>
      </ScrollArea>

      <CreatePostLocationModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onConfirm={() => setLocationOpen(false)}
        value={location}
        onChange={setLocation}
      />

      <div className="shrink-0 bg-white/80 dark:bg-bg/80 backdrop-blur-md border-t border-slate-200 dark:border-border-subtle">
        <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 py-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="px-7 h-12 bg-brand text-black font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}

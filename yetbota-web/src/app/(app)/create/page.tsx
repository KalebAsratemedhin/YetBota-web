"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CreatePostHeader from "@/components/create/CreatePostHeader";
import CreatePostPhotoDropzone from "@/components/create/CreatePostPhotoDropzone";
import CreatePostForm from "@/components/create/CreatePostForm";
import CreatePostLocationRow from "@/components/create/CreatePostLocationRow";
import CreatePostTags from "@/components/create/CreatePostTags";
import CreatePostLocationModal from "@/components/create/CreatePostLocationModal";
import { useCreatePostMutation } from "@/store/api/contentApi";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/store";
import { rememberMyPostId } from "@/lib/myPostsStorage";

const POPULAR_TAGS = ["#History", "#CoffeeCulture", "#Lalibela", "#Nature"];

export default function CreatePostPage() {
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
  const [selectedTags, setSelectedTags] = useState<string[]>(["#History"]);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const tags = useMemo(() => POPULAR_TAGS, []);

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
      const res = await createPost({
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags,
        is_question: false,
        photos: photoBase64 ? [{ photo_base64: photoBase64, position: 0 }] : [],
        location,
      }).unwrap();

      rememberMyPostId(res.post.id);
      toast({ title: "Posted", description: "Your post was created successfully." });
      router.push(`/qa/${res.post.id}`);
    } catch {
      toast({
        title: "Failed to post",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
      <CreatePostHeader title="Create Post" onClose={() => router.back()} onPost={handlePost} />

      <div className="max-w-4xl mx-auto w-full px-8 py-12 space-y-10">
        <section>
          <CreatePostPhotoDropzone onPhotoBase64Change={setPhotoBase64} />
        </section>

        <section className="space-y-6">
          <CreatePostForm
            title={title}
            description={description}
            onChangeTitle={setTitle}
            onChangeDescription={setDescription}
          />
        </section>

        <section>
          <CreatePostLocationRow
            onClick={() => setLocationOpen(true)}
            subtitle={`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
          />
        </section>

        <section>
          <CreatePostTags tags={tags} selected={selectedTags} onToggle={(t) => {
            setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
          }} />
        </section>
      </div>

      <div className="h-28" />

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-t border-slate-200 dark:border-[#262626]">
        <div className="max-w-4xl mx-auto w-full px-6 sm:px-8 py-4 flex justify-end">
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


"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CreatePostHeader from "@/components/create/CreatePostHeader";
import CreatePostPhotoDropzone from "@/components/create/CreatePostPhotoDropzone";
import CreatePostForm from "@/components/create/CreatePostForm";
import CreatePostLocationRow from "@/components/create/CreatePostLocationRow";
import CreatePostTags from "@/components/create/CreatePostTags";
import CreatePostLocationModal from "@/components/create/CreatePostLocationModal";

const POPULAR_TAGS = ["#History", "#CoffeeCulture", "#Lalibela", "#Nature"];

export default function CreatePostPage() {
  const router = useRouter();
  const [locationOpen, setLocationOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["#History"]);

  const tags = useMemo(() => POPULAR_TAGS, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
      <CreatePostHeader title="Create Post" onClose={() => router.back()} onPost={() => {}} />

      <div className="max-w-4xl mx-auto w-full px-8 py-12 space-y-10">
        <section>
          <CreatePostPhotoDropzone />
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
          <CreatePostLocationRow onClick={() => setLocationOpen(true)} />
        </section>

        <section>
          <CreatePostTags tags={tags} selected={selectedTags} onToggle={(t) => {
            setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
          }} />
        </section>
      </div>

      <div className="h-20" />

      <CreatePostLocationModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onConfirm={() => setLocationOpen(false)}
      />
    </div>
  );
}


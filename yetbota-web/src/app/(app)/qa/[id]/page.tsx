"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QaDetailHeader from "@/components/qa/QaDetailHeader";
import QaDetailHero from "@/components/qa/QaDetailHero";
import QaDetailQuestionSection from "@/components/qa/QaDetailQuestionSection";
import QaAnswerList from "@/components/qa/QaAnswerList";
import QaAnswerComposer from "@/components/qa/QaAnswerComposer";
import { getQaDetailQuestion } from "@/lib/qaDetailMockData";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function QaDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "unknown";

  const data = useMemo(() => getQaDetailQuestion(id), [id]);
  const [sort, setSort] = useState(data.sortLabel);

  return (
    <div className="h-screen overflow-hidden bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
      <QaDetailHeader title="Question Details" onBack={() => router.back()} />

      <ScrollArea className="h-[calc(100vh-64px)]">
        <main className="w-full px-8 lg:px-32 py-8 pb-32">
          <QaDetailHero
            imageUrl={data.heroImageUrl}
            badgeLabel={data.badgeLabel}
            askedLabel={data.askedLabel}
          />

          <QaDetailQuestionSection title={data.title} body={data.body} tagLabel={data.tagLabel} />

          <QaAnswerList
            answersCount={data.answersCount}
            sortLabel={sort}
            onChangeSort={setSort}
            answers={data.answers}
          />
        </main>
      </ScrollArea>

      <QaAnswerComposer />
    </div>
  );
}


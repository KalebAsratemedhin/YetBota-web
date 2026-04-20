"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import LocationDetailsHeader from "@/components/locations/LocationDetailsHeader";
import LocationHero from "@/components/locations/LocationHero";
import LocationPost from "@/components/locations/LocationPost";
import LocationCommunityQa from "@/components/locations/LocationCommunityQa";
import SimilarPlacesGrid from "@/components/locations/SimilarPlacesGrid";
import LocationRightRail from "@/components/locations/LocationRightRail";
import MobileBottomNav from "@/components/locations/MobileBottomNav";
import { getLocationDetails } from "@/lib/locationDetailsMockData";

export default function LocationDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "unknown";
  const data = getLocationDetails(id);
  const [commentsOpen, setCommentsOpen] = useState(true);

  return (
    <div className="bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex max-w-[1440px] mx-auto min-h-screen relative">
        <main className="flex-1 lg:max-w-4xl border-r border-slate-200 dark:border-[#262626] min-h-screen">
          <LocationDetailsHeader />
          <LocationHero title={data.title} imageUrl={data.heroImageUrl} />
          <LocationPost
            author={data.author}
            title={data.title}
            body={data.body}
            tags={data.tags}
            likes={data.likes}
            comments={data.comments}
            commentsOpen={commentsOpen}
            onToggleComments={() => setCommentsOpen((v) => !v)}
          />
          {commentsOpen ? (
            <div id="comments">
              <LocationCommunityQa
                currentUserAvatarUrl={data.currentUserAvatarUrl}
                items={data.qa}
              />
            </div>
          ) : null}
          <SimilarPlacesGrid places={data.similarPlaces} />
        </main>

        <LocationRightRail
          mapImageUrl={data.rightRail.mapImageUrl}
          addressLine={data.rightRail.addressLine}
          guides={data.rightRail.guides}
        />
      </div>

      <MobileBottomNav />
    </div>
  );
}


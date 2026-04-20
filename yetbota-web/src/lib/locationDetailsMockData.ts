import type { LocationQaItem } from "@/components/locations/LocationCommunityQa";
import type { LocationPostAuthor } from "@/components/locations/LocationPost";
import type { SimilarPlace } from "@/components/locations/SimilarPlacesGrid";
import type { PopularGuide } from "@/components/locations/LocationRightRail";

export interface LocationDetails {
  id: string;
  heroImageUrl: string;
  title: string;
  body: string;
  tags: string[];
  likes: number;
  comments: number;
  author: LocationPostAuthor;
  currentUserAvatarUrl: string;
  qa: LocationQaItem[];
  similarPlaces: SimilarPlace[];
  rightRail: {
    mapImageUrl: string;
    addressLine: string;
    guides: PopularGuide[];
  };
}

const base: Omit<LocationDetails, "id"> = {
  heroImageUrl: "/images/profile/rock-hewn.webp",
  title: "The Hidden Sanctuary Garden",
  body:
    "Just found this incredible spot tucked away behind the old library. It's a perfect place for community QA sessions or just escaping the urban noise. The flowers are in full bloom right now.",
  tags: ["#Nature", "#Ethiopia", "#QuietSpots"],
  likes: 248,
  comments: 14,
  author: {
    name: "Alex Rivers",
    avatarUrl: "/images/profile/tomoca-coffee-on-cameroon.webp",
    badge: "Top Guide",
    meta: "2 hours ago • Addis Ababa",
  },
  currentUserAvatarUrl: "/images/profile/national-museum-of-ethiopia-addis-ababa-ethiopia-december-1-2017.webp",
  qa: [
    {
      id: "q1",
      authorName: "Sarah Jenkins",
      authorBadge: "Explorer",
      authorAvatarUrl: "/images/profile/blue-nile-falls.webp",
      text: "Is there any public wifi available near those benches?",
      upvotes: 12,
      timeAgo: "1h ago",
      replies: [
        {
          id: "r1",
          authorName: "Marcus Chen",
          authorBadge: "Local Expert",
          authorAvatarUrl: "/images/places/bole.jpg",
          text: "Unfortunately no, signal is a bit weak there too. Better to download offline maps.",
          upvotes: 4,
          timeAgo: "45m ago",
        },
      ],
    },
    {
      id: "q2",
      authorName: "Liya S.",
      authorBadge: "Explorer",
      authorAvatarUrl: "/images/places/yeshi.jpg",
      text: "Is it safe to visit alone in the evening? Any lighting around the entrance?",
      upvotes: 8,
      timeAgo: "2h ago",
    },
    {
      id: "q3",
      authorName: "Dawit Kebede",
      authorBadge: "Top Guide",
      authorAvatarUrl: "/images/profile/rock-hewn.webp",
      text: "Best time for photos is early morning—soft light and fewer people. Bring water; there’s limited shade.",
      upvotes: 21,
      timeAgo: "3h ago",
      replies: [
        {
          id: "r3",
          authorName: "Alex Rivers",
          authorBadge: "Top Guide",
          authorAvatarUrl: "/images/profile/tomoca-coffee-on-cameroon.webp",
          text: "Agreed. Also weekdays are calmer than weekends.",
          upvotes: 6,
          timeAgo: "2h ago",
        },
      ],
    },
  ],
  similarPlaces: [
    { id: "s1", name: "Entoto Park", area: "Addis Ababa", rating: 4.8, imageUrl: "/images/places/shola.jpg" },
    { id: "s2", name: "Unity Park", area: "Arat Kilo", rating: 4.5, imageUrl: "/images/places/unity.jpg" },
    { id: "s3", name: "Sheger Park", area: "Piassa", rating: 4.2, imageUrl: "/images/places/friendship.jpg" },
  ],
  rightRail: {
    mapImageUrl: "/images/places/mercato.jpg",
    addressLine: "Behind Central Library, Addis Ababa",
    guides: [
      { id: "g1", name: "Jordan Smith", answersLabel: "1.2k Answers", avatarUrl: "/images/profile/rock-hewn.webp" },
      { id: "g2", name: "Amara K.", answersLabel: "842 Answers", avatarUrl: "/images/profile/blue-nile-falls.webp" },
    ],
  },
};

const DETAILS_BY_ID: Record<string, LocationDetails> = {
  f1: { id: "f1", ...base, heroImageUrl: "/images/profile/rock-hewn.webp" },
  f2: { id: "f2", ...base, heroImageUrl: "/images/places/unity.jpg", title: "Unity Park Gardens" },
};

export function getLocationDetails(id: string): LocationDetails {
  return DETAILS_BY_ID[id] ?? { id, ...base };
}


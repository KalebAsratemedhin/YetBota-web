export type QaCategory = "All" | "Housing" | "Safety" | "Nightlife" | "Transport" | "Dining";

export interface QaUser {
  name: string;
  handle: string;
  badge: string;
  avatarUrl: string;
}

export interface QaPost {
  id: string;
  user: QaUser;
  locationAndTime: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  comments: number;
  hasMapPreview?: boolean;
  mapImageUrl?: string;
}

export interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  icon: "coffee" | "storefront" | "museum" | "park";
}

export interface ContributorItem {
  id: string;
  name: string;
  badge: string;
  answers: number;
  avatarUrl: string;
  flair: "verified" | "trophy" | "star";
}

export const QA_CATEGORIES: QaCategory[] = [
  "All",
  "Housing",
  "Safety",
  "Nightlife",
  "Transport",
  "Dining",
];

export const QA_POSTS: QaPost[] = [
  {
    id: "p1",
    user: {
      name: "Sarah Jenkins",
      handle: "@sjenkins",
      badge: "Expert Guide",
      avatarUrl: "/images/profile/blue-nile-falls.webp",
    },
    locationAndTime: "Addis Ababa • 15m ago",
    title: "What's the best time to visit the Mercato to avoid the heaviest crowds?",
    body:
      "I want to take some street photography but I'm worried about the narrow lanes being too packed. Is early morning better or late afternoon?",
    tags: [],
    upvotes: 124,
    comments: 45,
    hasMapPreview: true,
    mapImageUrl: "/images/places/mercato.jpg",
  },
  {
    id: "p2",
    user: {
      name: "Marcus Chen",
      handle: "@mchen",
      badge: "Local Legend",
      avatarUrl: "/images/profile/tomoca-coffee-on-cameroon.webp",
    },
    locationAndTime: "Bole District • 2h ago",
    title: "Recommended spots for traditional music tonight?",
    body:
      "Looking for a place with authentic Azmari music near the city center. Any hidden gems I should check out?",
    tags: ["Nightlife", "Culture"],
    upvotes: 82,
    comments: 12,
  },
];

export const QA_TRENDING: TrendingItem[] = [
  { id: "t1", title: "Tomoca Coffee", subtitle: "Piazza • 1.2k mentions", icon: "coffee" },
  { id: "t2", title: "Addis Mercato", subtitle: "Open Air Market • 840 mentions", icon: "storefront" },
  { id: "t3", title: "National Museum", subtitle: "History • 562 mentions", icon: "museum" },
  { id: "t4", title: "Unity Park", subtitle: "Nature • 420 mentions", icon: "park" },
];

export const QA_CONTRIBUTORS: ContributorItem[] = [
  {
    id: "c1",
    name: "Dawit Kebede",
    badge: "TOP GUIDE",
    answers: 421,
    avatarUrl: "/images/profile/rock-hewn.webp",
    flair: "verified",
  },
  {
    id: "c2",
    name: "Hanna T.",
    badge: "LOCAL EXPLORER",
    answers: 289,
    avatarUrl: "/images/profile/national-museum-of-ethiopia-addis-ababa-ethiopia-december-1-2017.webp",
    flair: "trophy",
  },
  {
    id: "c3",
    name: "Samuel L.",
    badge: "RISING STAR",
    answers: 156,
    avatarUrl: "/images/profile/tomoca-coffee-on-cameroon.webp",
    flair: "star",
  },
];

export const QA_TRENDING_TAGS = ["#Nature", "#Events", "#SafeTravels", "#AddisAbaba"];


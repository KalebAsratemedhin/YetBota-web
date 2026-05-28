export type DiscoveryCategory = "Curated" | "Community";

export interface DiscoveryAuthor {
  name: string;
  avatarUrl: string;
  locationLabel: string;
  href?: string;
}

export interface DiscoveryFeedItem {
  id: string;
  author: DiscoveryAuthor;
  imageUrl: string;
  badgeLabel?: string;
  showOnMapLabel: string;
  // Target for the "Show on Map" button (e.g. `/map?lat=..&lon=..`). Omit to
  // hide the button when the post has no usable coordinates.
  mapHref?: string;
  body: string;
  tags: string[];
  likes: string;
  comments: string;
  liked?: boolean;
  bookmarked?: boolean;
}

export interface DiscoveryChip {
  id: string;
  label: string;
}

export interface DiscoveryQuickRow {
  id: string;
  title: string;
  subtitle: string;
  icon: "mapPin" | "trendingUp" | "sparkles";
}

export const DISCOVERY_FILTER_CHIPS: DiscoveryChip[] = [
  { id: "coffee", label: "Coffee Shops" },
  { id: "parks", label: "Local Parks" },
  { id: "museums", label: "Museums" },
  { id: "markets", label: "Markets" },
  { id: "food", label: "Food" },
];

export const DISCOVERY_FEED: DiscoveryFeedItem[] = [
  {
    id: "f1",
    author: {
      name: "Dawit Tekle",
      avatarUrl: "/images/profile/rock-hewn.webp",
      locationLabel: "LALIBELA, AMHARA",
    },
    imageUrl: "/images/profile/rock-hewn.webp",
    badgeLabel: "Highly Rated",
    showOnMapLabel: "Show on Map",
    likes: "4.8k",
    comments: "128",
    body:
      "The rock-hewn churches of Lalibela are truly a testament to faith and architecture. Breathtaking views during the morning prayers.",
    tags: ["#heritage", "#ethiopia", "#travel"],
  },
  {
    id: "f2",
    author: {
      name: "Selam Ayele",
      avatarUrl: "/images/places/unity.jpg",
      locationLabel: "UNITY PARK, ADDIS ABABA",
    },
    imageUrl: "/images/places/unity.jpg",
    showOnMapLabel: "Show on Map",
    likes: "2.1k",
    comments: "45",
    liked: true,
    bookmarked: true,
    body:
      "A wonderful afternoon at Unity Park. The mix of historical exhibits and beautiful gardens makes it a must-visit in Addis.",
    tags: ["#addisababa", "#unitypark"],
  },
];

export const DISCOVERY_QUICK_ROWS: DiscoveryQuickRow[] = [
  { id: "q1", title: "Nearby picks", subtitle: "Updated today", icon: "mapPin" },
  { id: "q2", title: "Trending spots", subtitle: "In Addis Ababa", icon: "trendingUp" },
  { id: "q3", title: "For you", subtitle: "Based on your activity", icon: "sparkles" },
];

export interface TopTraveler {
  id: string;
  name: string;
  subtitle: string;
  avatarUrl: string;
}

export const TOP_TRAVELERS: TopTraveler[] = [
  {
    id: "t1",
    name: "Kaleb Abebe",
    subtitle: "Explorer • 42 posts",
    avatarUrl: "/images/profile/tomoca-coffee-on-cameroon.webp",
  },
  {
    id: "t2",
    name: "Eleni Tsegaye",
    subtitle: "Guide • 118 posts",
    avatarUrl: "/images/profile/blue-nile-falls.webp",
  },
  {
    id: "t3",
    name: "Yonas Bekele",
    subtitle: "Adventurer • 89 posts",
    avatarUrl: "/images/profile/national-museum-of-ethiopia-addis-ababa-ethiopia-december-1-2017.webp",
  },
];


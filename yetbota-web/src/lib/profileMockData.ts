// Mock data for Profile page — replace with RTK Query when backend is ready

export interface ProfileUser {
  name: string;
  username: string;
  role: string;
  location: string;
  followers: string;
  following: number;
  avatarUrl?: string;
  level: number;
  xp: number;
  xpToNext: number;
  progressPercent: number;
}

export interface Badge {
  id: string;
  label: string;
  icon: string; // lucide icon name
  color: string; // bg color
}

export interface ActivityItem {
  id: string;
  type: "answered" | "liked" | "post";
  text: string;
  timeAgo: string;
}

export interface Contribution {
  id: string;
  name: string;
  location: string;
  category: string;
  addedDate: string;
  views: string;
  rating: number;
  imageUrl: string;
}

// ─── Mock user ────────────────────────────────────────────────────────────────

export const MOCK_PROFILE_USER: ProfileUser = {
  name: "Alex Rivers",
  username: "@arivers",
  role: "Expert Guide",
  location: "Addis Ababa, Ethiopia",
  followers: "1.2k",
  following: 450,
  level: 9,
  xp: 4820,
  xpToNext: 5000,
  progressPercent: 85,
};

// ─── Badges ───────────────────────────────────────────────────────────────────

export const EARNED_BADGES: Badge[] = [
  { id: "explorer",   label: "Explorer",   icon: "Compass",      color: "bg-emerald-600" },
  { id: "topguide",   label: "Top Guide",  icon: "ShieldCheck",  color: "bg-yellow-600" },
  { id: "pathfinder", label: "Pathfinder", icon: "Map",          color: "bg-blue-600" },
  { id: "shutterbug", label: "Shutterbug", icon: "Camera",       color: "bg-purple-600" },
  { id: "helper",     label: "Helper",     icon: "Heart",        color: "bg-rose-600" },
];

// ─── Recent activity ──────────────────────────────────────────────────────────

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "answered",
    text: '"The best time to visit Lalibela is during the Timkat festival in January..."',
    timeAgo: "2 hours ago",
  },
  {
    id: "a2",
    type: "liked",
    text: "New coffee spots in Bole District by @Sam_Travels",
    timeAgo: "Yesterday",
  },
  {
    id: "a3",
    type: "post",
    text: '"Hidden gem alert: The Gheraita Mountains are a must-see for hikers!"',
    timeAgo: "3 days ago",
  },
];

// ─── Contributions ────────────────────────────────────────────────────────────

export const CONTRIBUTIONS: Contribution[] = [
  {
    id: "c1",
    name: "Rock-Hewn Churches",
    location: "Lalibela, Amhara",
    category: "Historical",
    addedDate: "May 12, 2023",
    views: "2.4k",
    rating: 4.9,
    imageUrl: "/images/places/tomoca.jpg",
  },
  {
    id: "c2",
    name: "Tomoca Coffee",
    location: "Piazza, Addis Ababa",
    category: "Dining",
    addedDate: "Feb 28, 2024",
    views: "1.8k",
    rating: 5.0,
    imageUrl: "/images/places/galani.jpg",
  },
  {
    id: "c3",
    name: "Blue Nile Falls",
    location: "Bahir Dar",
    category: "Nature",
    addedDate: "Nov 15, 2023",
    views: "4.1k",
    rating: 4.7,
    imageUrl: "/images/places/shola.jpg",
  },
  {
    id: "c4",
    name: "National Museum",
    location: "Addis Ababa",
    category: "Historical",
    addedDate: "Jan 10, 2024",
    views: "920",
    rating: 4.5,
    imageUrl: "/images/places/bole.jpg",
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Historical: "bg-amber-700/80",
  Dining:     "bg-rose-700/80",
  Nature:     "bg-emerald-700/80",
  Market:     "bg-blue-700/80",
  Park:       "bg-teal-700/80",
};
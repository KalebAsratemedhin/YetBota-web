
export interface Place {
  id: string;
  nameKey: string;           
  descriptionKey: string;
  distance: string;         
  rating?: number;
  reviewCount?: string;
  badge?: "curated" | "community";
  imageUrl: string;
  category: "coffee" | "market" | "park";
}

export interface Champion {
  id: string;
  name: string;
  roleKey: string;         
  points: number;
  avatarUrl?: string;        
  badgeIcon: "mapper" | "guide" | "lens" | "qa";
}

export interface Principle {
  id: string;
  icon: "people" | "ai" | "fees" | "digital2030";
  titleKey: string;
  descriptionKey: string;
}

export interface NavFeature {
  labelKey: string;
}

// ─── Discovery Places ─────────────────────────────────────────────────────────

export const COFFEE_HOUSES: Place[] = [
  {
    id: "tomoca",
    nameKey: "tomocaCoffee",
    descriptionKey: "tomocaCoffee",
    distance: "0.2",
    rating: 4.9,
    reviewCount: "1.2k",
    badge: "curated",
    imageUrl: "/images/places/tomoca.jpg",
    category: "coffee",
  },
  {
    id: "galani",
    nameKey: "galaniCoffee",
    descriptionKey: "galaniCoffee",
    distance: "2.5",
    rating: 4.7,
    reviewCount: "850",
    badge: "curated",
    imageUrl: "/images/places/galani.jpg",
    category: "coffee",
  },
  {
    id: "yeshi",
    nameKey: "yeshiBunna",
    descriptionKey: "yeshiBunna",
    distance: "1.1",
    rating: 4.5,
    reviewCount: "2k",
    badge: "curated",
    imageUrl: "/images/places/yeshi.jpg",
    category: "coffee",
  },
];

export const HIDDEN_MARKETS: Place[] = [
  {
    id: "mercato",
    nameKey: "mercatoSpice",
    descriptionKey: "mercatoSpice",
    distance: "1.5",
    badge: "community",
    imageUrl: "/images/places/mercato.jpg",
    category: "market",
  },
  {
    id: "shola",
    nameKey: "sholaMarket",
    descriptionKey: "sholaMarket",
    distance: "4.2",
    badge: "curated",
    imageUrl: "/images/places/shola.jpg",
    category: "market",
  },
  {
    id: "bole",
    nameKey: "boleDayMarket",
    descriptionKey: "boleDayMarket",
    distance: "0.9",
    badge: "curated",
    imageUrl: "/images/places/bole.jpg",
    category: "market",
  },
];

export const LOCAL_PARKS: Place[] = [
  {
    id: "friendship",
    nameKey: "friendshipPark",
    descriptionKey: "friendshipPark",
    distance: "3.1",
    badge: "curated",
    imageUrl: "/images/places/friendship.jpg",
    category: "park",
  },
  {
    id: "unity",
    nameKey: "unityPark",
    descriptionKey: "unityPark",
    distance: "5.0",
    badge: "curated",
    imageUrl: "/images/places/unity.jpg",
    category: "park",
  },
];

// ─── Community Champions ──────────────────────────────────────────────────────

export const CHAMPIONS: Champion[] = [
  { id: "dawit",  name: "Dawit Kebede", roleKey: "Top Mapper",    points: 1250, badgeIcon: "mapper" },
  { id: "sara",   name: "Sara M.",      roleKey: "Expert Guide",  points: 980,  badgeIcon: "guide"  },
  { id: "elias",  name: "Elias Yared",  roleKey: "Lens Master",   points: 845,  badgeIcon: "lens"   },
  { id: "lulut",  name: "Lulut A.",     roleKey: "Q&A Pro",       points: 720,  badgeIcon: "qa"     },
];

// ─── Core Principles ──────────────────────────────────────────────────────────

export const PRINCIPLES: Principle[] = [
  { id: "people",     icon: "people",     titleKey: "people",     descriptionKey: "people"     },
  { id: "ai",         icon: "ai",         titleKey: "ai",         descriptionKey: "ai"         },
  { id: "fees",       icon: "fees",       titleKey: "fees",       descriptionKey: "fees"       },
  { id: "digital2030",icon: "digital2030",titleKey: "digital2030",descriptionKey: "digital2030"},
];

// ─── Navigation Features ──────────────────────────────────────────────────────

export const NAV_FEATURES = [
  "Search by local landmarks or Amharic names",
  "Offline access to saved locations",
];

// ─── Accuracy Stats ───────────────────────────────────────────────────────────

export const ACCURACY_STATS = {
  verifiedSpots: "50k+",
  communityLed: "100%",
  verifiedByCount: 12,
  lastCheckedHours: 2,
};

// ─── Gamification ─────────────────────────────────────────────────────────────

export const GAMIFICATION = {
  currentLevel: "Gold Level",
  currentXp: 2500,
  nextLevel: "Platinum",
  xpToNext: 3500,
  badges: ["Top Mapper Badge", "Expert Reviewer", "Photo Legend"],
};

// ─── Community Q&A ────────────────────────────────────────────────────────────

export const TRENDING_QUESTION = {
  id: "q1",
  text: '"Is there a designated parking area for visitors near the Friendship Park main gate?"',
  author: "Abenezer T.",
  answersCount: 2,
};
export interface NavItem {
  label: string;
  href: string;
}

export interface PlaceCard {
  id: string;
  name: string;
  description: string;
  distance: string;
  rating?: number;
  reviewCount?: string;
  badge?: "curated" | "community";
  imageUrl: string;
}

export interface Champion {
  name: string;
  role: string;
  points: string;
  avatarInitials: string;
}

export interface CorePrinciple {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FooterNavGroup {
  title: string;
  links: string[];
}

export type Locale = "en" | "am";
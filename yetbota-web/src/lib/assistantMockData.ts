// Mock data for AI Assistant — replace with RTK Query calls when backend is ready

export interface PlaceCard {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  distance: string;
  imageUrl: string;
  profileUrl: string;
}

export type MessageRole = "ai" | "user";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  placeCard?: PlaceCard;
  timestamp: Date;
}

export interface RecentChat {
  id: string;
  title: string;
  active?: boolean;
}

export interface SuggestedTopic {
  id: string;
  label: string;
}

//  Mock conversations 

export const RECENT_CHATS: RecentChat[] = [
  { id: "1", title: "Coffee near Central Park", active: true },
  { id: "2", title: "Weekend trip to Kyoto" },
  { id: "3", title: "Best Pasta in Rome" },
];

export const SUGGESTED_TOPICS: SuggestedTopic[] = [
  { id: "1", label: "#LocalCoffee" },
  { id: "2", label: "#MercatoGuides" },
  { id: "3", label: "#HiddenGems" },
  { id: "4", label: "#SoloTravel" },
];

//  Mock place cards

export const MOCK_PLACES: Record<string, PlaceCard> = {
  greenBeanCafe: {
    id: "green-bean",
    name: "Green Bean Cafe",
    rating: 4.9,
    reviewCount: 120,
    isOpen: true,
    distance: "0.2 miles away",
    imageUrl: "/images/places/galani.jpg",
    profileUrl: "#",
  },
  tomocaCoffee: {
    id: "tomoca",
    name: "Tomoca Coffee – Piazza",
    rating: 4.9,
    reviewCount: 530,
    isOpen: true,
    distance: "0.3 miles away",
    imageUrl: "/images/places/tomoca.jpg",
    profileUrl: "#",
  },
  sholaMarket: {
    id: "shola",
    name: "Shola Traditional Market",
    rating: 4.6,
    reviewCount: 240,
    isOpen: true,
    distance: "1.1 miles away",
    imageUrl: "/images/places/shola.jpg",
    profileUrl: "#",
  },
};

// Initial conversation

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "ai",
    text: "Hey there! I'm your Yet Bota guide. Ask me about local events, trending spots, or community insights.",
    timestamp: new Date(),
  },
];

// Mock AI responses (keyword → response)

export interface MockResponse {
  text: string;
  placeCard?: PlaceCard;
}

export function getMockResponse(userInput: string): MockResponse {
  const input = userInput.toLowerCase();

  if (input.includes("coffee") || input.includes("cafe") || input.includes("bunna")) {
    return {
      text: `Our community members are currently loving <span class="text-brand font-semibold">Green Bean Cafe</span>. It's just a 3-minute walk from the North entrance.`,
      placeCard: MOCK_PLACES.greenBeanCafe,
    };
  }

  if (input.includes("market") || input.includes("mercato") || input.includes("shola")) {
    return {
      text: `<span class="text-brand font-semibold">Shola Traditional Market</span> is one of the highest-rated spots in the community right now. Great for local textiles and fresh produce!`,
      placeCard: MOCK_PLACES.sholaMarket,
    };
  }

  if (input.includes("tomoca") || input.includes("piazza")) {
    return {
      text: `<span class="text-brand font-semibold">Tomoca Coffee – Piazza</span> is Ethiopia's most iconic coffee house. Community members say it's a must-visit, especially in the mornings.`,
      placeCard: MOCK_PLACES.tomocaCoffee,
    };
  }

  if (input.includes("park") || input.includes("friendship") || input.includes("unity")) {
    return {
      text: "Friendship Park and Unity Park are both highly rated by the community. Friendship Park is especially popular on weekend mornings. Would you like directions to either?",
    };
  }

  if (input.includes("event")) {
    return {
      text: "There are 3 community events happening this weekend near Bole — a local art fair, a cultural food walk, and a sunrise yoga session at Unity Park. Want details on any of these?",
    };
  }

  return {
    text: "I found a few spots that match what you're looking for! The community has been active in your area recently. Try asking me about coffee houses, local markets, or upcoming events near you.",
  };
}

// Quick action chips

export const QUICK_ACTIONS = [
  { id: "events",    label: "Events",       icon: "CirclePlus" },
  { id: "guides",    label: "Guides",       icon: "BookOpen" },
  { id: "community", label: "Community Q&A", icon: "MessageCircle" },
];
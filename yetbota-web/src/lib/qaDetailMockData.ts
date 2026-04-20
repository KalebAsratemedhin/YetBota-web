export interface QaDetailUser {
  name: string;
  badge: string;
  avatarUrl: string;
}

export interface QaDetailReply {
  id: string;
  author: QaDetailUser;
  timeAgo: string;
  body: string;
}

export interface QaDetailAnswer {
  id: string;
  author: QaDetailUser;
  timeAgo: string;
  body: string;
  score: number;
  replies: QaDetailReply[];
  hasMoreReplies?: boolean;
  moreRepliesLabel?: string;
}

export interface QaDetailQuestion {
  id: string;
  heroImageUrl: string;
  badgeLabel: string;
  askedLabel: string;
  title: string;
  body: string;
  tagLabel: string;
  answersCount: number;
  sortLabel: string;
  answers: QaDetailAnswer[];
}

const BASE_QUESTION: Omit<QaDetailQuestion, "id"> = {
  heroImageUrl: "/images/places/shola.jpg",
  badgeLabel: "Local Insight",
  askedLabel: "Asked 2h ago",
  title: "Best hidden parks near these coordinates?",
  body:
    "I'm looking for quiet spots with benches and maybe a small fountain. Somewhere good for reading without too much noise. Ideally within walking distance of the pin.",
  tagLabel: "Parks & Rec",
  answersCount: 24,
  sortLabel: "Top Rated",
  answers: [
    {
      id: "a1",
      author: {
        name: "Alex Rivera",
        badge: "Local Guide",
        avatarUrl: "/images/profile/tomoca-coffee-on-cameroon.webp",
      },
      timeAgo: "45m ago",
      body:
        "Check out Elizabeth Street Garden. It's exactly what you're looking for. Very hidden, lots of statues, and plenty of benches for reading.",
      score: 142,
      replies: [
        {
          id: "r1",
          author: {
            name: "Marcus Thorne",
            badge: "New Member",
            avatarUrl: "/images/places/bole.jpg",
          },
          timeAgo: "12m ago",
          body: "Is it open on Sundays? I've tried going once but it was locked.",
        },
      ],
      hasMoreReplies: true,
      moreRepliesLabel: "Show 4 more comments...",
    },
    {
      id: "a2",
      author: {
        name: "Sarah Chen",
        badge: "Reading Enthusiast",
        avatarUrl: "/images/profile/blue-nile-falls.webp",
      },
      timeAgo: "1h ago",
      body:
        "There's a tiny pocket park on 2nd and Main. It has a beautiful waterfall wall that masks the city noise perfectly.",
      score: 89,
      replies: [
        {
          id: "r2",
          author: {
            name: "Jordan Wu",
            badge: "City Explorer",
            avatarUrl:
              "/images/profile/national-museum-of-ethiopia-addis-ababa-ethiopia-december-1-2017.webp",
          },
          timeAgo: "50m ago",
          body: "Greenacre Park! The waterfall is 25 feet high. It's magical.",
        },
      ],
    },
    {
      id: "a3",
      author: {
        name: "Marcus Thorne",
        badge: "New Member",
        avatarUrl: "/images/places/yeshi.jpg",
      },
      timeAgo: "2h ago",
      body:
        "The rooftop garden at the public library nearby is also very quiet if you don't mind the wind.",
      score: 12,
      replies: [],
    },
  ],
};

const BY_ID: Record<string, QaDetailQuestion> = {
  p1: { id: "p1", ...BASE_QUESTION, heroImageUrl: "/images/places/mercato.jpg" },
  p2: {
    id: "p2",
    ...BASE_QUESTION,
    badgeLabel: "Night Tip",
    askedLabel: "Asked 2h ago",
    title: "Recommended spots for traditional music tonight?",
    body:
      "Looking for a place with authentic Azmari music near the city center. Any hidden gems I should check out?",
    tagLabel: "Culture",
    heroImageUrl: "/images/places/unity.jpg",
  },
};

export function getQaDetailQuestion(id: string): QaDetailQuestion {
  return BY_ID[id] ?? { id, ...BASE_QUESTION };
}


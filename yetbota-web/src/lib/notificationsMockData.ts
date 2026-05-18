export type NotificationFilter = "All" | "Social" | "Q&A" | "Badges";

export const NOTIFICATION_FILTERS: NotificationFilter[] = [
  "All",
  "Social",
  "Q&A",
  "Badges",
];

export type NotificationCategory = "Social" | "Q&A" | "Achievements" | "Community";

type NotificationBase = {
  id: string;
  category: NotificationCategory;
  timeLabel: string;
  group: "TODAY" | "YESTERDAY";
  read: boolean;
};

export type SocialLikeNotification = NotificationBase & {
  kind: "social_like";
  username: string;
  avatarUrl: string;
  highlight: string;
  body: string;
};

export type QaReplyNotification = NotificationBase & {
  kind: "qa_reply";
  username: string;
  avatarUrl: string;
  quote: string;
};

export type AchievementNotification = NotificationBase & {
  kind: "achievement";
  badgeName: string;
  subtext: string;
};

export type CommunityNotification = NotificationBase & {
  kind: "community";
  highlight: string;
  body: string;
};

export type AppNotification =
  | SocialLikeNotification
  | QaReplyNotification
  | AchievementNotification
  | CommunityNotification;

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "social_like",
    category: "Social",
    timeLabel: "2m ago",
    group: "TODAY",
    read: false,
    username: "Alex_Green",
    avatarUrl: "/images/profile/tomoca-coffee-on-cameroon.webp",
    highlight: "Downtown Park",
    body: "liked your post in",
  },
  {
    id: "n2",
    kind: "qa_reply",
    category: "Q&A",
    timeLabel: "1h ago",
    group: "TODAY",
    read: true,
    username: "Sarah",
    avatarUrl: "/images/profile/blue-nile-falls.webp",
    quote: "I highly recommend the espresso at Oxfordshire Coffee House!",
  },
  {
    id: "n3",
    kind: "achievement",
    category: "Achievements",
    timeLabel: "3h ago",
    group: "TODAY",
    read: true,
    badgeName: "Local Guide",
    subtext: "Thanks for providing 10 helpful answers this week!",
  },
  {
    id: "n4",
    kind: "social_like",
    category: "Social",
    timeLabel: "Yesterday",
    group: "YESTERDAY",
    read: true,
    username: "Jordan_92",
    avatarUrl: "/images/profile/rock-hewn.webp",
    highlight: "Bike Path",
    body: "liked your post about the new",
  },
  {
    id: "n5",
    kind: "community",
    category: "Community",
    timeLabel: "Yesterday",
    group: "YESTERDAY",
    read: true,
    highlight: "Farmers Market",
    body: "New post in your area:",
  },
];

export function filterNotifications(
  items: AppNotification[],
  filter: NotificationFilter
): AppNotification[] {
  if (filter === "All") return items;
  if (filter === "Social") return items.filter((n) => n.category === "Social");
  if (filter === "Q&A") return items.filter((n) => n.category === "Q&A");
  return items.filter((n) => n.category === "Achievements");
}

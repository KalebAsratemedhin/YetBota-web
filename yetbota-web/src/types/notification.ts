// In-app notification center (content-service, /v1/notifications).
// See notifications-frontend-integration.md, Part 2.

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  // Arbitrary client-routing data; omitted when empty.
  data?: Record<string, string>;
  // Optional URL/reference; omitted when absent.
  attachment?: string;
  sent_at: string;
  // Omitted when unread — presence ⇒ read.
  read_at?: string;
}

export interface NotificationsPagination {
  page: number;
  total: number;
  length: number;
  total_pages: number;
}

export interface ListNotificationsData {
  notifications: AppNotification[];
  pagination: NotificationsPagination;
}

export interface ListNotificationsQuery {
  // true → only unread; default false → all.
  unread?: boolean;
  page?: number;
  limit?: number;
}

export interface MarkNotificationsReadRequest {
  ids: string[];
}

// Partial success: an id lands in `failure` if not owned by the caller or
// already read. A 200 response can still contain failures.
export interface MarkNotificationsReadData {
  success: string[];
  failure: string[];
}

import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { server } from "../server";
import { authedState, renderWithProviders } from "../utils";
import type { AppNotification } from "@/types/notification";
import NotificationsPage from "@/app/(app)/notifications/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/notifications",
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

// Keep the Firebase push SDK out of the test; the opt-in banner self-hides.
vi.mock("@/lib/firebase/config", () => ({ isFirebaseConfigured: () => false }));
vi.mock("@/lib/firebase/messaging", () => ({
  requestAndGetFcmToken: vi.fn(),
  getFcmTokenIfPermitted: vi.fn(),
  onForegroundMessage: vi.fn(),
}));

// notificationApi extends contentBaseApi, whose base URL is hardcoded to /proxy/content/v1.
const NOTIF_URL = "http://localhost/proxy/content/v1/notifications/";
const MARK_READ_URL = "http://localhost/proxy/content/v1/notifications/mark-read";

function notif(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: "n1",
    user_id: "u1",
    title: "Someone replied to your post",
    body: "Check it out",
    sent_at: "2024-03-15T10:30:00.000Z",
    ...overrides,
  };
}

function listResponse(notifications: AppNotification[]) {
  return HttpResponse.json({
    success: true,
    data: {
      notifications,
      pagination: { page: 1, total: notifications.length, length: notifications.length, total_pages: 1 },
    },
  });
}

function renderPage() {
  return renderWithProviders(<NotificationsPage />, {
    preloadedState: { auth: authedState() },
  });
}

describe("notifications flow", () => {
  it("renders the notification list with a mark-as-read control for unread items", async () => {
    const unread = notif({ id: "n1", title: "Unread item" });
    const read = notif({ id: "n2", title: "Read item", read_at: "2024-03-16T00:00:00.000Z" });
    server.use(http.get(NOTIF_URL, () => listResponse([unread, read])));

    renderPage();

    expect(await screen.findByText("Unread item")).toBeInTheDocument();
    expect(screen.getByText("Read item")).toBeInTheDocument();
    // Only the unread item exposes "Mark as read".
    expect(screen.getAllByLabelText("Mark as read")).toHaveLength(1);
  });

  it("shows the empty state when there are no notifications", async () => {
    server.use(http.get(NOTIF_URL, () => listResponse([])));
    renderPage();
    expect(await screen.findByText(/you're all caught up/i)).toBeInTheDocument();
  });

  it("marks all unread as read from the header", async () => {
    let marked = false;
    const captured: { ids?: string[] } = {};
    server.use(
      http.get(NOTIF_URL, () =>
        marked
          ? listResponse([
              notif({ id: "n1", read_at: "2024-03-16T00:00:00.000Z" }),
              notif({ id: "n2", read_at: "2024-03-16T00:00:00.000Z" }),
            ])
          : listResponse([notif({ id: "n1" }), notif({ id: "n2" })]),
      ),
      http.post(MARK_READ_URL, async ({ request }) => {
        captured.ids = ((await request.json()) as { ids: string[] }).ids;
        marked = true;
        return HttpResponse.json({ success: true, data: { success: captured.ids, failure: [] } });
      }),
    );

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getAllByLabelText("Mark as read")).toHaveLength(2));
    await user.click(screen.getByRole("button", { name: /mark all as read/i }));

    await waitFor(() => expect(screen.queryByLabelText("Mark as read")).not.toBeInTheDocument());
    expect(captured.ids).toEqual(["n1", "n2"]);
  });

  it("deletes a notification and removes it from the list", async () => {
    let deleted = false;
    server.use(
      http.get(NOTIF_URL, () =>
        deleted
          ? listResponse([notif({ id: "n2", title: "Keep me" })])
          : listResponse([notif({ id: "n1", title: "Delete me" }), notif({ id: "n2", title: "Keep me" })]),
      ),
      http.delete("http://localhost/proxy/content/v1/notifications/n1", () => {
        deleted = true;
        return HttpResponse.json({ success: true });
      }),
    );

    const user = userEvent.setup();
    renderPage();

    const target = (await screen.findByText("Delete me")).closest("article") as HTMLElement;
    await user.click(within(target).getByLabelText("Delete notification"));

    await waitFor(() => expect(screen.queryByText("Delete me")).not.toBeInTheDocument());
    expect(screen.getByText("Keep me")).toBeInTheDocument();
  });

  it("prompts the signed-out visitor to sign in", () => {
    renderWithProviders(<NotificationsPage />); // no auth token
    expect(screen.getByText(/sign in to see your notifications/i)).toBeInTheDocument();
  });
});

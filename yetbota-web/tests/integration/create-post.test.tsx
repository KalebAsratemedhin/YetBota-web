import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { server } from "../server";
import { authedState, renderWithProviders } from "../utils";
import CreatePostPage from "@/app/(app)/create/page";

const { pushMock, backMock, toastMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  backMock: vi.fn(),
  toastMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: backMock, replace: vi.fn() }),
  redirect: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

// The location modal lazy-loads a Leaflet map; it's irrelevant to the post flow.
vi.mock("@/components/create/CreatePostLocationModal", () => ({ default: () => null }));

const CREATE_URL = "http://localhost/v1/posts/";

function renderPage() {
  return renderWithProviders(<CreatePostPage />, { preloadedState: { auth: authedState() } });
}

describe("create-post flow", () => {
  it("submits the post payload and navigates to the new post", async () => {
    const captured: { body?: Record<string, unknown> } = {};
    server.use(
      http.post(CREATE_URL, async ({ request }) => {
        captured.body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: {
            post: {
              id: "p1",
              title: "My trip",
              description: "It was great",
              likes: 0,
              dislikes: 0,
              comments: 0,
              user_id: "u1",
              tags: ["History"],
              is_question: false,
              created_at: "2024-03-15T00:00:00Z",
              updated_at: "2024-03-15T00:00:00Z",
            },
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/Exploring the Simien Mountains/i), "My trip");
    await user.type(screen.getByPlaceholderText(/Describe the vibe/i), "It was great");
    await user.click(screen.getByRole("button", { name: /^post$/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/locations/p1"));
    expect(captured.body).toMatchObject({
      title: "My trip",
      description: "It was great",
      tags: ["History"],
      is_question: false,
      photos: [],
      location: { latitude: 9.03, longitude: 38.74 },
    });
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Posted" }));
  });

  it("keeps the Post button disabled until title and description are filled", async () => {
    const user = userEvent.setup();
    renderPage();

    const post = screen.getByRole("button", { name: /^post$/i });
    expect(post).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/Exploring the Simien Mountains/i), "Title only");
    expect(post).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/Describe the vibe/i), "Now it has a body");
    expect(post).toBeEnabled();
  });

  it("surfaces a failure toast when the API rejects the post", async () => {
    server.use(
      http.post(CREATE_URL, () => HttpResponse.json({ success: false, message: "nope" }, { status: 500 })),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/Exploring the Simien Mountains/i), "My trip");
    await user.type(screen.getByPlaceholderText(/Describe the vibe/i), "It was great");
    await user.click(screen.getByRole("button", { name: /^post$/i }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive", title: "Failed to post" }),
      ),
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});

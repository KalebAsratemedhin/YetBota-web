import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { server } from "../server";
import { authedState, renderWithProviders } from "../utils";
import type { UserPrivate } from "@/types/auth";
import ProfileContent from "@/app/(app)/profile/ProfileContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const ME_URL = "http://localhost/v1/users/me";

const me: UserPrivate = {
  id: "u1",
  first_name: "Abebe",
  last_name: "Kebede",
  username: "abebe",
  mobile: "+251911223344",
  rating: 1820,
  badges: ["contributor", "trusted_voice"],
  contributions: 12,
  followers: 2500,
  following: 31,
  status: "active",
  role: "Member",
  profile_url: "",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
};

describe("profile flow", () => {
  it("fetches the current user and renders their identity", async () => {
    server.use(http.get(ME_URL, () => HttpResponse.json({ success: true, data: { user: me } })));

    renderWithProviders(<ProfileContent />, { preloadedState: { auth: authedState() } });

    expect(await screen.findByText("Abebe Kebede")).toBeInTheDocument();
    // Follower count comes from the mapper (2500 → "2.5k"), proving the
    // fetched user flowed through to the rendered profile.
    expect(screen.getByText("2.5k")).toBeInTheDocument();
  });

  it("shows a retry affordance when the profile fails to load", async () => {
    server.use(
      http.get(ME_URL, () => HttpResponse.json({ success: false, message: "boom" }, { status: 500 })),
    );

    renderWithProviders(<ProfileContent />, { preloadedState: { auth: authedState() } });

    expect(await screen.findByText(/could not load your profile/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});

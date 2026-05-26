import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { server } from "../server";
import { renderWithProviders } from "../utils";
import SignInPage from "@/app/(auth)/signin/page";

const { replaceMock, pushMock, backMock, toastMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  pushMock: vi.fn(),
  backMock: vi.fn(),
  toastMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock, back: backMock }),
  redirect: vi.fn(),
  usePathname: () => "/signin",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const LOGIN_URL = "http://localhost/v1/auth/login";

describe("sign-in flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("logs in, stores the token and redirects home", async () => {
    server.use(
      http.post(LOGIN_URL, async ({ request }) => {
        const body = (await request.json()) as { username: string; password: string };
        expect(body).toEqual({ username: "abebe", password: "secret123" });
        return HttpResponse.json({
          success: true,
          data: { access_token: "access-xyz", refresh_token: "refresh-xyz" },
        });
      }),
    );

    const user = userEvent.setup();
    const { store } = renderWithProviders(<SignInPage />);

    await user.type(screen.getByPlaceholderText("Enter your username"), "  abebe  ");
    await user.type(screen.getByPlaceholderText("········"), "secret123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(store.getState().auth.accessToken).toBe("access-xyz"));
    expect(replaceMock).toHaveBeenCalledWith("/");
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Signed in" }),
    );
    // Session is persisted for other slices/pages.
    expect(window.localStorage.getItem("yetbota.localAuth")).toContain("access-xyz");
  });

  it("shows the server error message and does not redirect on failure", async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 }),
      ),
    );

    const user = userEvent.setup();
    const { store } = renderWithProviders(<SignInPage />);

    await user.type(screen.getByPlaceholderText("Enter your username"), "abebe");
    await user.type(screen.getByPlaceholderText("········"), "wrong");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Sign in failed",
          description: "Invalid credentials",
        }),
      ),
    );
    expect(store.getState().auth.accessToken).toBeNull();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("disables the submit button until both fields are filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInPage />);

    const submit = screen.getByRole("button", { name: /^sign in$/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByPlaceholderText("Enter your username"), "abebe");
    expect(submit).toBeDisabled();

    await user.type(screen.getByPlaceholderText("········"), "secret123");
    expect(submit).toBeEnabled();
  });
});

export type SignUpDraft = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const SIGNUP_DRAFT_KEY = "yetbota_signup_draft";

export function saveSignUpDraft(data: SignUpDraft) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(data));
}

export function readSignUpDraft(): SignUpDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(SIGNUP_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SignUpDraft>;
    if (!parsed.firstName || !parsed.lastName || !parsed.email || !parsed.password) {
      return null;
    }
    return {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      password: parsed.password,
    };
  } catch {
    return null;
  }
}

export function clearSignUpDraft() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
}

import en from "../../content/en.json";
import am from "../../content/am.json";

export type Locale = "en" | "am";

const translations: Record<Locale, typeof en> = { en, am };

export function getContent(locale: Locale = "en") {
  return translations[locale] ?? translations.en;
}

export type Content = ReturnType<typeof getContent>;
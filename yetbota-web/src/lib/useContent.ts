"use client";
import { getContent } from "@/lib/i18n";
import { useAppSelector } from "@/store/hooks";

export function useContent() {
  const locale = useAppSelector((s) => s.locale.locale);
  return getContent(locale);
}
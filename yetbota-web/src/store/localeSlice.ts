import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Locale } from "@/types/landing";

interface LocaleState {
  locale: Locale;
}

const initialState: LocaleState = {
  locale: "en",
};

export const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;
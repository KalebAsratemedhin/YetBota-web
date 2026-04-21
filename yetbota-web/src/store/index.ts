import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/api/baseApi";
import { authApi } from "@/store/api/authApi";
import authReducer from "@/store/authSlice";
import localeReducer from "./localeSlice";

export { authApi };

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
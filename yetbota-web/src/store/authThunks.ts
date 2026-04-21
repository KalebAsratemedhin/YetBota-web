import { baseApi } from "@/store/api/baseApi";
import { logout } from "@/store/authSlice";
import type { AppDispatch } from "@/store/index";

export function logoutFromApp(dispatch: AppDispatch) {
  dispatch(logout());
  dispatch(baseApi.util.resetApiState());
}

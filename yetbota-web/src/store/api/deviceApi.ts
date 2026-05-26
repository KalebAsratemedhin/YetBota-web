import { baseApi } from "@/store/api/baseApi";
import type { DeviceData, RegisterDeviceRequest } from "@/types/device";

// Device token registration — identity-service /v1/devices.
// Upserts on (device_id, token); safe to call repeatedly.
export const deviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerDevice: builder.mutation<DeviceData, RegisterDeviceRequest>({
      query: (body) => ({ url: "/devices/", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

export const { useRegisterDeviceMutation } = deviceApi;

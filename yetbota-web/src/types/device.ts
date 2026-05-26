// Device registration for push (identity-service, /v1/devices).
// See notifications-frontend-integration.md, Part 1.

export interface RegisterDeviceRequest {
  // Stable per-install identifier (required).
  device_id: string;
  // FCM registration token. Omit/empty if unavailable.
  token?: string;
  oem?: string;
  device?: string;
  os?: string;
  longitude?: number;
  latitude?: number;
}

export interface DeviceData {
  device: {
    id: string;
    user_id: string;
    device_id: string;
    oem?: string;
    device?: string;
    os?: string;
    longitude?: number;
    latitude?: number;
    created_at: string;
    updated_at: string;
  };
}

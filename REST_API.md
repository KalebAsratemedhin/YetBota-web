# Identity Service REST API (v1)

Base prefix: `/identity/v1`

All JSON responses use the envelope:

```json
{
  "code": "00",
  "success": true,
  "message": "…",
  "data": {}
}
```

## Authentication

Protected endpoints require:

- Header: `Authorization: Bearer <access_token>`

## Error handling

- Errors are returned in the same JSON envelope (`success=false`, `code` is a **string**).
- HTTP status for toddler errors: toddler codes are expected to be **4 digits** (e.g. `4001`) and the **HTTP status** is the first 3 digits (`4001` → HTTP `400`). If the code is not 4 digits, HTTP status falls back to `500`.

## Auth APIs

### POST `/identity/v1/auth/login` (public)

Request (`LoginRequest`)

```json
{
  "username": "string",
  "password": "string",
  "site": "string (optional)"
}
```

Response (`LoginResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Login Successful | …",
  "data": {
    "access_token": "string",
    "access_token_ttl": 0,
    "refresh_token": "string",
    "refresh_token_ttl": 0
  }
}
```

### POST `/identity/v1/auth/refresh` (public)

Request (`RefreshRequest`)

```json
{
  "refresh_token": "string",
  "username": "string"
}
```

Response (`RefreshResponse`) is the same shape as `LoginResponse`.

### POST `/identity/v1/auth/logout` (protected)

Request (`LogoutRequest`)

```json
{
  "refresh_token": "string",
  "username": "string"
}
```

Response (`LogoutResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Logout Successful | …"
}
```

### POST `/identity/v1/auth/otp/generate` (public)

Request (`GenerateMobileOTPRequest`)

```json
{
  "mobile": "string",
  "random": "string"
}
```

Response (`GenerateMobileOTPResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "OTP Generated | …",
  "data": {
    "otp_req_count": 0,
    "max_otp_req": 0,
    "otp_err_count": 0,
    "max_otp_err": 0
  }
}
```

### POST `/identity/v1/auth/otp/validate` (public)

Request (`ValidateOTPRequest`)

```json
{
  "otp": "string",
  "mobile": "string",
  "random": "string"
}
```

Response (`ValidateOTPResponse`) uses the same `data` OTP shape as generate.

### POST `/identity/v1/auth/password/new` (public)

Request (`NewPasswordRequest`)

```json
{
  "password": "string",
  "random": "string",
  "mobile": "string"
}
```

Response (`NewPasswordResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Password Updated | …"
}
```

### POST `/identity/v1/auth/authorize` (protected)

Request (`AuthorizationRequest`)

```json
{
  "resource": "string",
  "action": "string"
}
```

Response (`AuthorizationResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Authorized | …"
}
```

### POST `/identity/v1/auth/password/change` (protected)

Request (`ChangePasswordRequest`)

```json
{
  "current_password": "string",
  "new_password": "string"
}
```

Response (`ChangePasswordResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Password Changed | …"
}
```

### POST `/identity/v1/auth/mobile/change` (protected)

Request (`ChangeMobileRequest`)

```json
{
  "new_mobile": "string",
  "random": "string"
}
```

Response (`ChangeMobileResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Mobile Changed | …"
}
```

## User APIs

### GET `/identity/v1/users` (protected)

Query params (all optional unless noted):
- `limit`: number (default is server-side default)
- `page`: number
- `sort_field`: string (defaults server-side)
- `sort_direction`: `ASC|DESC` (defaults server-side)
- `first_name`, `surname`, `username`, `mobile`, `status`, `role`
- `resolution`: `MOBILE|WEB|ORIGINAL` (optional)

Response (`ListResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "List Successful | …",
  "data": {
    "users": [
      {
        "id": "string",
        "first_name": "string",
        "last_name": "string",
        "username": "string",
        "mobile": "string",
        "rating": 0,
        "badges": ["string"],
        "contributions": 0,
        "followers": 0,
        "following": 0,
        "status": "string",
        "role": "string",
        "profile_url": "string",
        "created_at": "RFC3339 timestamp",
        "updated_at": "RFC3339 timestamp"
      }
    ],
    "pagination": {
      "total": 0,
      "limit": 0,
      "current_page": 0
    }
  }
}
```

### GET `/identity/v1/users/{id}` (protected)

Query params:
- `resolution`: `MOBILE|WEB|ORIGINAL` (optional)

Response (`ReadResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Read Successful | …",
  "data": {
    "user": { "id": "string", "first_name": "string", "last_name": "string", "username": "string", "mobile": "string", "rating": 0, "badges": ["string"], "contributions": 0, "followers": 0, "following": 0, "status": "string", "role": "string", "profile_url": "string", "created_at": "RFC3339 timestamp", "updated_at": "RFC3339 timestamp" },
    "profile_url": "string"
  }
}
```

### GET `/identity/v1/users/{id}/public` (public)

Query params:
- `resolution`: `MOBILE|WEB|ORIGINAL` (optional)

Response (`ReadPublicResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Read Successful | …",
  "data": {
    "id": "string",
    "username": "string",
    "mobile_verified": true,
    "rating": 0,
    "badges": ["string"],
    "contributions": 0,
    "followers": 0,
    "following": 0,
    "profile_url": "string",
    "created_at": "RFC3339 timestamp"
  }
}
```

### PATCH `/identity/v1/users/{id}` (protected)

Request (`UpdateUserRequest`)

```json
{
  "status": "string (optional)",
  "role": "string (optional)"
}
```

Response (`UpdateResponse`) — returns the updated private user in `data`.

### PATCH `/identity/v1/users/me` (protected)

Request (`UpdateSelfRequest`)

```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "username": "string (optional)"
}
```

Response (`UpdateSelfResponse`) — returns the updated private user in `data`.

### POST `/identity/v1/users/register` (public)

Request (`RegisterRequest`)

```json
{
  "first_name": "string",
  "last_name": "string",
  "username": "string",
  "mobile": "string",
  "password": "string",
  "random": "string"
}
```

Response (`RegisterResponse`) — returns the created private user in `data`.

### DELETE `/identity/v1/users/{id}` (protected)

Response (`DeleteResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Delete Successful | …"
}
```

### DELETE `/identity/v1/users/me` (protected)

Response (`DeleteSelfResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Delete Successful | …"
}
```

### POST `/identity/v1/users/me/profile` (protected, multipart/form-data)

Form fields:
- `file`: the image file

Response (`UploadProfileResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Upload Profile Successful | …",
  "data": "string (URL)"
}
```

### POST `/identity/v1/users/check-mobile` (public)

Request (`CheckMobileRequest`)

```json
{
  "mobile": "string"
}
```

Response (`CheckMobileResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Check Mobile Successful | …",
  "data": true
}
```

### POST `/identity/v1/users/{followee_id}/follow` (protected)

Response (`FollowResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Follow Successful | …"
}
```

### DELETE `/identity/v1/users/{followee_id}/follow` (protected)

Response (`UnfollowResponse`)

```json
{
  "code": "00 | 4xxx | 5xxx",
  "success": true,
  "message": "Unfollow Successful | …"
}
```


# Authentication API Documentation

## Overview

The authentication module handles user registration, login, token management, password reset, and user account operations. It uses JWT tokens for authentication with access and refresh token patterns.

## Security Features

- Argon2 password hashing
- JWT with HS256 algorithm
- Access tokens (15min expiry)
- Refresh tokens (7 days expiry)
- Password strength validation
- Email format validation
- HTTP-only cookies for tokens
- Session management

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

---

## API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`  
**Authentication:** None (Public)  
**Description:** Create a new user account with automatic profile creation.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "user" // Optional: "user" | "admin"
}
```

#### Success Response (200)

```json
{
  "message": "User Created",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

```json
// 400 - Missing fields
{ "message": "Missing email or password" }

// 400 - Invalid email
{ "message": "Invalid email format" }

// 400 - Weak password
{ "message": "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number" }

// 400 - Password mismatch
{ "message": "Passwords do not match" }

// 500 - Server error
{ "message": "Failed to create user: <error details>" }
```

#### Test Example

```bash
# Register new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'

# Expected: 200 with JWT token
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`  
**Authentication:** None (Public)  
**Description:** Authenticate user and receive access/refresh tokens.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Success Response (200)

```json
{
  "message": "Login successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**

- `access_token` (HTTP-only, 15min)
- `refresh_token` (HTTP-only, 7 days)

#### Error Responses

```json
// 400 - Invalid email format
{ "message": "Invalid email" }

// 401 - Invalid credentials (user not found OR wrong password)
{ "message": "Invalid credentials" }

// 500 - Server error
{ "message": "<error details>" }
```

#### Test Example

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123"
  }'

# Save token for subsequent requests
TOKEN=$(jq -r '.token' response.json)
```

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`  
**Authentication:** Refresh Token (Cookie or Body)  
**Description:** Get a new access token using refresh token.

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200)

```json
{
  "message": "Token refreshed",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

```json
// 400 - Missing token
{ "message": "Refresh token is required" }

// 401 - Invalid token
{ "message": "Invalid refresh token" }

// 404 - User not found
{ "message": "User not found" }

// 401 - Token doesn't match
{ "message": "Invalid refresh token" }
```

#### Test Example

```bash
# Refresh token
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

---

### 4. Logout User

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Bearer Token (Required)  
**Description:** Invalidate user session and clear refresh token.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
{
  "message": "Logout successfully"
}
```

#### Error Responses

```json
// 401 - Missing/invalid token
{ "message": "Missing token" }
{ "message": "Invalid token" }

// 404 - User not found
{ "message": "Not Found" }
```

#### Test Example

```bash
# Logout
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`  
**Authentication:** None (Public)  
**Description:** Request password reset email with reset link.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Success Response (200)

```json
{
  "message": "Reset password link sent to your email"
}
```

#### Error Responses

```json
// 400 - Invalid email
{ "message": "Invalid email" }

// 404 - User not found
{ "message": "User not found" }

// 500 - Email send failed
{ "message": "Failed to send email" }
```

#### Test Example

```bash
# Request password reset
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com"
  }'

# Check email for reset link
# Link format: http://frontend-url/resetpassword?token=<reset_token>
```

---

### 6. Reset Password

**Endpoint:** `POST /api/auth/reset-password`  
**Authentication:** Reset Token (Query Parameter)  
**Description:** Set new password using reset token from email.

#### Request Body

```json
{
  "password": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

#### Query Parameters

- `token` - Reset token from email link

#### Success Response (200)

```json
{
  "message": "Password reset successfully"
}
```

#### Error Responses

```json
// 400 - Missing fields
{ "message": "Password and confirmation are required" }

// 400 - Password mismatch
{ "message": "Passwords do not match" }

// 400 - Missing token
{ "message": "Reset token is required" }

// 401 - Invalid/expired token
{ "message": "Invalid or expired reset token" }

// 404 - User not found
{ "message": "User not found" }
```

#### Test Example

```bash
# Reset password (token from email)
curl -X POST "http://localhost:4000/api/auth/reset-password?token=<reset_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass456",
    "confirmPassword": "NewSecurePass456"
  }'
```

---

### 7. Disable User Account

**Endpoint:** `PUT /api/auth/disable`  
**Authentication:** Bearer Token (Required)  
**Description:** Soft-delete user account (sets isActive=false).

#### Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "password": "SecurePass123"
}
```

#### Success Response (200)

```json
{
  "message": "Account disabled successfully"
}
```

#### Error Responses

```json
// 400 - Missing password
{ "message": "Password is required" }

// 401 - Unauthorized
{ "message": "Unauthorized" }

// 401 - Wrong password
{ "message": "Invalid password" }

// 404 - User not found
{ "message": "User not found" }
```

#### Test Example

```bash
# Disable account
curl -X POST http://localhost:4000/api/auth/disable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePass123"
  }'
```

---

## Authentication Flow

### Initial Registration/Login Flow

```
1. User registers (POST /api/auth/register)
   ↓
2. System creates user + profile
   ↓
3. Returns JWT access token
   ↓
4. Client stores token for API requests
```

### Session Refresh Flow

```
1. Access token expires (15 min)
   ↓
2. Client sends refresh token (POST /api/auth/refresh)
   ↓
3. System validates refresh token
   ↓
4. Returns new access token
   ↓
5. Client continues with new token
```

### Password Reset Flow

```
1. User requests reset (POST /api/auth/forgotpassword)
   ↓
2. System sends email with reset link
   ↓
3. User clicks link (5min expiry)
   ↓
4. User submits new password (POST /api/auth/resetpassword?token=...)
   ↓
5. System updates password
```

---

## Security Best Practices

### For Implementation

1. **Always use HTTPS in production**
2. **Set secure flag on cookies in production**
3. **Implement rate limiting** on auth endpoints (not yet implemented)
4. **Add CAPTCHA** for registration/login (not yet implemented)
5. **Log authentication events** for security audit
6. **Implement account lockout** after failed attempts (not yet implemented)

### For Testing

1. **Use strong JWT secrets** (32+ characters)
2. **Rotate secrets regularly**
3. **Never commit `.env` files**
4. **Test token expiry** scenarios
5. **Verify password hashing** (never store plain text)

---

## Environment Variables Required

```bash
# JWT Configuration
JWT_SECRET_KEY=<minimum-32-characters-secret>
JWT_REFRESH_KEY=<minimum-32-characters-secret>
RESET_PASSWORD_SECRET=<minimum-32-characters-secret>

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:3000
```

---

## Common Integration Patterns

### Frontend Authentication Hook (React Example)

```typescript
// useAuth.ts
const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setToken(null);
    localStorage.clear();
  };

  return { token, login, logout };
};
```

### API Client with Auto-Refresh

```typescript
// api.ts
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // Auto-refresh on 401
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshRes.ok) {
      const { token: newToken } = await refreshRes.json();
      localStorage.setItem("token", newToken);

      // Retry original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
  }

  return response;
}
```

---

## Testing Checklist

- [ ] Register with valid credentials
- [ ] Register with weak password (should fail)
- [ ] Register with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected endpoint with token
- [ ] Access protected endpoint without token (should fail)
- [ ] Refresh token before expiry
- [ ] Refresh with invalid token (should fail)
- [ ] Request password reset
- [ ] Reset password with valid token
- [ ] Reset password with expired token (should fail)
- [ ] Logout and verify token invalidation
- [ ] Disable account

---

## Database Schema

### User Collection

```typescript
{
  _id: ObjectId,
  userId: string (UUID),
  email: string (unique),
  password: string (argon2 hash),
  name?: string,
  role: "user" | "admin",
  isActive: boolean,
  refreshToken?: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### "JWT_SECRET_KEY must be at least 32 characters"

- Check your `.env` file has proper secrets
- Generate secure secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### "Invalid credentials" always returned

- This is intentional to prevent user enumeration
- Check database for user existence separately

### Refresh token not working

- Ensure refresh token is being stored in DB during login
- Verify token hasn't expired (7 days)
- Check JWT_REFRESH_KEY matches

### Password reset email not sending

- Verify EMAIL\_\* environment variables
- Check email provider allows SMTP
- Review server logs for email errors

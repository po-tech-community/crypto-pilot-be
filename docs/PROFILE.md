# Profile API Documentation

## Overview

The profile module manages user profile information including personal details, country association, and avatar. Each user automatically gets a profile created during registration.

## Features

- Auto-profile creation on registration
- International phone number support
- Country association
- Avatar/image storage
- Population of related data (user email, country details)

---

## API Endpoints

### 1. Get Current User Profile

**Endpoint:** `GET /api/profile/get-me`  
**Authentication:** Bearer Token (Required)  
**Description:** Retrieve authenticated user's profile with populated user and country data.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "uuid-string",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-123-4567",
    "avatar": "https://example.com/avatar.jpg",
    "countryId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "United States",
      "code": "US"
    },
    "joinDate": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:25:00.000Z"
  }
}
```

#### Error Responses

```json
// 401 - Not authenticated
{ "message": "Unauthorized" }

// 404 - Profile not found
{ "message": "Not Found" }

// 500 - Server error
{ "message": "Server Error" }
```

#### Test Example

```bash
# Get own profile
curl -X GET http://localhost:4000/api/profile/get-me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 with profile data
```

---

### 2. Get All Profiles (Admin)

**Endpoint:** `GET /api/profile`  
**Authentication:** Bearer Token (Required, Admin Role)  
**Description:** Retrieve all user profiles. Requires admin role.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "uuid-1",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1-555-123-4567",
      "countryId": {
        "name": "United States",
        "code": "US"
      },
      "joinDate": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "uuid-2",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+44-20-7946-0958",
      "countryId": {
        "name": "United Kingdom",
        "code": "GB"
      },
      "joinDate": "2024-01-16T11:00:00.000Z"
    }
  ]
}
```

#### Error Responses

```json
// 401 - Not authenticated
{ "message": "Unauthorized" }

// 500 - Server error
{ "message": "Server Error" }
```

#### Test Example

```bash
# Get all profiles (admin only)
curl -X GET http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Update Profile

**Endpoint:** `PUT /api/profile/update`  
**Authentication:** Bearer Token (Required)  
**Description:** Update authenticated user's profile information.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-987-6543",
  "avatar": "https://example.com/new-avatar.jpg",
  "countryId": "507f1f77bcf86cd799439012"
}
```

**Required Fields:**

- `firstName` - Cannot be empty
- `lastName` - Cannot be empty

**Optional Fields:**

- `phone` - International format (10-15 digits with optional formatting)
- `avatar` - URL to avatar image
- `countryId` - MongoDB ObjectId of country

#### Phone Number Format Examples

```
Valid formats:
- +1-234-567-8900
- +44 20 7946 0958
- (555) 123-4567
- 555-123-4567
- +81 3-1234-5678
- 9876543210

Invalid formats:
- 123 (too short)
- 12345678901234567 (too long)
- abc-def-ghij (non-numeric)
```

#### Success Response (200)

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "uuid-string",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-987-6543",
    "avatar": "https://example.com/new-avatar.jpg",
    "countryId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "United States",
      "code": "US"
    },
    "joinDate": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-22T09:15:00.000Z"
  }
}
```

#### Error Responses

```json
// 401 - Not authenticated
{ "message": "Unauthorized" }

// 404 - Profile not found
{ "message": "Not Found" }

// 400 - Missing required fields
{ "message": "first name or last name cannot be empty" }

// 400 - Invalid phone format
{ "message": "Invalid phone format. Must be 10-15 digits with optional formatting." }

// 500 - Server error
{ "message": "Server Error" }
```

#### Test Example

```bash
# Update profile
curl -X PUT http://localhost:4000/api/profile/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-987-6543",
    "avatar": "https://example.com/avatar.jpg",
    "countryId": "507f1f77bcf86cd799439012"
  }'

# Expected: 200 with updated profile
```

---

## Profile Lifecycle

### Auto-Creation on Registration

```
User registers → Profile automatically created with:
  - userId: from user account
  - firstName: extracted from email (before @)
  - lastName: empty string
  - joinDate: current timestamp
  - Other fields: null/undefined
```

### Update Flow

```
1. User sends PUT request with new data
   ↓
2. System validates required fields
   ↓
3. System validates phone format (if provided)
   ↓
4. System updates profile in database
   ↓
5. System fetches updated profile with populated data
   ↓
6. Returns complete profile to client
```

---

## Data Validation Rules

### First Name & Last Name

- **Required** when updating
- Cannot be empty strings
- No specific length limit (use reasonable values)

### Phone Number

- **Optional** field
- Must contain 10-15 digits (international standard)
- Can include formatting characters: `+`, `-`, `(`, `)`, spaces
- Examples of valid international formats:
  - US: `+1-234-567-8900` or `(234) 567-8900`
  - UK: `+44 20 7946 0958`
  - Japan: `+81 3-1234-5678`
  - India: `+91 98765 43210`

### Avatar

- **Optional** field
- Should be a valid URL/URI
- No format validation on backend (accepts any string)
- Recommended: Use image URLs from CDN or cloud storage

### Country ID

- **Optional** field
- Must be valid MongoDB ObjectId
- Must reference existing country in database
- Use `GET /api/countries` to get valid country IDs

---

## Integration with Other Modules

### Authentication Module

- Profile is auto-created when user registers
- Uses transaction to ensure atomic user + profile creation
- Profile links to user via `userId` field

### Country Module

- Profile can reference a country via `countryId`
- Country data is populated when fetching profile
- Shows country name and code in response

---

## Database Schema

### Profile Collection

```typescript
{
  _id: ObjectId,
  userId: string (references User.userId),
  firstName: string,
  lastName: string,
  phone?: string,
  avatar?: string,
  countryId?: ObjectId (references Country._id),
  joinDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `userId` - Unique index for fast lookups
- `countryId` - Index for country queries

---

## Frontend Integration Example

### React Profile Component

```typescript
import { useState, useEffect } from "react";

interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  countryId: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("/api/profile/get-me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setProfile(data.data);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const res = await fetch("/api/profile/update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const data = await res.json();
      setProfile(data.data);
      alert("Profile updated successfully!");
    } else {
      const error = await res.json();
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          updateProfile({
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            phone: formData.get("phone") as string,
            avatar: formData.get("avatar") as string,
          });
        }}
      >
        <input
          name="firstName"
          defaultValue={profile?.firstName}
          placeholder="First Name"
          required
        />
        <input
          name="lastName"
          defaultValue={profile?.lastName}
          placeholder="Last Name"
          required
        />
        <input
          name="phone"
          defaultValue={profile?.phone}
          placeholder="+1-555-123-4567"
          pattern="[\d\s()+-]+"
        />
        <input
          name="avatar"
          defaultValue={profile?.avatar}
          placeholder="Avatar URL"
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Get profile after registration (auto-created)
- [ ] Update profile with all fields
- [ ] Update profile with only required fields
- [ ] Update with invalid phone (should fail)
- [ ] Update with empty firstName (should fail)
- [ ] Update with valid international phone numbers
- [ ] Get all profiles (admin)
- [ ] Verify country population works
- [ ] Test with non-existent countryId
- [ ] Test without authentication (should fail)

---

## Common Use Cases

### 1. Complete Profile After Registration

```bash
# User registers, gets token, then completes profile
curl -X PUT http://localhost:4000/api/profile/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "phone": "+1-555-234-5678",
    "countryId": "507f1f77bcf86cd799439012"
  }'
```

### 2. Update Avatar Only

```bash
# Update just the avatar field
curl -X PUT http://localhost:4000/api/profile/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "avatar": "https://cdn.example.com/new-avatar.png"
  }'
```

### 3. Change Country

```bash
# Update country after user relocates
curl -X PUT http://localhost:4000/api/profile/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "countryId": "507f1f77bcf86cd799439099"
  }'
```

---

## Troubleshooting

### Profile not found after registration

- Check transaction completed successfully
- Verify profile was created in database
- Look for errors in server logs during registration

### Phone validation failing

- Ensure phone has 10-15 digits (count only numbers)
- Remove any special characters except: `+`, `-`, `(`, `)`, spaces
- Test with simple format first: `1234567890`

### Country not populating

- Verify countryId exists in countries collection
- Check populate options in controller
- Ensure country module is working

### Can't update profile

- Verify authentication token is valid
- Check required fields (firstName, lastName) are provided
- Review server logs for specific error

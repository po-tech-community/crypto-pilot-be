# Country API Documentation

## Overview

The country module manages country data for user profile associations. It provides country names and codes for international user support.

## Features

Country listing  
Country code lookup  
Bulk country creation  
Profile association

---

## API Endpoints

### 1. Get All Countries

**Endpoint:** `GET /api/countries`  
**Authentication:** Bearer Token (Required)  
**Description:** Retrieve list of all available countries.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "United States",
    "code": "US"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "United Kingdom",
    "code": "GB"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Canada",
    "code": "CA"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Australia",
    "code": "AU"
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Japan",
    "code": "JP"
  }
]
```

#### Error Responses

```json
// 500 - Server error
{ "message": "Failed to get countries" }
```

#### Test Example

```bash
# Get all countries
curl -X GET http://localhost:4000/api/countries \
  -H "Authorization: Bearer $TOKEN"

# Use in dropdown
# countries.map(c => <option value={c._id}>{c.name}</option>)
```

---

### 2. Create Single Country

**Endpoint:** `POST /api/countries`  
**Authentication:** Bearer Token (Required - Admin recommended)  
**Description:** Add a new country to the database.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "name": "Germany",
  "code": "DE"
}
```

**Required Fields:**

- `name` - Full country name
- `code` - ISO 3166-1 alpha-2 code (2 letters)

#### Success Response (201)

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "name": "Germany",
  "code": "DE"
}
```

#### Error Responses

```json
// 500 - Duplicate or error
{ "message": "Failed to create countries" }
```

#### Test Example

```bash
curl -X POST http://localhost:4000/api/countries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Germany",
    "code": "DE"
  }'
```

---

### 3. Create Multiple Countries (Bulk)

**Endpoint:** `POST /api/countries/bulk`  
**Authentication:** Bearer Token (Required - Admin recommended)  
**Description:** Add multiple countries at once.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
[
  { "name": "France", "code": "FR" },
  { "name": "Italy", "code": "IT" },
  { "name": "Spain", "code": "ES" },
  { "name": "Netherlands", "code": "NL" },
  { "name": "Sweden", "code": "SE" }
]
```

#### Success Response (201)

```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "name": "France",
    "code": "FR"
  },
  {
    "_id": "507f1f77bcf86cd799439022",
    "name": "Italy",
    "code": "IT"
  },
  {
    "_id": "507f1f77bcf86cd799439023",
    "name": "Spain",
    "code": "ES"
  },
  {
    "_id": "507f1f77bcf86cd799439024",
    "name": "Netherlands",
    "code": "NL"
  },
  {
    "_id": "507f1f77bcf86cd799439025",
    "name": "Sweden",
    "code": "SE"
  }
]
```

#### Error Responses

```json
// 500 - Some may fail if duplicates exist
{ "message": "Failed to create countries or some countries already exist." }
```

#### Test Example

```bash
curl -X POST http://localhost:4000/api/countries/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"name": "France", "code": "FR"},
    {"name": "Italy", "code": "IT"},
    {"name": "Spain", "code": "ES"}
  ]'
```

---

## Common Country Codes (ISO 3166-1 alpha-2)

### North America

- `US` - United States
- `CA` - Canada
- `MX` - Mexico

### Europe

- `GB` - United Kingdom
- `DE` - Germany
- `FR` - France
- `IT` - Italy
- `ES` - Spain
- `NL` - Netherlands
- `SE` - Sweden
- `NO` - Norway
- `DK` - Denmark
- `FI` - Finland

### Asia Pacific

- `JP` - Japan
- `CN` - China
- `KR` - South Korea
- `IN` - India
- `AU` - Australia
- `NZ` - New Zealand
- `SG` - Singapore
- `HK` - Hong Kong
- `TH` - Thailand
- `VN` - Vietnam

### Middle East

- `AE` - United Arab Emirates
- `SA` - Saudi Arabia
- `IL` - Israel
- `TR` - Turkey

### South America

- `BR` - Brazil
- `AR` - Argentina
- `CL` - Chile
- `CO` - Colombia

### Africa

- `ZA` - South Africa
- `NG` - Nigeria
- `EG` - Egypt
- `KE` - Kenya

---

## Database Schema

```typescript
{
  _id: ObjectId,
  name: string (unique),
  code: string (unique, 2-letter ISO code)
}
```

### Indexes

- `name` - Unique index
- `code` - Unique index

---

## Usage with Profile

When updating a user profile, reference country by `_id`:

```bash
# 1. Get countries to find ID
curl -X GET http://localhost:4000/api/countries \
  -H "Authorization: Bearer $TOKEN"

# 2. Update profile with country ID
curl -X PUT http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "countryId": "507f1f77bcf86cd799439011"
  }'
```

---

## Frontend Integration

### Country Selector Component

```typescript
import { useEffect, useState } from "react";

interface Country {
  _id: string;
  name: string;
  code: string;
}

function CountrySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (countryId: string) => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    fetch("/api/countries", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCountries(data));
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Country</option>
      {countries.map((country) => (
        <option key={country._id} value={country._id}>
          {country.name} ({country.code})
        </option>
      ))}
    </select>
  );
}
```

### Country Flag Display

```typescript
function CountryFlag({ code }: { code: string }) {
  // Using flag emoji (may not work on all platforms)
  const flagEmoji = code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");

  return <span className="flag">{flagEmoji}</span>;
}

// Or use flag icon library
import ReactCountryFlag from "react-country-flag";

function CountryDisplay({ code, name }: { code: string; name: string }) {
  return (
    <div>
      <ReactCountryFlag countryCode={code} svg />
      <span>{name}</span>
    </div>
  );
}
```

---

## Initial Database Seeding

### Seed Common Countries

```bash
curl -X POST http://localhost:4000/api/countries/bulk \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"name": "United States", "code": "US"},
    {"name": "United Kingdom", "code": "GB"},
    {"name": "Canada", "code": "CA"},
    {"name": "Australia", "code": "AU"},
    {"name": "Germany", "code": "DE"},
    {"name": "France", "code": "FR"},
    {"name": "Japan", "code": "JP"},
    {"name": "China", "code": "CN"},
    {"name": "India", "code": "IN"},
    {"name": "Brazil", "code": "BR"},
    {"name": "Mexico", "code": "MX"},
    {"name": "Spain", "code": "ES"},
    {"name": "Italy", "code": "IT"},
    {"name": "Netherlands", "code": "NL"},
    {"name": "Sweden", "code": "SE"},
    {"name": "Norway", "code": "NO"},
    {"name": "Denmark", "code": "DK"},
    {"name": "Finland", "code": "FI"},
    {"name": "South Korea", "code": "KR"},
    {"name": "Singapore", "code": "SG"},
    {"name": "Hong Kong", "code": "HK"},
    {"name": "New Zealand", "code": "NZ"},
    {"name": "United Arab Emirates", "code": "AE"},
    {"name": "Saudi Arabia", "code": "SA"},
    {"name": "Israel", "code": "IL"},
    {"name": "Turkey", "code": "TR"},
    {"name": "South Africa", "code": "ZA"},
    {"name": "Argentina", "code": "AR"},
    {"name": "Chile", "code": "CL"},
    {"name": "Colombia", "code": "CO"}
  ]'
```

---

## Testing Checklist

- [ ] Get all countries
- [ ] Create single country
- [ ] Create duplicate country (should handle gracefully)
- [ ] Bulk create countries
- [ ] Update profile with country
- [ ] Get profile with populated country
- [ ] Invalid country ID in profile (should handle)

---

## Production Considerations

### Security

- [ ] Limit create/bulk endpoints to admins only
- [ ] Implement rate limiting
- [ ] Validate country code format (2 uppercase letters)

### Performance

- [ ] Cache country list (rarely changes)
- [ ] Consider CDN for static country data

### Data Quality

- [ ] Use official ISO 3166-1 alpha-2 codes
- [ ] Keep names in English (or support i18n)
- [ ] Regular updates for new countries/changes

---

## Complete Country List Script

```javascript
// seed-countries.js
const countries = [
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  // ... all 195+ countries
  { name: "Zimbabwe", code: "ZW" },
];

async function seedCountries() {
  const res = await fetch("http://localhost:4000/api/countries/bulk", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(countries),
  });

  console.log("Seeded", (await res.json()).length, "countries");
}

seedCountries();
```

---

## Future Enhancements

- [ ] Country search/filter endpoint
- [ ] Region/continent grouping
- [ ] Multi-language support
- [ ] Currency association
- [ ] Timezone information
- [ ] Phone code prefix
- [ ] Flag image URLs
- [ ] Regulatory status (crypto-friendly/restricted)

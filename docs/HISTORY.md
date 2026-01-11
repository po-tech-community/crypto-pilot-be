# Transaction History API Documentation

## Overview

The history module tracks all user transactions and activities on the platform, providing a complete audit trail for deposits, withdrawals, trades, and transfers.

## Features

✅ Transaction logging  
✅ Activity tracking  
✅ Historical queries  
✅ Account-specific filtering  
✅ CRUD operations

---

## API Endpoints

### 1. List Transaction History

**Endpoint:** `GET /api/history`  
**Authentication:** None (or optional filtering)  
**Description:** Retrieve transaction history, optionally filtered by account.

#### Query Parameters

- `accountId` - Filter by specific account/user ID (optional)

#### Success Response (200)

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "account": "507f1f77bcf86cd799439020",
    "type": "DEPOSIT",
    "asset": "BTC",
    "amount": 0.5,
    "price": 45000,
    "createdAt": "2024-01-22T10:00:00.000Z",
    "updatedAt": "2024-01-22T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "account": "507f1f77bcf86cd799439020",
    "type": "TRADE",
    "asset": "ETH",
    "amount": 2.0,
    "price": 3000,
    "createdAt": "2024-01-22T11:30:00.000Z",
    "updatedAt": "2024-01-22T11:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "account": "507f1f77bcf86cd799439020",
    "type": "WITHDRAWAL",
    "asset": "BTC",
    "amount": 0.1,
    "price": 45500,
    "createdAt": "2024-01-22T14:00:00.000Z",
    "updatedAt": "2024-01-22T14:00:00.000Z"
  }
]
```

**Transaction Types:**

- `DEPOSIT` - Crypto deposit to platform
- `WITHDRAWAL` - Crypto withdrawal from platform
- `TRADE` - Buy/sell order execution
- `TRANSFER` - Internal transfer

#### Test Example

```bash
# Get all history
curl -X GET http://localhost:4000/api/history

# Get history for specific account
curl -X GET "http://localhost:4000/api/history?accountId=507f1f77bcf86cd799439020"
```

---

### 2. Get History Entry by ID

**Endpoint:** `GET /api/history/:id`  
**Authentication:** None  
**Description:** Retrieve specific transaction details.

#### Success Response (200)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "account": "507f1f77bcf86cd799439020",
  "type": "DEPOSIT",
  "asset": "BTC",
  "amount": 0.5,
  "price": 45000,
  "createdAt": "2024-01-22T10:00:00.000Z",
  "updatedAt": "2024-01-22T10:00:00.000Z"
}
```

#### Error Responses

```json
// 404 - Not found or invalid ID
{ "message": "Not found" }
```

#### Test Example

```bash
curl -X GET http://localhost:4000/api/history/507f1f77bcf86cd799439011
```

---

### 3. Create History Entry

**Endpoint:** `POST /api/history`  
**Authentication:** None (should be protected in production)  
**Description:** Create a new transaction history entry.

#### Request Body

```json
{
  "accountId": "507f1f77bcf86cd799439020",
  "type": "DEPOSIT",
  "asset": "BTC",
  "amount": 0.5,
  "price": 45000
}
```

**Required Fields:**

- `accountId` - Valid MongoDB ObjectId
- `type` - Transaction type (DEPOSIT, WITHDRAWAL, TRADE, TRANSFER)
- `asset` - Asset symbol (BTC, ETH, SOL, BNB)
- `amount` - Must be positive number

**Optional Fields:**

- `price` - Asset price at time of transaction

#### Success Response (201)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "account": "507f1f77bcf86cd799439020",
  "type": "DEPOSIT",
  "asset": "BTC",
  "amount": 0.5,
  "price": 45000,
  "createdAt": "2024-01-22T10:00:00.000Z",
  "updatedAt": "2024-01-22T10:00:00.000Z"
}
```

#### Error Responses

```json
// 400 - Invalid amount
{ "message": "Amount must be positive" }

// 400 - Invalid account ID
{ "message": "Invalid accountId" }

// 500 - Server error
{ "message": "Failed to create history entry" }
```

#### Test Example

```bash
curl -X POST http://localhost:4000/api/history \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "507f1f77bcf86cd799439020",
    "type": "DEPOSIT",
    "asset": "BTC",
    "amount": 0.5,
    "price": 45000
  }'
```

---

### 4. Update History Entry

**Endpoint:** `PUT /api/history/:id`  
**Authentication:** None (should be protected in production)  
**Description:** Update an existing history entry.

#### Request Body

```json
{
  "type": "TRADE",
  "amount": 0.55,
  "price": 45500
}
```

**Updatable Fields:**

- `type` - Transaction type
- `asset` - Asset symbol
- `amount` - Transaction amount
- `price` - Price (can be set to null)

#### Success Response (200)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "account": "507f1f77bcf86cd799439020",
  "type": "TRADE",
  "asset": "BTC",
  "amount": 0.55,
  "price": 45500,
  "createdAt": "2024-01-22T10:00:00.000Z",
  "updatedAt": "2024-01-22T12:00:00.000Z"
}
```

#### Error Responses

```json
// 404 - Entry not found
{ "message": "Not found" }
```

#### Test Example

```bash
curl -X PUT http://localhost:4000/api/history/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.55,
    "price": 45500
  }'
```

---

### 5. Delete History Entry

**Endpoint:** `DELETE /api/history/:id`  
**Authentication:** None (should be protected in production)  
**Description:** Delete a history entry.

#### Success Response (204)

No content

#### Error Responses

```json
// 404 - Entry not found
{ "message": "Not found" }
```

#### Test Example

```bash
curl -X DELETE http://localhost:4000/api/history/507f1f77bcf86cd799439011
```

---

## Use Cases

### 1. User Activity Dashboard

Display user's complete transaction history:

```bash
curl -X GET "http://localhost:4000/api/history?accountId=USER_ID"
```

### 2. Audit Trail

Track all platform transactions for compliance:

```bash
curl -X GET http://localhost:4000/api/history
```

### 3. Portfolio Calculations

Calculate holdings from history:

```javascript
const history = await fetch("/api/history?accountId=USER_ID");
const deposits = history.filter((h) => h.type === "DEPOSIT");
const withdrawals = history.filter((h) => h.type === "WITHDRAWAL");

const holdings = {};
deposits.forEach((d) => {
  holdings[d.asset] = (holdings[d.asset] || 0) + d.amount;
});
withdrawals.forEach((w) => {
  holdings[w.asset] = (holdings[w.asset] || 0) - w.amount;
});
```

---

## Integration Points

### Automatic History Creation

History entries should be automatically created when:

1. **Deposit Completed**

```typescript
// In deposit watcher when status → COMPLETED
await createHistoryEntry({
  accountId: deposit.userId,
  type: "DEPOSIT",
  asset: deposit.asset,
  amount: parseFloat(deposit.amount),
  price: currentPrices[deposit.asset],
});
```

2. **Withdrawal Completed**

```typescript
// In withdraw watcher when status → COMPLETED
await createHistoryEntry({
  accountId: withdrawal.userId,
  type: "WITHDRAWAL",
  asset: withdrawal.asset,
  amount: parseFloat(withdrawal.amount),
  price: currentPrices[withdrawal.asset],
});
```

3. **Order Filled**

```typescript
// In order matching when order filled
await createHistoryEntry({
  accountId: order.userId,
  type: "TRADE",
  asset: order.asset,
  amount: order.amount,
  price: order.type === "limit" ? order.limitPrice : currentPrice,
});
```

---

## Database Schema

```typescript
{
  _id: ObjectId,
  account: ObjectId (references User/Profile),
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE" | "TRANSFER",
  asset: string,
  amount: number,
  price: number | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `account` - For user-specific queries
- `type` - For filtering by transaction type
- `createdAt` - For chronological sorting

---

## Frontend Integration

### React History Component

```typescript
import { useEffect, useState } from "react";

interface HistoryEntry {
  _id: string;
  type: string;
  asset: string;
  amount: number;
  price: number;
  createdAt: string;
}

function TransactionHistory({ accountId }: { accountId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch(`/api/history?accountId=${accountId}`)
      .then((res) => res.json())
      .then((data) => setHistory(data));
  }, [accountId]);

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Asset</th>
          <th>Amount</th>
          <th>Price</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {history.map((entry) => (
          <tr key={entry._id}>
            <td>{new Date(entry.createdAt).toLocaleString()}</td>
            <td>{entry.type}</td>
            <td>{entry.asset}</td>
            <td>{entry.amount}</td>
            <td>${entry.price?.toLocaleString()}</td>
            <td>${(entry.amount * (entry.price || 0)).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Security Recommendations

⚠️ **Current Implementation:** No authentication required  
✅ **Production Recommendations:**

1. **Add Authentication**

```typescript
router.get("/", AuthMiddleware, listHistory);
router.post("/", AuthMiddleware, createHistory);
router.put("/:id", AuthMiddleware, Authorize("admin"), updateHistory);
router.delete("/:id", AuthMiddleware, Authorize("admin"), deleteHistory);
```

2. **User Isolation**

```typescript
// Only return history for authenticated user
const history = await listHistory({ accountId: req.user.userId });
```

3. **Immutability**

- Consider making history entries immutable (no updates/deletes)
- Use soft deletes if needed
- Log all modifications for audit

---

## Testing Checklist

- [ ] List all history
- [ ] Filter by account ID
- [ ] Get specific entry by ID
- [ ] Create new entry
- [ ] Update existing entry
- [ ] Delete entry
- [ ] Invalid account ID (should fail)
- [ ] Negative amount (should fail)
- [ ] Invalid ObjectId format
- [ ] Pagination (if implemented)

---

## Future Enhancements

- [ ] Pagination support
- [ ] Date range filtering
- [ ] Asset-specific filtering
- [ ] Export to CSV
- [ ] Aggregated summaries
- [ ] Real-time updates via WebSocket
- [ ] Historical price charts
- [ ] Tax reporting features

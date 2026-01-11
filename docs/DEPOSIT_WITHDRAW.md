# Deposit & Withdraw API Documentation

## Overview

The deposit and withdraw modules handle cryptocurrency deposits and withdrawals with real-time blockchain monitoring via WebSocket watchers. The system generates unique addresses for deposits and tracks transaction confirmations.

## Features

- Multi-network support (Bitcoin, Ethereum, Solana, BNB, BSC)
- Unique address generation per deposit
- Real-time transaction monitoring
- Confirmation tracking
- Auto-completion on sufficient confirmations
- WebSocket watchers for blockchain updates
- Status management (PENDING, COMPLETED, FAILED)

---

## Deposit API

### 1. Create Deposit Request

**Endpoint:** `POST /api/deposit`  
**Authentication:** Bearer Token (Required)  
**Description:** Create a deposit request and receive a unique address to send funds to.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "asset": "BTC",
  "network": "bitcoin",
  "amount": "0.1" // Optional: expected amount
}
```

**Supported Assets:** `BTC`, `ETH`, `SOL`, `BNB`  
**Supported Networks:** `bitcoin`, `ethereum`, `solana`, `BNB`, `bsc`

#### Success Response (201)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "uuid-string",
  "asset": "BTC",
  "network": "bitcoin",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "amount": "0.1",
  "txHash": null,
  "confirmations": 0,
  "status": "PENDING",
  "createdAt": "2024-01-22T10:00:00.000Z",
  "updatedAt": "2024-01-22T10:00:00.000Z"
}
```

**Note:** If user already has a PENDING deposit for the same network, returns existing deposit instead of creating new one.

#### Error Responses

```json
// 400 - Missing asset
{ "message": "asset is required" }

// 400 - Missing network
{ "message": "network is required" }

// 400 - Invalid amount format
{ "message": "amount must be a positive decimal string" }

// 500 - Server error
{ "message": "Internal server error" }
```

#### Test Example

```bash
# Create deposit request
curl -X POST http://localhost:4000/api/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "BTC",
    "network": "bitcoin",
    "amount": "0.5"
  }'

# Save the address to send BTC to
# The watcher will automatically detect the transaction
```

---

### 2. Get Deposit by ID

**Endpoint:** `GET /api/deposit/:id`  
**Authentication:** Bearer Token (Required)  
**Description:** Retrieve specific deposit details.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "uuid-string",
  "asset": "BTC",
  "network": "bitcoin",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "amount": "0.5",
  "txHash": "abc123def456...",
  "confirmations": 3,
  "status": "PENDING",
  "createdAt": "2024-01-22T10:00:00.000Z",
  "updatedAt": "2024-01-22T10:15:00.000Z"
}
```

#### Error Responses

```json
// 404 - Deposit not found
{ "message": "Deposit not found" }

// 500 - Server error
{ "message": "Internal server error" }
```

#### Test Example

```bash
# Get deposit status
curl -X GET http://localhost:4000/api/deposit/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. List User Deposits

**Endpoint:** `GET /api/deposit`  
**Authentication:** Bearer Token (Required)  
**Description:** Get all deposits for authenticated user with pagination.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Query Parameters

- `limit` - Max results per page (1-200, default: 50)
- `offset` - Skip N results (default: 0)
- `status` - Filter by status: PENDING, COMPLETED, FAILED
- `asset` - Filter by asset: BTC, ETH, SOL, BNB
- `network` - Filter by network

#### Success Response (200)

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "uuid-string",
    "asset": "BTC",
    "network": "bitcoin",
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "amount": "0.5",
    "txHash": "abc123...",
    "confirmations": 6,
    "status": "COMPLETED",
    "createdAt": "2024-01-22T10:00:00.000Z",
    "updatedAt": "2024-01-22T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "uuid-string",
    "asset": "ETH",
    "network": "ethereum",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "2.0",
    "txHash": null,
    "confirmations": 0,
    "status": "PENDING",
    "createdAt": "2024-01-22T11:00:00.000Z",
    "updatedAt": "2024-01-22T11:00:00.000Z"
  }
]
```

#### Test Example

```bash
# Get all deposits
curl -X GET "http://localhost:4000/api/deposit?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Get only completed deposits
curl -X GET "http://localhost:4000/api/deposit?status=COMPLETED" \
  -H "Authorization: Bearer $TOKEN"

# Get BTC deposits only
curl -X GET "http://localhost:4000/api/deposit?asset=BTC" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Withdraw API

### 1. Create Withdrawal Request

**Endpoint:** `POST /api/withdraw`  
**Authentication:** Bearer Token (Required)  
**Description:** Request cryptocurrency withdrawal to external address.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "asset": "BTC",
  "network": "bitcoin",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "amount": "0.1",
  "fee": "0.0001", // Optional, defaults to "1"
  "memo": "" // Optional, required for some networks (e.g., BNB destination tag)
}
```

**Required Fields:**

- `asset` - Cryptocurrency symbol
- `network` - Network to withdraw on
- `address` - Destination address
- `amount` - Withdrawal amount (decimal string)

**Optional Fields:**

- `fee` - Network fee (defaults to "1")
- `memo` - Memo/destination tag for certain networks

#### Success Response (201)

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "uuid-string",
  "asset": "BTC",
  "network": "bitcoin",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "amount": "0.1",
  "fee": "0.0001",
  "memo": "",
  "txHash": "",
  "confirmations": 0,
  "status": "PENDING",
  "createdAt": "2024-01-22T12:00:00.000Z",
  "updatedAt": "2024-01-22T12:00:00.000Z"
}
```

#### Error Responses

```json
// 400 - Validation error
{ "message": "Validation error details" }

// 500 - Server error
{ "message": "Internal server error" }
```

#### Test Example

```bash
# Create withdrawal
curl -X POST http://localhost:4000/api/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "BTC",
    "network": "bitcoin",
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "amount": "0.1",
    "fee": "0.0001"
  }'
```

---

### 2. Get Withdrawal by ID

**Endpoint:** `GET /api/withdraw/:id`  
**Authentication:** Bearer Token (Required)  
**Description:** Retrieve specific withdrawal details.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "uuid-string",
  "asset": "BTC",
  "network": "bitcoin",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "amount": "0.1",
  "fee": "0.0001",
  "txHash": "def456abc789...",
  "confirmations": 2,
  "status": "PENDING",
  "createdAt": "2024-01-22T12:00:00.000Z",
  "updatedAt": "2024-01-22T12:10:00.000Z"
}
```

#### Test Example

```bash
# Check withdrawal status
curl -X GET http://localhost:4000/api/withdraw/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. List User Withdrawals

**Endpoint:** `GET /api/withdraw`  
**Authentication:** Bearer Token (Required)  
**Description:** Get all withdrawals for authenticated user with pagination.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Query Parameters

- `limit` - Max results (1-200, default: 50)
- `offset` - Skip N results (default: 0)
- `status` - Filter by status
- `asset` - Filter by asset
- `network` - Filter by network

#### Success Response (200)

```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "uuid-string",
    "asset": "BTC",
    "network": "bitcoin",
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "amount": "0.1",
    "fee": "0.0001",
    "txHash": "def456abc789...",
    "confirmations": 6,
    "status": "COMPLETED",
    "createdAt": "2024-01-22T12:00:00.000Z",
    "updatedAt": "2024-01-22T12:20:00.000Z"
  }
]
```

#### Test Example

```bash
# Get all withdrawals
curl -X GET "http://localhost:4000/api/withdraw?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Get pending withdrawals
curl -X GET "http://localhost:4000/api/withdraw?status=PENDING" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Real-Time Monitoring (WebSocket Watchers)

### Deposit Watcher

The deposit watcher runs continuously to monitor blockchain transactions for pending deposits.

#### How It Works

```
1. Watcher polls every 30 seconds
   ↓
2. Finds all PENDING deposits
   ↓
3. For each deposit address, checks blockchain
   ↓
4. If transaction found:
   - Updates txHash
   - Updates confirmations
   ↓
5. If confirmations >= required:
   - Status → COMPLETED
   - Broadcasts update (future: WebSocket event)
```

#### Required Confirmations by Network

- **Bitcoin:** 6 confirmations (~60 min)
- **Ethereum:** 12 confirmations (~3 min)
- **Solana:** 32 confirmations (~15 sec)
- **BNB:** 1 confirmation (~4 sec)
- **BSC:** 15 confirmations (~45 sec)

#### Monitoring Example

```bash
# Create deposit and watch logs
curl -X POST http://localhost:4000/api/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","network":"bitcoin","amount":"0.1"}'

# Server logs will show:
# "🔍 Checking deposit 507f... on Bitcoin"
# "Transaction found: abc123..."
# "Confirmations: 3/6"
# "Deposit completed: 507f..."
```

### Withdraw Watcher

The withdraw watcher monitors pending withdrawals and updates their status.

#### How It Works

```
1. Watcher polls every 30 seconds
   ↓
2. Finds all PENDING withdrawals
   ↓
3. For each withdrawal txHash, checks blockchain
   ↓
4. Updates confirmation count
   ↓
5. If confirmations >= required:
   - Status → COMPLETED
```

---

## WebSocket Events (Future Enhancement)

Currently watchers update the database silently. To enable real-time client updates, you can add WebSocket broadcasting:

### Proposed Events

```typescript
// Deposit events
socket.emit("depositDetected", {
  depositId: string,
  txHash: string,
  amount: string,
  confirmations: number,
});

socket.emit("depositConfirmation", {
  depositId: string,
  confirmations: number,
  required: number,
});

socket.emit("depositCompleted", {
  depositId: string,
  txHash: string,
  amount: string,
});

// Withdrawal events
socket.emit("withdrawalConfirmation", {
  withdrawalId: string,
  confirmations: number,
});

socket.emit("withdrawalCompleted", {
  withdrawalId: string,
  txHash: string,
});
```

### Client-Side Listening (Example)

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

// Listen for deposit updates
socket.on("depositDetected", (data) => {
  console.log("Transaction detected!", data);
  // Update UI: show transaction found
});

socket.on("depositConfirmation", (data) => {
  console.log(`Confirmations: ${data.confirmations}/${data.required}`);
  // Update UI: show progress bar
});

socket.on("depositCompleted", (data) => {
  console.log("Deposit completed!", data);
  // Update UI: show success, refresh balance
});
```

---

## Network Configuration

### Supported Networks

```typescript
{
  bitcoin: {
    addressFormat: "btc",
    requiredConfirmations: 6,
    estimatedBlockTimeSec: 600  // ~10 minutes
  },
  ethereum: {
    addressFormat: "evm",
    requiredConfirmations: 12,
    estimatedBlockTimeSec: 15
  },
  bsc: {
    addressFormat: "evm",
    requiredConfirmations: 15,
    estimatedBlockTimeSec: 3
  },
  BNB: {
    addressFormat: "BNB",
    requiredConfirmations: 1,
    estimatedBlockTimeSec: 4
  },
  solana: {
    addressFormat: "solana",
    requiredConfirmations: 32,
    estimatedBlockTimeSec: 0.4
  }
}
```

---

## Address Generation

Each deposit generates a unique address based on the network type:

### Bitcoin (BTC)

- Format: Legacy P2PKH
- Example: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
- Generated using `bitcoinjs-lib` and `ecpair`

### Ethereum/BSC (ETH/BNB)

- Format: EVM-compatible
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- Generated using `ethers.js`

### Solana (SOL)

- Format: Base58 encoded
- Example: `DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK`
- Generated using `@solana/web3.js`

### BNB (Ripple)

- Format: Base58 with checksum
- Example: `rN7n7otQDd6FczFgLdlqtyMVrn3HMfeeHH`
- Note: May require destination tag (memo)

---

## Testing Checklist

### Deposit Testing

- [ ] Create deposit request
- [ ] Verify unique address generated
- [ ] Check existing PENDING deposit returns same
- [ ] Send test transaction to address
- [ ] Monitor watcher logs for detection
- [ ] Verify confirmation count updates
- [ ] Confirm auto-completion at required confirmations
- [ ] Test with different networks
- [ ] Test pagination on list endpoint

### Withdrawal Testing

- [ ] Create withdrawal request
- [ ] Verify status starts as PENDING
- [ ] Check watcher monitors transaction
- [ ] Verify confirmation tracking
- [ ] Confirm auto-completion
- [ ] Test with memo/destination tag (BNB)
- [ ] Test validation errors
- [ ] Test list filters

---

## Troubleshooting

### Deposit not detecting transaction

- Check address is correct
- Verify transaction is confirmed on blockchain
- Check watcher is running (`startDepositWatcher()` in server.ts)
- Review watcher logs for errors
- Ensure network configuration is correct

### Withdrawal stuck in PENDING

- Verify transaction was broadcast to network
- Check txHash is valid
- Ensure watcher is running
- Review blockchain explorer for transaction status

### Address generation failing

- Check required libraries are installed (bitcoinjs-lib, @solana/web3.js, etc.)
- Verify network parameter matches supported networks
- Review server logs for generation errors

### Watcher not running

- Check server startup logs for "🔍 Deposit watcher started" / "💸 Withdraw watcher started"
- Verify no errors during initialization
- Restart server if needed

---

## Production Considerations

### Security

- [ ] Validate withdrawal addresses format
- [ ] Implement withdrawal limits per user/day
- [ ] Add 2FA for withdrawals
- [ ] Whitelist withdrawal addresses
- [ ] Implement cold wallet for majority of funds
- [ ] Add manual approval for large withdrawals

### Performance

- [ ] Index database by userId, status, network
- [ ] Cache active deposit addresses
- [ ] Batch blockchain queries
- [ ] Use WebSocket for instant updates
- [ ] Implement rate limiting on create endpoints

### Monitoring

- [ ] Alert on failed watchers
- [ ] Track average confirmation times
- [ ] Monitor stuck transactions
- [ ] Log all deposit/withdrawal events
- [ ] Dashboard for pending transactions

---

## Environment Variables

```bash
# Blockchain API endpoints (if using external services)
BITCOIN_RPC_URL=http://bitcoin-node:8332
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BNB_RPC_URL=https://s1.ripple.com:51234

# Optional: blockchain explorer APIs
BLOCKCYPHER_TOKEN=your_token
ETHERSCAN_API_KEY=your_key
```

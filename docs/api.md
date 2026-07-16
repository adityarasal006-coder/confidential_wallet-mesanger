# API Documentation

## REST Endpoints

### 1. Authentication

**POST `/api/users/auth`**
Authenticates a user via Web3 Wallet Signature.

- **Request Body:**
  ```json
  {
    "address": "0x123...",
    "signature": "0xabc...",
    "message": "Sign in to Confidential Messenger..."
  }
  ```
- **Response (200):**
  ```json
  {
    "token": "jwt_token_string",
    "user": { "id": "uuid", "walletAddress": "0x123..." }
  }
  ```

### 2. User Discovery

**GET `/api/users/search?q={address}`**
Finds a user's public identity by wallet address.

- **Response (200):**
  ```json
  {
    "id": "uuid",
    "walletAddress": "0x123...",
    "stealthPub": "0xpubkey"
  }
  ```

### 3. Messaging

**POST `/api/messages`**
Sends an E2EE message to a user.

- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "receiverId": "uuid",
    "content": "iv:encrypted_payload:auth_tag"
  }
  ```

**GET `/api/messages/:userId`**
Retrieves the encrypted message history between the authenticated user and another user.

## WebSockets (Socket.io)

### Connection
Connect to `ws://localhost:5000` with the JWT token in the auth payload.
```javascript
const socket = io('ws://localhost:5000', {
  auth: { token: "jwt_token_here" }
});
```

### Events Emitted (Client -> Server)
- `join` (Payload: `{ userId }`) - Subscribes the client to their personal message channel.
- `typing` (Payload: `{ receiverId }`) - Indicates the user is typing.

### Events Received (Server -> Client)
- `new_message` (Payload: `MessageObject`) - Triggered when a new encrypted message is received.
- `user_typing` - Triggered when a peer is typing.

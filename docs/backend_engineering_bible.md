# Backend Engineering Bible ⚙️

## 1. Backend Philosophy & Architecture
The backend of Confidential Messenger is the central orchestration layer. It is built to support thousands of concurrent WebSocket connections while maintaining strict server-side ignorance regarding encrypted message payloads.

### Layered Architecture
We enforce a strict separation of concerns to ensure testability and scalability:
- **API Gateway (Express Routes):** Handles incoming HTTP requests and WebSocket handshakes.
- **Middleware:** Enforces rate limiting, JWT authentication, and CORS policies.
- **Controllers:** Validates incoming payloads and routes them to the appropriate domain service.
- **Repository Layer (Prisma):** Exclusively handles interactions with the database (SQLite for MVP, PostgreSQL for production).

---

## 2. Authentication Pipeline (SIWE)
We utilize a wallet-native Sign-In with Ethereum (SIWE) pipeline, completely eliminating passwords.

### Flow:
1. **Connect & Generate Nonce:** Client connects wallet. Backend generates a cryptographic nonce and stores it against the user's session.
2. **Signature:** Client signs the nonce via MetaMask.
3. **Verification:** Backend uses `ethers.verifyMessage` to confirm the signature matches the provided wallet address.
4. **JWT Issuance:** A secure, HTTP-only JWT is issued to the client.

*Security Note: Nonces are single-use to prevent Replay Attacks.*

---

## 3. Real-Time Platform (Socket.io)
Our WebSocket architecture is designed for low-latency, real-time message delivery.

- **Authentication:** Sockets must authenticate using the same JWT provided during the HTTP handshake.
- **Connection Lifecycle:** 
  - `connection`: Client connects and joins a private room named after their wallet address.
  - `send_message`: Client emits an encrypted payload. Server persists to Prisma, then broadcasts `receive_message` to the recipient's room.
- **Server-Side Ignorance:** The backend **never** decrypts the payload. It only routes the ciphertext and associated metadata (timestamps, sender address).

---

## 4. Database Access Layer
We utilize **Prisma ORM** for type-safe database interactions.

- **Models:**
  - `User`: Stores wallet address, public keys (for ECDH), and last active timestamps.
  - `Message`: Stores the sender, receiver, and the AES-GCM encrypted ciphertext.
- **Repository Pattern:** Controllers never write raw SQL. They call Prisma methods (e.g., `prisma.message.create()`) ensuring database agnostic business logic.

---

## 5. Security & Error Handling
We deploy a unified error handling system.
- **Stack Traces:** Never exposed in production.
- **Custom Error Classes:** Errors are mapped to HTTP status codes (e.g., `401 Unauthorized`, `400 Bad Request`).
- **Validation:** All incoming request bodies are validated before reaching the controller logic.
- **Rate Limiting:** Protects the `/auth` endpoints against brute-force signature attempts.

---

## 6. Audit & Acceptance
- [x] Express Server is containerized and starts cleanly.
- [x] Wallet authentication issues secure JWTs.
- [x] Prisma successfully persists User and Message entities.
- [x] Socket.io broadcasts events in real-time.
- [x] Sensitive ciphertext is never logged or decrypted by the server.

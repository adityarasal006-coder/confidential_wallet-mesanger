# Agile User Stories

## Epic 1: Wallet Authentication & Identity

**US1.1: SIWE Authentication**
"As a Web3 User, I want to authenticate by signing a message with my wallet, so that I don't have to create or remember a password."
- **Acceptance Criteria:** User connects wallet via Wagmi. Backend issues JWT after verifying `ethers.verifyMessage`.
- **Priority:** Must Have
- **Edge Cases:** User rejects signature in MetaMask.
- **Failure Scenarios:** Signature verification fails due to chain mismatch.

**US1.2: Public Key Registration**
"As a new user, I want the system to automatically derive and store my public Meta-Key, so that other users can generate Stealth Addresses for me."
- **Acceptance Criteria:** Upon first sign-in, the client extracts the public key from the SIWE signature and registers it in the Prisma DB.
- **Priority:** Must Have

## Epic 2: E2EE Messaging

**US2.1: ECDH Key Exchange**
"As a sender, I want my client to compute a shared secret using the recipient's public key, so that my message is encrypted before it leaves my device."
- **Acceptance Criteria:** Messages are encrypted via `AES-GCM` using the `crypto` library. Ciphertext is sent to the backend.
- **Priority:** Must Have
- **Failure Scenarios:** Recipient public key is missing from the database.

**US2.2: Real-time Delivery**
"As a chat user, I want to see new messages instantly without refreshing, so that the experience feels like a modern messaging app."
- **Acceptance Criteria:** Backend emits `new_message` via Socket.io to the recipient's authenticated channel.
- **Priority:** Must Have
- **Dependencies:** Redis / Socket.io adapter.

## Epic 3: Confidential Payments (Stealth Addresses)

**US3.1: Stealth Address Generation**
"As a sender, I want the UI to automatically generate a Stealth Address when I click 'Private Transfer', so that my payment is untraceable to the recipient's main wallet."
- **Acceptance Criteria:** Client generates an ephemeral keypair and computes the destination address using elliptic curve math.
- **Priority:** Must Have

**US3.2: Smart Contract Relaying**
"As a sender, I want to broadcast the ephemeral public key to the Avalanche blockchain alongside my payment, so that the recipient can mathematically prove they own the funds."
- **Acceptance Criteria:** The `StealthRelayer.sol` contract successfully receives the AVAX and the 64-byte public key, and emits an `Announcement` event.
- **Priority:** Must Have
- **Failure Scenarios:** User rejects transaction in MetaMask; insufficient gas fees on Avalanche Fuji.

**US3.3: Stealth Event Scanning**
"As a recipient, I want my client to scan the blockchain for payments sent to me, so that I am notified when a confidential transfer arrives."
- **Acceptance Criteria:** Client parses `Announcement` events via viem/ethers. Attempts to compute the shared secret for each event.
- **Priority:** Must Have
- **Edge Cases:** Network RPC limits out the historical block query.

## Epic 4: DevOps & Scalability

**US4.1: Containerization**
"As a DevOps engineer, I want the backend and frontend to be containerized, so that they can be deployed uniformly across any cloud provider."
- **Acceptance Criteria:** `Dockerfile` and `docker-compose.yml` successfully build and network the Node.js API and Next.js UI.
- **Priority:** Must Have

**US4.2: CI/CD Automation**
"As a developer, I want my code to be tested automatically on GitHub, so that regressions are caught before hitting production."
- **Acceptance Criteria:** `.github/workflows/deploy.yml` runs `npm run build` on every push to the `main` branch.
- **Priority:** Must Have

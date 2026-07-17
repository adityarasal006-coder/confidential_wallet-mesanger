# Technical Defense (Judge FAQ)

### 1. Why Avalanche over Ethereum?
A chat application requires instant feedback to feel usable. Ethereum's 12-second block times make in-chat payments feel extremely slow. Avalanche provides sub-second finality, meaning a payment settles almost instantly, preserving the seamless UI experience of a modern messenger. Furthermore, Avalanche's Subnet architecture provides a clear roadmap for scaling this to a highly compliant, enterprise-grade private L1.

### 2. Why Stealth Addresses?
If we just used standard transactions, our messenger would just be a UI wrapper over a public block explorer, completely defeating the purpose of privacy. Stealth Addresses (ERC-5564 pattern) allow us to decouple the sender from the receiver. It's the only way to achieve financial privacy without relying on centralized, highly regulated mixers (like Tornado Cash).

### 3. How is end-to-end encryption implemented?
We use `eth-crypto` on the client side. When two users chat, their clients perform a Diffie-Hellman Key Exchange to derive a shared symmetric key (AES-256-GCM). The payload is encrypted locally in the browser memory *before* it is sent over the WebSocket. The backend only ever receives, stores, and routes ciphertext.

### 4. How do users authenticate?
We use a passwordless Sign-In with Ethereum (SIWE) pattern. The backend issues a cryptographically secure random nonce. The user must sign this nonce with their wallet (EIP-712). The backend verifies the signature against the claimed public address using `ethers.verifyMessage`. If valid, the backend issues an HTTP-only JWT.

### 5. Where are encryption keys stored?
The symmetric encryption keys are derived dynamically in-memory on the client side using the user's wallet signature and are never persisted to disk or sent over the wire. The private keys remain safely inside the user's wallet provider (e.g., MetaMask).

### 6. How are replay attacks prevented?
For authentication, the backend generates a unique, one-time `nonce` stored in the database for each login attempt. Once a signature is verified against that specific nonce, the nonce is invalidated. A captured signature cannot be reused.

### 7. What happens if the backend is compromised?
If the Node.js relay or the MongoDB database is compromised, the attacker gains absolutely nothing except heavily encrypted ciphertexts. Because the encryption keys are derived locally on the clients' devices, the attacker cannot decrypt the chat history. The financial logic is handled entirely on the Avalanche blockchain, so funds are also perfectly safe.

### 8. How would you support group chats?
Instead of 1:1 Diffie-Hellman exchanges, group chats would utilize a Double Ratchet algorithm (similar to Signal) or a sender-key protocol where each participant encrypts the symmetric group key with the public keys of all other participants.

### 9. How would this scale to millions of users?
The Node.js backend is completely stateless regarding connections. We can horizontally scale the Express servers behind a load balancer and use Redis Pub/Sub as an adapter for Socket.IO, allowing millions of concurrent WebSocket connections to broadcast ciphertexts across multiple server instances. 

### 10. How would you migrate to mainnet?
Migrating to Avalanche C-Chain Mainnet would only require changing the RPC URL and re-deploying the `StealthRelayer.sol` contract. However, our ultimate vision for mainnet is deploying this application natively onto its own Avalanche Elastic Subnet to completely isolate block space and guarantee gas fee stability.

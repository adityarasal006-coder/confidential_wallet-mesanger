# System Architecture: Confidential Messenger

## 1. High-Level Overview
Confidential Messenger is a secure Web3 communication and payment platform built on Avalanche.

```mermaid
graph TD
    Client[Next.js Client] -->|HTTPS/WSS| API[Node.js Backend]
    Client <-->|RPC| Avax[Avalanche Fuji C-Chain]
    API <--> DB[(Prisma SQLite)]
    API <--> Redis[(Redis Cache)]
    
    subgraph Web3 Layer
    Avax --> SmartContracts[StealthRelayer Contract]
    end
```

## 2. End-to-End Encryption Flow
Messages are never stored in plain text. We utilize standard public-key cryptography (ECDH + AES-GCM) to ensure privacy.

```mermaid
sequenceDiagram
    participant Alice
    participant Backend
    participant Bob

    Alice->>Backend: Fetch Bob's Public Key
    Backend-->>Alice: Bob's PubKey
    Alice->>Alice: Compute Shared Secret (ECDH)
    Alice->>Alice: Encrypt Message (AES-GCM)
    Alice->>Backend: Send Encrypted Payload
    Backend->>DB: Store Encrypted Payload
    Backend->>Bob: Emit Socket.io Event (New Message)
    Bob->>Bob: Compute Shared Secret (ECDH)
    Bob->>Bob: Decrypt Payload
```

## 3. Confidential Payment Flow (Stealth Addresses)
To prevent blockchain analysis from linking sender and receiver, payments are sent to dynamically generated one-time addresses (Stealth Addresses).

```mermaid
sequenceDiagram
    participant Sender
    participant Blockchain
    participant Receiver
    
    Sender->>Sender: Generate Ephemeral Keypair
    Sender->>Sender: Compute Stealth Address using Receiver's Stealth Meta-Key
    Sender->>Blockchain: Transfer Funds to Stealth Address
    Sender->>Blockchain: Publish Ephemeral Public Key (via Relayer Contract)
    Blockchain-->>Receiver: Contract Event Emitted
    Receiver->>Receiver: Scan Contract Events
    Receiver->>Receiver: Compute Shared Secret using Ephemeral Key
    Receiver->>Receiver: Recover Private Key for Stealth Address
    Receiver->>Blockchain: Spend Funds from Stealth Address
```

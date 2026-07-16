# Judge Q&A: Defense Manual

When pitching to technical blockchain judges, they will attempt to poke holes in the architecture. Use this guide to defend the engineering decisions of Confidential Messenger.

### 1. "If you are storing messages in a centralized SQLite/Postgres database, how is this decentralized or private?"
**Answer:** "The messaging layer is highly centralized for performance (like Signal), but it is **Trustless**. We utilize ECDH (Elliptic-Curve Diffie-Hellman) key exchange and AES-GCM encryption on the client side before the payload is ever transmitted over Socket.io. The backend database only stores ciphertexts. Even if our database was breached by a state actor, they could not read a single message without the users' private Web3 keys."

### 2. "Why not just use Tornado Cash for payments instead of Stealth Addresses?"
**Answer:** "Mixers like Tornado Cash break the link between sender and receiver by pooling funds, but they require the receiver to interact with a highly scrutinized, often legally restricted smart contract. Our Stealth Address implementation (inspired by ERC-5564) creates a completely fresh, deterministic wallet address for every single transaction. It doesn't rely on mixing pools; it relies on standard elliptic curve cryptography to hide the recipient's identity in plain sight."

### 3. "How does the recipient know they received funds to a Stealth Address if the address is random?"
**Answer:** "When the sender transfers funds, they interact with our `StealthRelayer` smart contract, which emits an event containing the Ephemeral Public Key. The recipient's client silently scans these events on the Avalanche C-Chain in the background. Using their own private key, they attempt to compute a shared secret with each Ephemeral Key. If the math checks out, they realize they own the funds at that address."

### 4. "Why Avalanche Fuji instead of Ethereum?"
**Answer:** "Stealth addresses require a lot of background event parsing. If we deployed on Ethereum, the block times and gas fees associated with the `StealthRelayer` would make this product economically unviable for everyday messaging and payments. Avalanche's sub-second finality and low fees make real-time confidential chat payments possible."

### 5. "What happens if a user loses their MetaMask private key?"
**Answer:** "Because their private key is the root of their identity and decryption, losing the key means losing access to their historical messages and any un-swept stealth addresses. This is a deliberate trade-off for true self-custody and zero-knowledge privacy. We do not have backdoor access to recover it."

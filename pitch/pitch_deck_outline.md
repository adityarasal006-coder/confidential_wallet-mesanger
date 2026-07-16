# Pitch Deck Outline

Use this structure for your 10-slide presentation at the hackathon.

### Slide 1: Title Screen
- **Project Name:** Confidential Messenger
- **Tagline:** Private Conversations. Private Payments. Powered by Avalanche.
- **Visual:** High-quality mockup of the dark-mode dashboard.

### Slide 2: The Problem
- **Statement:** Web3 is inherently public.
- **Pain Point:** Sending money to a contractor, friend, or employee reveals your entire transaction history and total net worth to them via Block Explorers.

### Slide 3: The Solution
- **Feature 1:** Signal-grade End-to-End Encrypted (E2EE) messaging.
- **Feature 2:** Confidential payments using Cryptographic Stealth Addresses.
- **UX:** Wrapped in an Apple-minimalist, Stripe-quality interface.

### Slide 4: How it Works (Encryption)
- **Visual:** Simplified diagram showing ECDH key exchange.
- **Key Takeaway:** The database only stores ciphertext. Not even the server admins can read the messages.

### Slide 5: How it Works (Payments)
- **Visual:** Flowchart of a sender generating a one-time stealth address using the recipient's meta-key.
- **Key Takeaway:** The blockchain shows funds moving to a random address. Zero link between sender and receiver.

### Slide 6: Why Avalanche?
- **Speed:** Sub-second finality is required for chat-based payments.
- **Cost:** Low fees make micro-transactions viable.
- **Future:** EVM compatibility allows us to migrate to a custom Avalanche Subnet optimized specifically for privacy primitives in the future.

### Slide 7: Tech Stack
- **Frontend:** Next.js, Tailwind, Framer Motion, Wagmi.
- **Backend:** Node.js, Socket.io, Prisma, SQLite/PostgreSQL.
- **Smart Contracts:** Hardhat, Solidity, OpenZeppelin.

### Slide 8: AI Integration
- **Feature:** AI Risk Detection.
- **Value:** Automatically warns users in chat if they are interacting with a newly created wallet, preventing phishing and rug pulls.

### Slide 9: Business Model & Roadmap
- **Monetization:** Premium features for enterprise DAOs (payroll privacy).
- **Roadmap:** Mobile app (React Native), cross-chain stealth payments, Decentralized Relayer Network.

### Slide 10: Ask & Team
- **Call to Action:** "Scan the QR code to try the live demo."
- **Team Info:** Contact details and GitHub repo link.

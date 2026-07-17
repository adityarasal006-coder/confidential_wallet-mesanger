# Pitch Deck Outline (10-12 Slides)

**Slide 1: Title Slide**
- **Title**: Confidential Wallet-to-Wallet Messenger
- **Subtitle**: Private Conversations. Private Payments. Powered by Avalanche.
- **Visual**: Minimalist logo / Landing page mockup.

**Slide 2: The Problem (Web3 is too Public)**
- **Point 1**: Every interaction on a public block explorer links your financial identity to others permanently.
- **Point 2**: Traditional encrypted messengers (Signal/WhatsApp) lack native financial rails.
- **Conclusion**: Users are forced to choose between financial utility and personal privacy.

**Slide 3: Current Solutions Fall Short**
- **Mixers (e.g., Tornado Cash)**: High regulatory risk, cumbersome UX, completely separated from daily communication.
- **L1 Privacy Coins (Monero)**: Isolated liquidity, lack of smart contract ecosystem and Web3 integrations.

**Slide 4: Our Solution**
- **The Best of Both Worlds**: We combined the cryptographic messaging security of Signal with a built-in, private financial layer on Avalanche.
- **Result**: Chat and send funds peer-to-peer natively, without exposing the link on public block explorers.

**Slide 5: Why Avalanche?**
- **Speed**: Sub-second finality makes in-chat micro-transactions feel instantaneous.
- **Cost**: Low fees enable everyday payments.
- **Future Scale**: Avalanche Subnet architecture allows us to potentially migrate this to a dedicated, highly-compliant enterprise privacy L1.

**Slide 6: Architecture High-Level**
- *(Insert Architecture.md Mermaid Diagram Image here)*
- Highlight the separation: Next.js (Local E2EE), Node.js (Relay/Auth), Avalanche (Stealth Settlement).

**Slide 7: Privacy Technology Deep-Dive**
- **Messaging (E2EE)**: Diffie-Hellman Key Exchange (`eth-crypto`). The backend only routes ciphertexts.
- **Payments (Stealth Addresses)**: Implements ERC-5564 pattern. Sender routes funds to a 1-time ephemeral address; Receiver computes the private key secretly to claim.

**Slide 8: Live Demo Placeholder**
- **Visual**: "It's Demo Time"
- *(Switch screen to live application or pre-recorded video)*

**Slide 9: Security First**
- **Authentication**: Zero passwords. Wallet signature = Identity (EIP-712/JWT).
- **Protection**: Cryptographically secure WebSockets prevent spoofing and replay attacks. 
- **Disappearing Messages**: Auto-destruct timers for zero-trace privacy.

**Slide 10: Roadmap (Post-Hackathon)**
- **Decentralized Storage**: Migrate ciphertexts from Node.js relay to IPFS/Arweave.
- **Account Abstraction (ERC-4337)**: Build a paymaster to sponsor gas fees for users claiming funds from their Stealth Addresses, completely abstracting gas.
- **Mobile Application**: React Native deployment.

**Slide 11: The Impact**
- **Vision**: We are not just building a messaging app. We are building the foundational infrastructure for private, decentralized, peer-to-peer commerce.
- **Target Audience**: Freelancers, DAOs, privacy-conscious Web3 natives, enterprise B2B settlements.

**Slide 12: Thank You / Links**
- **QR Codes**: GitHub Repo, Live Demo Link.
- **Team Info**: [Your Name/Team]

# Demo Script (5-7 Minutes)

*Goal: Speak slowly, confidently, and clearly. Ensure every click aligns with your words.*

## 1. Introduction (1 min)
**[Screen: Landing Page]**
"Hello judges, we are excited to present the Confidential Wallet-to-Wallet Messenger. Web3 has a massive privacy problem. Right now, if I send you funds using my wallet, our financial identities are permanently linked on a public block explorer for the world to see. Alternatively, if I want to chat with you securely, I have to use a Web2 app like Signal, which has zero financial rails. Today, we bridge that gap."

## 2. Authentication (1 min)
**[Screen: Landing Page -> Click 'Connect Wallet']**
"We believe wallet ownership equals identity. There are no passwords or emails here."
**[Action: Click Connect, MetaMask pops up]**
"I am cryptographically signing an EIP-712 challenge. Our Node.js backend verifies this signature and provisions a secure JWT. This ensures zero spoofing."
**[Action: Dashboard loads]**

## 3. Secure Messaging (1 min)
**[Screen: Dashboard -> Open a Chat]**
"I'm now in a chat with a peer. Let me send a message."
**[Action: Type 'Hello, sending the payment now!' -> Hit Send]**
"This message is completely End-to-End Encrypted locally in my browser using Diffie-Hellman Key Exchange before it ever hits our server. The backend only sees a ciphertext. It cannot read our conversation."

## 4. Confidential Payment (1.5 min)
**[Screen: Chat Window]**
"Now, the magic. I need to pay this user 0.1 AVAX, but I do not want the public to know I sent it to them."
**[Action: Click 'Pay' icon -> Enter 0.1 -> Confirm in MetaMask]**
"Instead of sending funds directly to their main wallet, our application just calculated a one-time, ephemeral Stealth Address underneath the hood (using an ERC-5564 pattern). The funds are sent to our `StealthRelayer` smart contract deployed on Avalanche Fuji, which routes the AVAX to this unlinked address."

## 5. Settlement & History (1 min)
**[Screen: Transaction History / Chat UI]**
"Because we built this on Avalanche, that payment settled with sub-second finality. The recipient can now secretly compute the private key for that ephemeral address to claim their funds, leaving absolutely zero public link between our two main wallets."

## 6. Architecture & Conclusion (1 min)
**[Screen: Presentation Slide / Architecture Diagram]**
"To summarize: Next.js handles the local cryptography, our Node.js relay handles the secure JWT WebSockets, and the Avalanche Fuji network serves as our ultra-fast trust and settlement layer. 
We are not just building a chat app; we are building the foundational infrastructure for private, decentralized, peer-to-peer commerce. Thank you."

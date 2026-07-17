# Confidential Wallet-to-Wallet Messenger 🛡️
*Private Conversations. Private Payments. Powered by Avalanche.*

![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

Built for the **Avalanche Speedrun 2026 Hackathon**.

## 🌟 Project Overview
Web3 is inherently public. Current messengers lack native, private financial transactions. This project solves that by combining End-to-End Encryption (E2EE) with **Stealth Addresses (ERC-5564 pattern)** for confidential peer-to-peer micro-transactions natively on the Avalanche Fuji network.

## 💡 The Idea & Motivation (Why We Built This)
The core problem with current blockchain architecture is the complete lack of financial privacy by default. Every transaction, interaction, and balance is permanently visible on public block explorers. If you pay a friend or a freelancer using your primary wallet, you are permanently linking your financial identity to theirs. Anyone who knows your wallet address can inspect your entire transaction history, balance, and the addresses of everyone you interact with.

On the other hand, traditional Web2 encrypted messengers (like Signal or WhatsApp) provide excellent communication privacy but completely lack native financial rails. If you want to send money privately, you are forced to leave the secure chat environment, use a centralized bank or public blockchain, and manually verify transactions.

**The Solution:**
We built the Confidential Wallet-to-Wallet Messenger to bridge this gap. We asked the question: *What if we could combine the cryptographic messaging security of Signal with a built-in, private financial layer powered by Avalanche?*

Here is how the idea comes to life:
1. **Communication Privacy (E2EE):** We use standard Diffie-Hellman Key Exchange (via `eth-crypto`) to ensure that messages are encrypted on the sender's device and can only be decrypted on the recipient's device. Not even the relay server can read the chat contents.
2. **Financial Privacy (Stealth Addresses):** Instead of just sending Avalanche (AVAX) from Wallet A directly to Wallet B (which leaves a permanent public trace), our application implements a Stealth Address protocol (inspired by ERC-5564). When you hit "Pay" inside a chat window, the app generates a unique, one-time ephemeral address for the recipient. The funds are sent to this completely unlinked address. The recipient's wallet can then secretly compute the private key for this one-time address to claim the funds.
3. **Seamless User Experience:** We abstracted all this heavy cryptography away behind a gorgeous, modern Web3 dashboard. Users experience a premium, familiar chat interface, unaware of the complex zero-knowledge-like privacy protocols running beneath the surface.

This is not just a messaging app; it is a vision for the future of private, decentralized, peer-to-peer commerce.

## 🚀 Features (Hackathon MVP)
1. **End-to-End Encrypted Messaging (E2EE)**: Messages are encrypted locally on the browser using `eth-crypto` (Diffie-Hellman Key Exchange) before being relayed over WebSockets.
2. **On-Chain Stealth Transactions**: We've deployed `StealthRelayer.sol` on the Avalanche Fuji testnet. When sending funds, a 1-time ephemeral address is generated so your main wallet is completely disconnected from the recipient.
3. **Disappearing Messages**: True privacy means leaving no trace. Toggle the timer to self-destruct messages from the UI and backend after 10 seconds.
4. **MetaMask-Style Payment Requests**: A gorgeous UI to send and receive interactive payment requests inside the chat.
5. **Cryptographic Authentication**: Users must sign an EIP-712 message to verify wallet ownership before accessing the inbox.

## 💻 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, `@wagmi/core`, `viem`
- **Backend**: Node.js, Express, Socket.io, `mongodb-memory-server`
- **Smart Contracts**: Solidity ^0.8.24, Hardhat, Avalanche Fuji Testnet
- **Cryptography**: `eth-crypto` (SECP256k1)

## 🗂️ Project Structure
Here is an overview of the optimized files and folders in this repository:
```text
ConfidentialMessenger/
├── backend/                   # 🟢 Node.js Relay Server
│   ├── src/
│   │   ├── middleware/        # EIP-712 Wallet Signature Auth
│   │   ├── models/            # Mongoose schemas (User, Message, Conversation)
│   │   ├── routes/            # REST API endpoints
│   │   └── server.ts          # Main Express app & Socket.io WebSocket engine
│   └── package.json           # Backend dependencies (mongodb-memory-server)
│
├── contracts/                 # ⛓️ Smart Contracts (Avalanche Fuji)
│   ├── contracts/
│   │   ├── MockERC20.sol      # Faucet token for testing
│   │   └── StealthRelayer.sol # Core stealth address payment routing logic
│   ├── scripts/               # Hardhat deployment scripts
│   └── test/                  # Chai/Mocha smart contract tests
│
├── frontend/                  # 🌐 Next.js Web3 Dashboard UI
│   ├── src/
│   │   ├── app/               
│   │   │   ├── layout.tsx     # Global layout & Wagmi Providers
│   │   │   └── page.tsx       # Main dashboard (Chat, Portfolio, Stealth Explorer)
│   │   ├── components/        # Reusable React components
│   │   └── utils/             
│   │       ├── crypto.ts      # Client-side eth-crypto E2EE logic
│   │       └── stealth.ts     # Ephemeral Stealth Address generators
│   └── package.json           # Frontend dependencies (Wagmi, Tailwind, Lucide)
│
├── .gitignore                 # Excludes node_modules and env files
└── README.md                  # Hackathon pitch and setup instructions
```

## 🛠️ How to Run Locally

### 1. Smart Contracts
```bash
cd contracts
npm install
npx hardhat test
```

### 2. Relay Backend
```bash
cd backend
npm install
npm run dev
# Note: This will automatically download and start an in-memory MongoDB instance.
```

### 3. Frontend UI
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## 🔮 Future Architecture (Post-Hackathon)
- **Decentralized Storage**: Moving encrypted payloads from the Node.js relay to IPFS/Arweave.
- **Account Abstraction (ERC-4337)**: Building a paymaster to sponsor gas fees for users claiming funds from Stealth Addresses.

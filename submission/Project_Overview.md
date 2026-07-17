# Project Overview
**Confidential Wallet-to-Wallet Messenger**

## The Problem
Web3 is inherently public. Current blockchain architectures completely lack financial privacy by default. Every transaction, interaction, and balance is permanently visible on public block explorers. If a user pays a peer or freelancer using their primary wallet, they permanently link their financial identity. Furthermore, traditional Web2 encrypted messengers (like Signal or WhatsApp) provide excellent communication privacy but completely lack native financial rails, forcing users to leave secure environments to execute transactions.

## The Solution
The Confidential Wallet-to-Wallet Messenger bridges this gap by combining the cryptographic communication security of Signal with a built-in, private financial layer powered by the Avalanche blockchain. It allows users to chat and transact natively, peer-to-peer, without linking their main wallets on a public block explorer.

## Key Features
1. **End-to-End Encrypted Messaging (E2EE)**: Messages are encrypted locally on the browser using Diffie-Hellman Key Exchange (`eth-crypto`) before being relayed. Not even the relay server can read the chat contents.
2. **On-Chain Stealth Transactions**: Powered by a custom `StealthRelayer` smart contract deployed on the Avalanche Fuji network, all payments generate a unique, one-time ephemeral address for the recipient.
3. **Cryptographic Authentication**: Zero passwords. Wallet ownership equals identity. Users securely sign an EIP-712 cryptographic message to obtain a secure JSON Web Token (JWT) session.
4. **Disappearing Messages**: True privacy means leaving no trace. Users can toggle auto-destruct timers.
5. **Seamless UX**: Complex cryptography is completely abstracted behind a premium, modern Web3 dashboard.

## Why Avalanche?
Avalanche provides the required sub-second finality and low transaction fees necessary to make micro-transactions within a chat environment viable. Furthermore, Avalanche's Subnet architecture opens the door for future deployments to a dedicated, heavily compliant private L1 subnet, optimizing for extreme confidentiality at an enterprise scale.

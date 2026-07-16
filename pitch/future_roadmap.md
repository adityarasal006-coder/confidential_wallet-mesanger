# Future Roadmap

Confidential Messenger is designed to evolve into a unicorn-scale Web3 product. Here is the post-hackathon roadmap.

## Q1: The Avalanche Subnet (Private L1)
Currently, we use a Hybrid Architecture (Public C-Chain + Local Cryptography) to balance speed and privacy. For Version 2.0, we will deploy a dedicated **Avalanche AppChain (Subnet)** specifically optimized for the ERC-5564 Stealth Address standard.
- Custom precompiles for cheaper elliptic curve operations.
- Permissionless, decentralized message relaying nodes.

## Q2: Cross-Chain Confidentiality
Integration with **Avalanche Teleporter** and LayerZero to allow a user on Ethereum to send a confidential payment to a user on Avalanche without bridging publicly.

## Q3: Mobile Ecosystem (React Native)
Privacy apps are predominantly used on mobile (like Signal and Telegram). We will fork our Next.js UI into an Expo/React Native application with deep iOS/Android Secure Enclave integration for storing the ECDH private keys locally, completely eliminating reliance on browser extensions like MetaMask.

## Q4: Zero-Knowledge (ZK) Compliance
Privacy must not become a haven for illicit activity. We will integrate **Zero-Knowledge Proofs (ZKPs)** allowing users to generate "View Keys" or "Proof of Compliance" reports for regulators and auditors, proving the source of their stealth funds without revealing their entire transaction history to the public.

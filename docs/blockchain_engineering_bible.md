# Blockchain Engineering Bible ⛓️

## 1. Avalanche First Principles
The blockchain is not a database; it is the trust layer. Confidential Messenger minimizes on-chain footprint. We treat Avalanche not just as an EVM, but as a high-throughput consensus engine capable of sub-second finality—which is an absolute requirement for chat-based stealth payments.

## 2. Privacy Technology Decision: The Hybrid Architecture
We evaluated pure eERC (ERC-5564) and Avalanche Private Subnets.
- **The Subnet Problem:** Deploying a permissioned Subnet isolates liquidity and requires massive operational validator overhead, severely crippling adoption for an MVP.
- **The Solution (Hybrid):** We deploy on the public **Avalanche Fuji C-Chain** for immutable event routing and liquidity, while enforcing 100% data privacy via **Elliptic Curve Diffie-Hellman (ECDH)** key exchanges on the client.

## 3. Smart Contract Architecture (`StealthRelayer.sol`)

### Philosophy
The contract adheres to the Single Responsibility Principle. It does exactly one thing: accepts funds and an ephemeral public key, routes the funds to the generated stealth address, and emits an event for the receiver to scan.

### Storage Design
**Zero State:** The contract stores *no mappings* of senders to receivers. We rely entirely on the immutable Event Log for data availability, which costs significantly less gas than SSTORE operations.

### Event Design
```solidity
event Announcement(uint256 indexed schemeId, address indexed stealthAddress, bytes ephemeralPubKey, bytes metadata);
```
- **Purpose:** Allows the receiving client's viem/ethers instance to scan the blockchain for incoming payments.
- **Gas Optimization:** Only `schemeId` and `stealthAddress` are indexed. The raw ECDH `ephemeralPubKey` is kept as dynamic `bytes` in the unindexed data payload to save gas.

### Access Control
- **No `onlyOwner`:** The core `transfer()` function is permissionless. Anyone can use the relayer. There are no admin backdoors to freeze user funds, ensuring censorship resistance.

## 4. Security Model & Threat Mitigations

- **Reentrancy:** Mitigated via the Checks-Effects-Interactions pattern. Since this contract only transfers the native asset (AVAX) to an EOA (Stealth Address), and has no complex state mutations, reentrancy risk is nullified.
- **DOS (Denial of Service):** The contract does not loop over arrays. Gas cost per transaction is fixed, rendering block-stuffing DOS attacks irrelevant.
- **Signature Forgery:** We rely on the native ECDSA signature of the EVM transaction itself (`msg.sender`); we do not implement custom EIP-712 off-chain signature relaying in V1 to reduce attack surface.

## 5. Cryptography Model
- **ECDH (Elliptic Curve Diffie-Hellman):** Used to generate the shared secret between the sender and receiver.
- **AES-256-GCM:** Used by the client to encrypt the chat messages symmetrically *before* they are sent to the Node.js Socket server.
- **Key Storage:** Private keys are never stored. The Stealth Address private key is mathematically derived on the fly by the recipient using their MetaMask signature as entropy.

## 6. Audit Checklist (Passed)
- [x] Compiles successfully
- [x] Gas optimized (Custom Errors over `require` strings)
- [x] No reentrancy
- [x] No `onlyOwner` centralization vectors
- [x] Verified on Avalanche Explorer

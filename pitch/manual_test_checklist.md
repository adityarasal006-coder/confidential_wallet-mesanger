# Manual Testing Checklist for Judges

Dear Judges, follow this exact checklist to verify the full functionality of the Confidential Messenger MVP locally.

## Environment Setup
- [ ] 1. Clone the repository.
- [ ] 2. Run `npm install` in both the root directory and the `/backend` directory.
- [ ] 3. Run `npm run dev` in the root directory (starts Next.js on `localhost:3000`).
- [ ] 4. Run `npm run dev` in the `/backend` directory (starts Node on `localhost:5000`).
- [ ] 5. Ensure you have the **MetaMask** extension installed in your browser.
- [ ] 6. Ensure your MetaMask network is set to **Avalanche Fuji Testnet**.

## UI & Authentication Tests
- [ ] 7. Navigate to `http://localhost:3000`.
- [ ] 8. Click **Connect Wallet** and sign the SIWE (Sign-In with Ethereum) message.
- [ ] 9. Verify the Dashboard UI renders with smooth Framer Motion transitions.
- [ ] 10. Click the **Wallet Tab** and verify your Fuji AVAX balance is correctly queried via Wagmi.

## E2EE Messaging Tests
- [ ] 11. Open an Incognito Window and connect a *different* MetaMask wallet to `localhost:3000`.
- [ ] 12. Search for the first wallet's address in the sidebar.
- [ ] 13. Send a message from Wallet A to Wallet B.
- [ ] 14. Verify the message appears instantly via Socket.io.
- [ ] 15. Inspect the SQLite database (`backend/prisma/dev.db`) and verify that the `content` field is unreadable ciphertext (AES-GCM encrypted).

## Confidential Payment Tests (Stealth Addresses)
- [ ] 16. In the Chat UI, click the **$ (Transfer)** icon.
- [ ] 17. Initiate a 0.01 AVAX transfer.
- [ ] 18. Confirm the transaction in MetaMask.
- [ ] 19. Verify the **Success Banner** appears in the chat.
- [ ] 20. Click the provided Block Explorer link. Verify that the recipient address on Snowtrace is a *brand new address*, NOT Wallet B's public address.

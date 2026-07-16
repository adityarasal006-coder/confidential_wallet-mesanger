# Frontend Engineering Bible 🖥️

## 1. Frontend Philosophy & Architecture
The frontend is the user's entire perception of the product. It must make blockchain complexity invisible.

### Next.js App Router Foundation
We utilize the Next.js App Router (`src/app`) to separate Server Components from Client Components.
- **Server Components:** Used for the root layouts and static landing pages to ensure optimal SEO and zero client-side JavaScript bundle overhead.
- **Client Components (`"use client"`):** Used exclusively where interactivity (Wagmi wallet hooks, Framer Motion animations) or real-time WebSockets (Socket.io) are required, such as the Dashboard and Chat interface.

### Project Structure
```text
frontend/
├── src/
│   ├── app/            # App Router pages and layouts
│   ├── components/     # Reusable UI components (Buttons, Cards, Modals)
│   ├── hooks/          # Custom React hooks (e.g., useStealthTransfer)
│   ├── utils/          # Client-side crypto (AES-GCM) and formatting
│   └── styles/         # Global Tailwind CSS configurations
```

---

## 2. Wallet Experience & State Management
We reject heavy global state managers (like Redux) in favor of localized, purpose-built state.

### The Wallet Layer (Wagmi + Viem)
We use Wagmi for all blockchain interactions. It provides type-safe React hooks (`useAccount`, `useSendTransaction`).
- **Network Detection:** The app automatically prompts the user to switch to Avalanche Fuji if they are on the wrong network.
- **Wallet Connection Flow:** The user connects via MetaMask. We immediately trigger the SIWE (Sign-In with Ethereum) flow to issue a secure JWT from the backend.

### State Domains
- **Wallet State:** Managed entirely by Wagmi.
- **Chat State:** Managed by local React Context to prevent unnecessary re-renders across the entire component tree when a new message arrives.

---

## 3. Real-Time Synchronization (Socket.io)
We integrate Socket.io on the client side to avoid polling the REST API.
- **Connection Lifecycle:** The socket connects immediately after the SIWE JWT is successfully stored.
- **Optimistic Updates:** When a user sends a message, it appears in the chat UI instantly (Optimistic UI), while the socket emits the encrypted payload to the backend in the background.
- **Offline Recovery:** If the WebSocket disconnects, the client queues outgoing messages and resyncs via the REST API upon reconnection.

---

## 4. UI/UX & Motion Design
The UI is heavily styled with **Tailwind CSS** and animated with **Framer Motion**.

### Animation Rules
Animations are never decorative; they communicate state.
- **Page Transitions:** 
  ```javascript
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
  ```
- **Micro-interactions:** Buttons scale down slightly on click (`whileTap={{ scale: 0.98 }}`) to provide tactile feedback mimicking a native mobile app.

### Error Handling & UX
Raw RPC errors (e.g., "Internal JSON-RPC error") are strictly forbidden from reaching the UI.
- All blockchain errors are caught and transformed into human-readable Toast notifications (e.g., "Transaction rejected in your wallet.").

---

## 5. Accessibility & Performance
- **A11y:** All interactive elements support keyboard navigation. Dialogs (Modals) implement strict focus trapping.
- **Performance:** We rely heavily on Next.js Image optimization and dynamic imports for heavy client-side libraries (like the `crypto` utilities) to keep the initial TTFB (Time to First Byte) under 100ms.

## 6. Acceptance Criteria (Passed)
- [x] Every page is responsive (Mobile to Desktop).
- [x] Wallet authentication is seamless.
- [x] Messaging feels instant (Socket.io).
- [x] Blockchain complexity is hidden (No ABI/Gas jargon exposed).
- [x] Animations enhance usability without sacrificing performance.

# UI/UX Design Bible & Product Experience 🎨

## 1. Design Philosophy: "Trustless Glassmorphism"
Confidential Messenger is not a standard Web3 dApp; it is a premium digital product. The interface must communicate Trust, Privacy, and Speed. 
- **The Core Rule:** Blockchain complexity is entirely hidden. We use phrases like "Payment Sent Successfully" instead of "Transaction Hash Generated."
- **Inspiration:** Stripe (precision), Linear (keyboard-first speed), Apple Wallet (trust).

---

## 2. Color System & Design Tokens (Dark Theme Optimized)
Our primary interface is designed for OLED/Dark modes to reduce eye strain and communicate a "hacker/privacy" ethos, softened by modern gradients.

- **Background (Base):** `bg-zinc-950` (#09090b)
- **Surface (Cards):** `bg-zinc-900/50` (Glassmorphism with `backdrop-blur-md`)
- **Border (Subtle):** `border-zinc-800`
- **Text Primary:** `text-zinc-50`
- **Text Secondary:** `text-zinc-400`
- **Primary Brand (Avalanche Red):** `bg-red-500` (Hover: `bg-red-600`)
- **Success (Payments):** `text-emerald-400`
- **Warning (Risk Detection):** `text-amber-500`

*WCAG AA compliance is enforced on all text elements against `zinc-950` backgrounds.*

---

## 3. Typography System
**Chosen Font:** `Inter` (via Google Fonts).
- **Why:** Optimized for readability at small sizes (crucial for wallet addresses and transaction amounts) and scales beautifully for display headers.
- **Hierarchy:**
  - **Display:** 48px, Bold, tracking-tight.
  - **Headline:** 24px, Semibold.
  - **Body:** 14px, Regular, `leading-relaxed`.
  - **Monospace:** `JetBrains Mono` for wallet addresses and code snippets to prevent ambiguous character misreading (e.g., `O` vs `0`).

---

## 4. Motion Design (Framer Motion)
Animations are never decorative; they must communicate state changes.
- **Page Transitions:** `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}` (Duration: 0.3s, Easing: `easeOut`).
- **Button Interactions:** `whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}`.
- **Micro-Interactions:** The AI Risk Detection banner slides in using a spring physics configuration (`stiffness: 300, damping: 25`) to grab immediate attention without jarring the user.

---

## 5. Component Library Standards (ShadCN Inspired)
Every component is atomic, reusable, and accessible.
- **Cards (`<Card>`):** Must use `rounded-xl`, `border-zinc-800`, and `bg-zinc-900/50`.
- **Inputs (`<Input>`):** Must have `focus:ring-2 focus:ring-red-500` to provide clear keyboard navigation feedback.
- **Dialogs (Modals):** Must trap focus and support `Esc` key dismissal (handled natively by Radix UI/ShadCN primitives).

---

## 6. UX Flows & State Management

### The Core Loop: Send Confidential Payment
1. **Initiate:** User clicks "$" in chat.
2. **Action:** Transfer Modal opens. Focus automatically traps on the amount input.
3. **Feedback:** User clicks "Send". Button transforms into a Loading spinner.
4. **Completion:** Modal dismisses. A Success Toast appears. Chat history instantly updates via Socket.io.

### Empty States
Never leave a blank screen.
- **No Chats:** "Your inbox is completely private. Search for a wallet address to start an encrypted conversation." (Includes a stylized ghost/lock icon).

### Error States
- **RPC Timeout / Metamask Rejection:** Graceful fallback using a red toast notification: "Transaction rejected by wallet." NEVER show raw JSON RPC errors to the user.

---

## 7. Accessibility (A11y)
- All interactive elements must be navigable via `Tab`.
- All buttons must have `aria-label` if they are icon-only.
- Color contrast ratios strictly adhere to >4.5:1 for standard text.

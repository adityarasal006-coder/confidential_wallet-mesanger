# Hackathon Demo Script: Confidential Messenger

**Total Time: 3 Minutes**

## [0:00 - 0:30] The Problem & The Hook
*(Screen: Landing Page)*

**Speaker:**
"Web3 is incredible, but it has a massive privacy problem. Every transaction you make is public. If I buy a coffee with AVAX, the barista can look up my wallet, see how much money I have, and see every other transaction I've ever made. 

That's why we built **Confidential Messenger**—a platform where your conversations and your payments are completely invisible to the public eye, powered by the speed of the Avalanche network."

## [0:30 - 1:15] The E2EE Chat
*(Screen: Connect Wallet, transition to Chat Dashboard)*

**Speaker:**
"Let me show you how it works. I sign in using my standard MetaMask wallet. No new passwords, just Web3 native authentication.

*(Action: Click Connect Wallet, Sign Message)*

"I'm now in a secure chat with my co-founder. Because we use AES End-to-End Encryption, our messages are encrypted locally on our devices before they even touch the backend. The server cannot read them. The database cannot read them. Only we can read them."

*(Action: Type a message and send it. Show the AI Risk Detection banner).*

"Notice this orange AI Risk Detection banner? Because we are dealing with payments, our local AI model automatically warns users if they are interacting with a low-reputation or newly created wallet, preventing phishing and scams natively."

## [1:15 - 2:00] Confidential Payments via Stealth Addresses
*(Screen: Chat Interface -> Click "Transfer Funds")*

**Speaker:**
"Now, let's say I need to pay my co-founder 1 AVAX. If I do a standard transfer, it's public. 

Instead, I click 'Private Transfer'. Under the hood, Confidential Messenger automatically generates a one-time cryptographic **Stealth Address** using my co-founder's public meta-key.

*(Action: Execute Transfer, MetaMask popup appears, confirm transaction)*

"I just sent 1 AVAX. But if you look at the Avalanche block explorer, you will NOT see a transaction between my wallet and his wallet. You will only see funds going to a random, newly generated address. The link between sender and receiver is completely severed."

## [2:00 - 2:30] Stealth Explorer & Conclusion
*(Screen: Navigate to the Stealth tab)*

**Speaker:**
"On my co-founder's side, his client is constantly scanning the Avalanche Fuji network for events emitted by our Smart Contract. 

When it detects a payment meant for him, his client uses his private key to compute the shared secret, granting him full ownership of that newly generated stealth address. He can now withdraw those funds anonymously.

*(Screen: Wallet Portfolio Tab)*

"Confidential Messenger brings Stripe-level UX, Signal-level privacy, and Avalanche-level speed to Web3. Thank you."

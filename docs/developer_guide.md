# Developer Guide: Building on Confidential Messenger

Welcome to the engineering team. This guide covers how to clone, run, and extend the Confidential Messenger monorepo.

## 1. System Requirements
- **Node.js** v20+
- **npm** v10+
- **Docker** (optional, for running the full stack)
- **MetaMask** browser extension
- **Avalanche Fuji Testnet** added to MetaMask

## 2. Local Setup (Without Docker)

### Step 1: Install Dependencies
Run `npm install` in the root directory to install the Next.js dependencies.
Run `npm install` in the `/backend` directory for the Node.js/Prisma API.

### Step 2: Database Initialization
Navigate to `/backend` and run:
```bash
npx prisma generate
npx prisma db push
```
This generates the TypeScript client and creates the local `dev.db` SQLite database.

### Step 3: Environment Variables
1. Rename `.env.example` to `.env` in the root (if provided).
2. Inside `/contracts`, create a `.env` file and add your `PRIVATE_KEY` for deploying to Avalanche Fuji.

### Step 4: Run the Development Servers
Open two terminal windows:
- **Terminal 1 (Root):** `npm run dev` -> starts Next.js on `http://localhost:3000`
- **Terminal 2 (/backend):** `npm run dev` -> starts Express on `http://localhost:5000`

## 3. Extending the Platform

### Adding a new Smart Contract
1. Add the Solidity file in `contracts/contracts/`.
2. Run `npx hardhat compile`.
3. Add a deployment script in `contracts/scripts/`.
4. Deploy using `npx hardhat run scripts/deploy.js --network fuji`.

### Adding a new UI Page
We use the **Next.js App Router**. To add a new page (e.g., `/settings`), create a `src/app/settings/page.tsx` file. We strictly use **TailwindCSS** for styling and **Framer Motion** for animations.

## 4. Debugging & Common Issues
- **"Database connection error"**: Ensure you ran `npx prisma db push` inside the backend directory.
- **"Socket.io disconnects"**: Check if CORS in `backend/src/server.ts` includes `localhost:3000`.
- **"Deployment fails on Fuji"**: Ensure your wallet has sufficient testnet AVAX from the official faucet.

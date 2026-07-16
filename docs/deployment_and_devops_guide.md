# Production Deployment & DevOps Guide 🚀

## 1. DevOps Architecture

Our infrastructure is designed for high availability and zero-downtime deployments.

```text
Developer Push -> GitHub Actions (CI/CD)
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
  Frontend (Vercel)              Backend (Render)
  - Next.js App Router           - Node.js / Express
  - Edge Caching CDN             - Socket.io Server
       │                               │
       │                        ┌──────┴──────┐
       ▼                        ▼             ▼
  User Browser            Prisma (SQLite)   Avalanche Fuji
  (AES-GCM client)        (MongoDB soon)    (StealthRelayer)
```

## 2. CI/CD Pipeline (GitHub Actions)
Located in `.github/workflows/deploy.yml`, our pipeline enforces strict quality gates before any code reaches production.
1. **Lint & Format:** Rejects commits failing ESLint or Prettier.
2. **Type Checking:** Ensures strict TypeScript compliance (`tsc --noEmit`).
3. **Build:** Runs `npm run build` on Next.js to catch hydration or static rendering errors.
4. **Smart Contract Verification:** Ensures `StealthRelayer.sol` compiles via Hardhat.

## 3. Environment Management & Secrets
Secrets are strictly managed and never hardcoded.

### Frontend (.env)
- `NEXT_PUBLIC_API_URL`: The URL of the Express backend (e.g., `https://api.confidentialmessenger.xyz`).
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Reown/WalletConnect configuration.

### Backend (.env)
- `JWT_SECRET`: 64-character cryptographically secure string (Rotated every 90 days).
- `DATABASE_URL`: Connection string for the database.
- `CORS_ORIGIN`: Must strictly match the Vercel frontend domain to prevent unauthorized socket connections.

### Smart Contracts (.env)
- `PRIVATE_KEY`: The deployer wallet key (Requires Fuji AVAX).

## 4. Deployment Instructions

### Frontend (Vercel)
1. Link the GitHub repository to Vercel.
2. Set the Framework Preset to **Next.js**.
3. Inject the `NEXT_PUBLIC_*` environment variables.
4. Click Deploy. Vercel automatically handles SSL, Edge CDN routing, and Serverless function deployment.

### Backend (Render)
1. Create a new **Web Service** on Render.com.
2. Set Build Command: `npm install && npx prisma generate && npm run build`
3. Set Start Command: `npm start`
4. Ensure the **Health Check Path** is set to `/api/health`. Render will automatically restart the container if this endpoint fails.

### Database (SQLite to MongoDB Atlas)
*Hackathon Note: We currently use SQLite for zero-config local judging.*
1. For production, migrate Prisma schema from `sqlite` to `mongodb`.
2. Provision a MongoDB Atlas Cluster.
3. Whitelist the Render backend's static IP addresses.
4. Inject the Atlas `DATABASE_URL` into Render's environment variables.

## 5. Security Audit Checklist
Before public release, ensure:
- [x] CORS strictly limits API and Socket access to the Vercel domain.
- [x] Helmet.js is active on Express to prevent XSS and Clickjacking.
- [x] AES-GCM encryption is entirely localized to the client browser.
- [x] Rate limiting is active on `/api/auth` to prevent signature spam.
- [x] `StealthRelayer.sol` contains no `onlyOwner` backdoor functions.

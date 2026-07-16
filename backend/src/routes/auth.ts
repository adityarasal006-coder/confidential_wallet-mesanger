import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

// 1. Generate Nonce for Wallet
router.get('/nonce/:address', async (req: Request, res: Response): Promise<any> => {
  try {
    const addressParam = req.params.address as string;
    if (!addressParam) return res.status(400).json({ error: 'Address is required' });
    const address = addressParam.toLowerCase();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // Upsert user with new nonce
    await User.findOneAndUpdate(
      { walletAddress: address },
      { nonce },
      { upsert: true, new: true }
    );

    res.json({ nonce });
  } catch (error) {
    console.error('Nonce Error:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// 2. Verify Signature and Issue JWT
router.post('/verify', async (req: Request, res: Response): Promise<any> => {
  try {
    const { address, signature } = req.body;
    
    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature are required' });
    }

    const lowerAddress = address.toLowerCase();
    const user = await User.findOne({ walletAddress: lowerAddress });
    
    if (!user || !user.nonce) {
      return res.status(404).json({ error: 'User or nonce not found' });
    }

    const message = `Sign this message to prove you own this wallet.\n\nNonce: ${user.nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== lowerAddress) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Clear nonce after successful login
    user.nonce = Math.random().toString(36).substring(2, 15);
    await user.save();

    const token = jwt.sign(
      { address: lowerAddress },
      JWT_SECRET,
      { expiresIn: '7d' } // Session valid for 7 days
    );

    res.json({ token, address: lowerAddress });
  } catch (error) {
    console.error('Verify Error:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

export default router;

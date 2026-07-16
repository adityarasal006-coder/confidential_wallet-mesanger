import { Router } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Register or update public key
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, publicKey } = req.body;
    
    if (!walletAddress || !publicKey) {
      return res.status(400).json({ error: 'walletAddress and publicKey required' });
    }

    const nonce = Math.random().toString(36).substring(7);
    
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { publicKey, nonce },
      { upsert: true, new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by address (fetch public key for encryption)
router.get('/:address', authMiddleware, async (req, res): Promise<any> => {
  try {
    const addressParam = req.params.address as string;
    if (!addressParam) return res.status(400).json({ error: 'Address required' });
    const user = await User.findOne({ walletAddress: addressParam.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

import { Router } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get conversation history
router.get('/:otherAddress', authMiddleware, async (req: any, res) => {
  try {
    const userAddress = req.userAddress;
    const otherAddress = req.params.otherAddress.toLowerCase();

    const conversation = await Conversation.findOne({
      participants: { $all: [userAddress, otherAddress] }
    });

    if (!conversation) {
      return res.json([]);
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

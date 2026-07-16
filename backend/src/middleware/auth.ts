import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization as string;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No Bearer token provided' });
  }

  const token: string = authHeader.split(' ')[1] as string;
  
  try {
    const secret: string = (process.env.JWT_SECRET as string) || 'supersecret_fallback_key';
    const decoded: any = jwt.verify(token, secret);
    (req as any).userAddress = decoded.address.toLowerCase();
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

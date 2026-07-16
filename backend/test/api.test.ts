import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());

// Mock Auth Route
app.post('/api/users/auth', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });
  res.json({ token: 'mock_jwt_token', user: { walletAddress: address } });
});

describe('Backend API Tests', () => {
  it('should reject authentication without an address', async () => {
    const res = await request(app).post('/api/users/auth').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should authenticate a valid payload', async () => {
    const res = await request(app)
      .post('/api/users/auth')
      .send({ address: '0x123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});

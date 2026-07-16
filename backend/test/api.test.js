"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Mock Auth Route
app.post('/api/users/auth', (req, res) => {
    const { address } = req.body;
    if (!address)
        return res.status(400).json({ error: 'Address required' });
    res.json({ token: 'mock_jwt_token', user: { walletAddress: address } });
});
describe('Backend API Tests', () => {
    it('should reject authentication without an address', async () => {
        const res = await (0, supertest_1.default)(app).post('/api/users/auth').send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });
    it('should authenticate a valid payload', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/users/auth')
            .send({ address: '0x123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
//# sourceMappingURL=api.test.js.map
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  publicKey: string;
  nonce: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },
  publicKey: { type: String, required: false, default: '' },
  nonce: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);

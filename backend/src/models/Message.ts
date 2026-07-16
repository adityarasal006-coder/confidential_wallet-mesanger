import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: string;
  recipient: string;
  encryptedPayload: string;
  type: string;
  txHash?: string;
  timestamp: Date;
  isRead: boolean;
}

const MessageSchema: Schema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: String, required: true, index: true },
  recipient: { type: String, required: true },
  encryptedPayload: { type: String, required: true },
  type: { type: String, enum: ['TEXT', 'TRANSFER'], default: 'TEXT' },
  txHash: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);

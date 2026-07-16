import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: string[];
  lastMessageAt: Date;
  createdAt: Date;
}

const ConversationSchema: Schema = new Schema({
  participants: { type: [String], required: true, index: true },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);

import mongoose, { Schema, Document } from 'mongoose';

// Define the Message interface
interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId;
  receiver: mongoose.Schema.Types.ObjectId;
  content: string;
  encryptionType: 'AES' | 'NRZ-I' | 'Manchester';
  isRead: boolean;
  timestamp: Date;
}

// Define the schema for the Message model
const MessageSchema: Schema<IMessage> = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    content: { type: String, required: true },
    encryptionType: {
      type: String,
      enum: ['AES', 'NRZ-I', 'Manchester'],
      default: 'AES',
    },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Export the model
const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;

import mongoose, { Schema, Document } from 'mongoose';

// Define the Message interface
interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId; // Reference to the sender's device
  receiver: mongoose.Schema.Types.ObjectId; // Reference to the receiver's device
  content: string; // Actual message content
  encryptionType: string; // Encryption protocol used (e.g., AES, RSA)
  isRead: boolean; // Whether the receiver has read the message
  timestamp: Date; // Time the message was sent
}

// Define the schema for the Message model
const MessageSchema: Schema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    content: { type: String, required: true },
    encryptionType: { type: String, default: 'AES' },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Export the model
const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;

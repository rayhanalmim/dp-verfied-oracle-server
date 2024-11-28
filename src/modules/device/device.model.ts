import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDevice extends Document {
  name: string; // Device name
  macAddress: string; // Unique MAC address
  ipAddress: string; // Unique IP address
  status: 'online' | 'offline'; // Device's current status
  encryptionKey: string; // Encryption key for secure communication
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema: Schema = new Schema<IDevice>(
  {
    name: {
      type: String,
      required: true,
    },
    macAddress: {
      type: String,
      required: true,
      unique: true,
    },
    ipAddress: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    encryptionKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Device: Model<IDevice> = mongoose.model<IDevice>('Device', deviceSchema);

export default Device;

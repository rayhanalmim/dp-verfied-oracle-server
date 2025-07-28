import mongoose from 'mongoose';

export enum DepositStatus {
  PENDING = 'pending',
  VERIFYING = 'verifying',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

export enum NetworkType {
  ETHEREUM = 0,
  BSC = 1,
  SOLANA = 2
}

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Changed from ObjectId to String for easier testing
      required: true
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true
    },
    network: {
      type: Number,
      enum: [0, 1, 2], // Explicitly using numbers instead of enum values
      required: true
    },
    tokenAddress: {
      type: String,
      required: true
    },
    depositAmount: {
      type: String,
      required: true
    },
    platformTokenAmount: {
      type: String,
      default: '0'
    },
    status: {
      type: String,
      enum: Object.values(DepositStatus),
      default: DepositStatus.PENDING
    },
    verificationTimestamp: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const DepositModel = mongoose.model('Deposit', depositSchema); 
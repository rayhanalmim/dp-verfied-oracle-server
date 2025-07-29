import mongoose from 'mongoose';

export enum DepositStatus {
  PENDING = 'pending',
  VERIFYING = 'verifying',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  FAILED = 'failed'
}

export enum NetworkType {
  ETHEREUM = 0,
  BSC = 1,
  SOLANA = 2,
  TON = 3
}

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Changed from ObjectId to String for easier testing
      required: true
    },
    transactionHash: {
      type: String,
      sparse: true // Allow null but maintain uniqueness for non-null values
    },
    network: {
      type: Number,
      enum: [0, 1, 2, 3], // Added TON (3)
      required: true
    },
    tokenAddress: {
      type: String
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
    depositAddress: {
      type: String
    },
    requestTimestamp: {
      type: Date,
      default: Date.now
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
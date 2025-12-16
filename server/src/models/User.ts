import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'buyer' | 'seller' | 'admin';
export type SellerVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  // Seller-specific fields
  sellerVerificationStatus?: SellerVerificationStatus;
  isSellerVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    // When a user is a seller, they must be reviewed/approved
    sellerVerificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isSellerVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);



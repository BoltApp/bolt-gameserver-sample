export type User = {
  id: string;
  passwordHash: string;
  email: string;
  username: string;
}

export type Amount = {
  value: number;
  currency: string;
}

export type LoginResponse = {
  token: string;
  user: UserProfile
}

export type UserProfile = {
  userId: string;
  username: string;
  email: string;
  gems: number;
}

export type TransactionReceipt = {
  id: number;
  boltReference: string;
  acknowledged: boolean;
  products: Product[];
}

export type Product = {
  tier: string;
  image: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  category: 'gem_package';
  gemAmount?: number; // Actual gem value
  savings?: string; // Optional savings info
  popular?: boolean; // Optional flag for popular products
}

export type BoltTransactionInput = {
  userId: string;
  transactionId: string;
}

export type TransactionValidationInput = {
  reference: string;
}

export type RestorePurchasesInput = {
  email: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}

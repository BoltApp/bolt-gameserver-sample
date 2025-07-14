export type User = {
  id: string;
  passwordHash: string;
  email: string;
  username: string;
}

export type UserProfile = {
  id: string;
  userId: string;
  username: string;
  gems: number;
}

export type TransactionReceipt = {
  id: string;
  boltReference: string;
  acknowledged: boolean;
  products: Product[];
}

export type Product = {
  id: string;
  image: string;
  name: string;
  description: string;
  price: number;
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

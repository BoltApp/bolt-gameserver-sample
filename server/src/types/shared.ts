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

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GetPaymentLinkRequest {
  id: string;
  item: {
    price: number;
    name: string;
    currency: string;
  };
  redirect_url: string;
  user_id: string;
  game_id: string;
  metadata: string;
}

export interface GetPaymentLinkResponse {
  payment_link: GetPaymentLinkRequest;
  transaction?: {
    reference: string;
    status: string;
  }
}

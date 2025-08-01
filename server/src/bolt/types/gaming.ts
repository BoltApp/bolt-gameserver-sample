export interface PaymentLinkRequest {
  item: {
    price: number;
    name: string;
    currency: string;
  };
  redirect_url: string;
  user_id: string;
  game_id: string;
  metadata: Record<string, any>;
}

export interface PaymentLinkResponse {
  id: string;
  link: string;
}

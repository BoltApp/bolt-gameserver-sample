export interface CreatePaymentLinkRequest {
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

export interface CreatePaymentLinkResponse {
  id: string;
  link: string;
}

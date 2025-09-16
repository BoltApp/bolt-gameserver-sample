import { GetPaymentLinkResponse } from "../../types/shared";
import { BoltEndpoints } from "../bolt-endpoints";
import type { CreatePaymentLinkRequest, CreatePaymentLinkResponse } from "../types";

export class GamingAPI {
  private client: BoltEndpoints;

  constructor(client: BoltEndpoints) {
    this.client = client;
  }

  async createPaymentLink(data: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    const response = await this.client.instance.post("/gaming/payment_links", data);
    return response.data;
  }

  async getPaymentLinkResponse(paymentLinkId: string): Promise<GetPaymentLinkResponse> {
    const response = await this.client.instance.get(`/gaming/payment_links/${paymentLinkId}`);
    return response.data;
  }
}

import axios, { type AxiosInstance } from 'axios';

export class BoltEndpoints {
  private client: AxiosInstance;

  constructor(apiKey: string, publishableKey: string, baseURL = 'https://api.bolt.com/v1/') {
    this.client = axios.create({
      baseURL,
      headers: {
        'X-API-Key': apiKey,
        'X-Publishable-Key': publishableKey,
        'Content-Type': 'application/json',
      },
    });
  }

  get instance() {
    return this.client;
  }
}

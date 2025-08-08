import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiResponse, LoginResponse, Product, UserProfile } from '@shared-types';
import type { GemPackage } from './types';
import { gemConfig } from './configs/products-config';
import { env } from './configs/env';
import { authenticatedFetch } from './utils';

const BACKEND_URL = env.BACKEND_URL;

export function getAllProducts() {
  return fetch(`${BACKEND_URL}/api/products`)
    .then(response => response.json())
    .then((data: Product[]) => {
      console.log('Fetched products:', data, gemConfig);
      return data.map<GemPackage>(product => ({
        ...product,
        ...(gemConfig[product.sku] || {}),
      })).sort((a, b) => (a.gemAmount ?? 0) - (b.gemAmount ?? 0));
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      throw error;
    });
}

export const useGetAllProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export function getUserProfile(): Promise<UserProfile> {
  return authenticatedFetch(`${BACKEND_URL}/api/user/profile`)
    .then(response => response.json())
    .then(response => {
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    retry: false,
  });
}

export function login(username: string, password: string): Promise<UserProfile> {
  return fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: username,
      password: password,
    }),
  })
    .then(response => response.json())
    .then((response: ApiResponse<LoginResponse>) => {
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('Login failed');
      }
      // Store the token for authenticated requests
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data.user;
    })
    .catch(error => {
      console.error('Error logging in:', error);
      throw error;
    });
}

export function useFakeLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['login'],
    mutationFn: () => login(env.TEST_EMAIL, env.TEST_PASSWORD),
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
    },
  });
}

function validateUser(paymentLinkId: string): Promise<UserProfile> {
  if (!paymentLinkId) {
    return Promise.reject(new Error('Payment link ID is required'));
  }
  return authenticatedFetch(`${BACKEND_URL}/api/user/validate?payment_link_id=${paymentLinkId}`)
    .then(response => response.json())
    .then((response: ApiResponse<UserProfile>) => {
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error);
    });
}

export function useValidateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validateUser,
    retry: 20,
    retryDelay: 2000,
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
    },
  });
}

export function getCheckoutLink(sku: string): Promise<string> {
  return authenticatedFetch(`${BACKEND_URL}/api/bolt/products/${sku}/checkout-link`)
    .then(response => response.json())
    .then((response: ApiResponse<{ link: string }>) => {
      console.log('Payment link response:', response);
      if (response.success && response.data) {
        return response.data.link;
      }
      throw new Error(response.error);
    });
}

export function getPaymentLink(sku: string): Promise<string> {
  return authenticatedFetch(`${BACKEND_URL}/api/bolt/products/${sku}/payment-link`, {
    method: 'POST',
  })
    .then(response => response.json())
    .then((response: ApiResponse<{ link: string }>) => {
      console.log('Payment link response:', response);
      if (response.success && response.data) {
        return response.data.link;
      }
      throw new Error(response.error);
    });
}

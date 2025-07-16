import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiResponse, LoginResponse, Product, UserProfile } from '@shared-types';
import type { GemPackage } from './types';
import { gemConfig } from './configs/products-config';
import { env } from './configs/env';

const BACKEND_URL = 'http://localhost:3111'

// Helper functions for authentication
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function authenticatedFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  }).then(response => {
    if (response.status === 401) {
      // Token expired, clear it
      localStorage.removeItem('authToken');
      // Optionally redirect to login or throw error
      throw new Error('Authentication expired');
    }
    return response;
  });
}

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

export function login(_username: string, _password: string): Promise<UserProfile> {
  return fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: env.TEST_EMAIL,
      password: env.TEST_PASSWORD,
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
    mutationFn: () => login('testuser', 'password123'),
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
    },
  });
}

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './token-storage';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

export function createServiceClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL });

  // Request interceptor: attach Bearer token
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: handle 401 with token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        // Only redirect if user was previously logged in (had a token)
        const hadToken = tokenStorage.getAccessToken();
        tokenStorage.clear();
        if (hadToken) {
          window.location.href = '/connexion';
        }
        return Promise.reject(error);
      }

      try {
        const iamBaseURL = import.meta.env.VITE_API_IAM_URL || 'http://localhost:3001/api/v1';
        const { data } = await axios.post(`${iamBaseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data?.accessToken ?? data.accessToken;
        const newRefreshToken = data.data?.refreshToken ?? data.refreshToken;

        tokenStorage.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          tokenStorage.setRefreshToken(newRefreshToken);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        window.location.href = '/connexion';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return client;
}

// Pre-configured clients for each microservice
function envUrl(key: string, fallback: string): string {
  return (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || fallback;
}

export const iamClient = createServiceClient(envUrl('VITE_API_IAM_URL', 'http://localhost:3001/api/v1'));
export const planningClient = createServiceClient(envUrl('VITE_API_PLANNING_URL', 'http://localhost:3002/api/v1'));
export const passationClient = createServiceClient(envUrl('VITE_API_PASSATION_URL', 'http://localhost:3003/api/v1'));
export const submissionClient = createServiceClient(envUrl('VITE_API_SUBMISSION_URL', 'http://localhost:3004/api/v1'));
export const evaluationClient = createServiceClient(envUrl('VITE_API_EVALUATION_URL', 'http://localhost:3005/api/v1'));
export const contractClient = createServiceClient(envUrl('VITE_API_CONTRACT_URL', 'http://localhost:3006/api/v1'));
export const executionClient = createServiceClient(envUrl('VITE_API_EXECUTION_URL', 'http://localhost:3007/api/v1'));
export const paymentClient = createServiceClient(envUrl('VITE_API_PAYMENT_URL', 'http://localhost:3008/api/v1'));
export const recoursClient = createServiceClient(envUrl('VITE_API_RECOURS_URL', 'http://localhost:3009/api/v1'));

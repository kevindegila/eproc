import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { iamClient } from '../lib/http-client';
import { tokenStorage } from '../lib/token-storage';

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await iamClient.post('/auth/login', credentials);
      const loginData = data.data ?? data;
      tokenStorage.setAccessToken(loginData.accessToken);
      tokenStorage.setRefreshToken(loginData.refreshToken);
      tokenStorage.setUser(loginData.user);
      return loginData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      tokenStorage.clear();
    },
    onSuccess: () => {
      qc.clear();
    },
  });
};

export const useMe = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => iamClient.post('/auth/me').then((r) => r.data.data ?? r.data),
    enabled: !!tokenStorage.getAccessToken(),
    retry: false,
  });

export const useUsers = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['iam', 'users', params],
    queryFn: () => iamClient.get('/users', { params }).then((r) => r.data),
  });

export const useRoles = () =>
  useQuery({
    queryKey: ['iam', 'roles'],
    queryFn: () => iamClient.get('/roles').then((r) => r.data),
  });

export const useOrganizations = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['iam', 'organizations', params],
    queryFn: () => iamClient.get('/organizations', { params }).then((r) => r.data),
  });

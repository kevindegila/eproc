import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recoursClient } from '../lib/http-client';

export const useAppeals = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['recours', 'appeals', params],
    queryFn: () => recoursClient.get('/appeals', { params }).then((r) => r.data),
  });

export const useAppeal = (id: string) =>
  useQuery({
    queryKey: ['recours', 'appeals', id],
    queryFn: () => recoursClient.get(`/appeals/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useCreateAppeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      recoursClient.post('/appeals', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recours', 'appeals'] }),
  });
};

export const useDecisions = (appealId: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['recours', 'decisions', appealId, params],
    queryFn: () => recoursClient.get(`/appeals/${appealId}/decisions`, { params }).then((r) => r.data),
    enabled: !!appealId,
  });

export const useArbitrations = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['recours', 'arbitrations', params],
    queryFn: () => recoursClient.get('/arbitrations', { params }).then((r) => r.data),
  });

export const useCreateArbitration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      recoursClient.post('/arbitrations', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recours', 'arbitrations'] }),
  });
};

export const useDenunciations = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['recours', 'denunciations', params],
    queryFn: () => recoursClient.get('/denunciations', { params }).then((r) => r.data),
  });

export const useCreateDenunciation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      recoursClient.post('/denunciations', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recours', 'denunciations'] }),
  });
};

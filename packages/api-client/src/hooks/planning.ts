import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningClient } from '../lib/http-client';

export const useForecastPlans = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['planning', 'forecast-plans', params],
    queryFn: () => planningClient.get('/plans', { params }).then((r) => r.data),
  });

export const useForecastPlan = (id: string) =>
  useQuery({
    queryKey: ['planning', 'forecast-plans', id],
    queryFn: () => planningClient.get(`/plans/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useCreateForecastPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      planningClient.post('/plans', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planning', 'forecast-plans'] }),
  });
};

export const useUpdateForecastPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id: string }) =>
      planningClient.put(`/plans/${id}`, data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planning', 'forecast-plans'] }),
  });
};

export const useMarketEntries = (planId?: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['planning', 'market-entries', planId, params],
    queryFn: () =>
      planningClient
        .get(planId ? `/plans/${planId}/entries` : '/entries', { params })
        .then((r) => r.data),
    enabled: planId !== undefined ? !!planId : true,
  });

export const useSubmitPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      planningClient.put(`/plans/${id}/submit`).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planning'] }),
  });
};

export const useUploadPPM = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      planningClient
        .post('/plans/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planning'] }),
  });
};

export const usePublishPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      planningClient.put(`/plans/${id}/publish`).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planning'] }),
  });
};

export const useSearchPpmEntries = (q: string) =>
  useQuery({
    queryKey: ['planning', 'entries-search', q],
    queryFn: () =>
      planningClient.get('/entries/search', { params: { q } }).then((r) => r.data.data ?? r.data),
    enabled: q.length >= 2,
  });

export const useGeneralNotices = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['planning', 'general-notices', params],
    queryFn: () => planningClient.get('/notices', { params }).then((r) => r.data),
  });

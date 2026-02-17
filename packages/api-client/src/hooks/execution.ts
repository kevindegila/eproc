import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executionClient } from '../lib/http-client';

export const useExecutions = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['execution', 'executions', params],
    queryFn: () => executionClient.get('/executions', { params }).then((r) => r.data),
  });

export const useExecution = (id: string) =>
  useQuery({
    queryKey: ['execution', 'executions', id],
    queryFn: () => executionClient.get(`/executions/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useReports = (executionId?: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['execution', 'reports', executionId, params],
    queryFn: () =>
      executionClient
        .get(executionId ? `/executions/${executionId}/reports` : '/reports', { params })
        .then((r) => r.data),
  });

export const useReceptions = (executionId: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['execution', 'receptions', executionId, params],
    queryFn: () => executionClient.get(`/executions/${executionId}/receptions`, { params }).then((r) => r.data),
    enabled: !!executionId,
  });

export const useAmendments = (contractId?: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['execution', 'amendments', contractId, params],
    queryFn: () =>
      executionClient
        .get(contractId ? `/contracts/${contractId}/amendments` : '/amendments', { params })
        .then((r) => r.data),
  });

export const useCreateAmendment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      executionClient.post('/amendments', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['execution'] }),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractClient } from '../lib/http-client';

export const useContracts = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['contract', 'contracts', params],
    queryFn: () => contractClient.get('/contracts', { params }).then((r) => r.data),
  });

export const useContract = (id: string) =>
  useQuery({
    queryKey: ['contract', 'contracts', id],
    queryFn: () => contractClient.get(`/contracts/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useCreateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      contractClient.post('/contracts', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contract', 'contracts'] }),
  });
};

export const useUpdateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id: string }) =>
      contractClient.put(`/contracts/${id}`, data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contract', 'contracts'] }),
  });
};

export const useSignatures = (contractId: string) =>
  useQuery({
    queryKey: ['contract', 'signatures', contractId],
    queryFn: () => contractClient.get(`/signatures/contracts/${contractId}`).then((r) => r.data),
    enabled: !!contractId,
  });

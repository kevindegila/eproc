import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionClient } from '../lib/http-client';

export const useSubmissions = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['submission', 'submissions', params],
    queryFn: () => submissionClient.get('/submissions', { params }).then((r) => r.data),
  });

export const useSubmission = (id: string) =>
  useQuery({
    queryKey: ['submission', 'submissions', id],
    queryFn: () => submissionClient.get(`/submissions/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useCreateSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | Record<string, unknown>) =>
      submissionClient.post('/submissions', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submission', 'submissions'] }),
  });
};

export const useUpdateSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id: string }) =>
      submissionClient.put(`/submissions/${id}`, data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submission', 'submissions'] }),
  });
};

export const useSubmissionFiles = (submissionId: string) =>
  useQuery({
    queryKey: ['submission', 'files', submissionId],
    queryFn: () =>
      submissionClient.get(`/submissions/${submissionId}/files`).then((r) => r.data),
    enabled: !!submissionId,
  });

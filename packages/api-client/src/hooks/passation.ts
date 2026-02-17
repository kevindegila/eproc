import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { passationClient } from '../lib/http-client';

export const useDACs = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['passation', 'dacs', params],
    queryFn: () => passationClient.get('/dacs', { params }).then((r) => r.data),
  });

export const useDAC = (id: string) =>
  useQuery({
    queryKey: ['passation', 'dacs', id],
    queryFn: () => passationClient.get(`/dacs/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useCreateDAC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      passationClient.post('/dacs', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passation', 'dacs'] }),
  });
};

export const useUpdateDAC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id: string }) =>
      passationClient.put(`/dacs/${id}`, data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passation', 'dacs'] }),
  });
};

export const useSubmitDAC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      passationClient.put(`/dacs/${id}/submit`).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passation', 'dacs'] }),
  });
};

export const usePublishDAC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      passationClient.put(`/dacs/${id}/publish`).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passation', 'dacs'] }),
  });
};

export const useCloseDAC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      passationClient.put(`/dacs/${id}/close`).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passation', 'dacs'] }),
  });
};

export const useDocuments = (dacId: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['passation', 'documents', dacId, params],
    queryFn: () => passationClient.get(`/dacs/${dacId}/documents`, { params }).then((r) => r.data),
    enabled: !!dacId,
  });

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dacId, file, category }: { dacId: string; file: File; category?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (category) formData.append('category', category);
      return passationClient
        .post(`/dacs/${dacId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data.data ?? r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passation', 'documents'] }),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      passationClient.delete(`/documents/${id}`).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passation', 'documents'] }),
  });
};

export const useTemplates = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['passation', 'templates', params],
    queryFn: () => passationClient.get('/templates', { params }).then((r) => r.data),
  });

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentClient } from '../lib/http-client';

export const usePaymentRequests = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['payment', 'requests', params],
    queryFn: () => paymentClient.get('/payment-requests', { params }).then((r) => r.data),
  });

export const usePaymentRequest = (id: string) =>
  useQuery({
    queryKey: ['payment', 'requests', id],
    queryFn: () => paymentClient.get(`/payment-requests/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useCreatePaymentRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      paymentClient.post('/payment-requests', data).then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment', 'requests'] }),
  });
};

export const useInvoices = (requestId: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['payment', 'invoices', requestId, params],
    queryFn: () => paymentClient.get(`/requests/${requestId}/invoices`, { params }).then((r) => r.data),
    enabled: !!requestId,
  });

export const usePayments = (requestId: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['payment', 'payments', requestId, params],
    queryFn: () => paymentClient.get(`/requests/${requestId}/payments`, { params }).then((r) => r.data),
    enabled: !!requestId,
  });

export const usePenalties = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['payment', 'penalties', params],
    queryFn: () => paymentClient.get('/penalties', { params }).then((r) => r.data),
  });

export const useGuarantees = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['payment', 'guarantees', params],
    queryFn: () => paymentClient.get('/guarantees', { params }).then((r) => r.data),
  });

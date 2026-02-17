import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationClient } from '../lib/http-client';

export const useOpeningSessions = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['evaluation', 'openings', params],
    queryFn: () => evaluationClient.get('/openings', { params }).then((r) => r.data),
  });

export const useEvaluationSessions = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['evaluation', 'evaluations', params],
    queryFn: () => evaluationClient.get('/evaluations', { params }).then((r) => r.data),
  });

export const useEvaluationSession = (id: string) =>
  useQuery({
    queryKey: ['evaluation', 'evaluations', id],
    queryFn: () =>
      evaluationClient.get(`/evaluations/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

export const useScores = (sessionId: string) =>
  useQuery({
    queryKey: ['evaluation', 'scores', sessionId],
    queryFn: () =>
      evaluationClient.get(`/scores/sessions/${sessionId}/scores`).then((r) => r.data),
    enabled: !!sessionId,
  });

export const useSubmitScores = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      scores,
    }: {
      sessionId: string;
      scores: Record<string, unknown>[];
    }) =>
      evaluationClient
        .post('/scores', { sessionId, scores })
        .then((r) => r.data.data ?? r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluation'] }),
  });
};

export const useAwards = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['evaluation', 'awards', params],
    queryFn: () => evaluationClient.get('/awards', { params }).then((r) => r.data),
  });

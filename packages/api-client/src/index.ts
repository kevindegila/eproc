// HTTP clients
export {
  createServiceClient,
  iamClient,
  planningClient,
  passationClient,
  submissionClient,
  evaluationClient,
  contractClient,
  executionClient,
  paymentClient,
  recoursClient,
} from './lib/http-client';

// Token storage
export { tokenStorage } from './lib/token-storage';

// Auth context
export { AuthProvider, useAuth } from './context/AuthContext';

// Components
export { ProtectedRoute } from './components/ProtectedRoute';
export { LoadingSpinner } from './components/LoadingSpinner';
export { QueryError } from './components/QueryError';

// Hooks - Auth
export { useLogin, useLogout, useMe, useUsers, useRoles, useOrganizations } from './hooks/auth';

// Hooks - Planning
export {
  useForecastPlans,
  useForecastPlan,
  useCreateForecastPlan,
  useUpdateForecastPlan,
  useSubmitPlan,
  usePublishPlan,
  useUploadPPM,
  useMarketEntries,
  useSearchPpmEntries,
  useGeneralNotices,
} from './hooks/planning';

// Hooks - Passation
export {
  useDACs,
  useDAC,
  useCreateDAC,
  useUpdateDAC,
  usePublishDAC,
  useCloseDAC,
  useSubmitDAC,
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useTemplates,
} from './hooks/passation';

// Hooks - Submission
export {
  useSubmissions,
  useSubmission,
  useCreateSubmission,
  useUpdateSubmission,
  useSubmissionFiles,
} from './hooks/submission';

// Hooks - Evaluation
export {
  useOpeningSessions,
  useEvaluationSessions,
  useEvaluationSession,
  useScores,
  useSubmitScores,
  useAwards,
} from './hooks/evaluation';

// Hooks - Contract
export {
  useContracts,
  useContract,
  useCreateContract,
  useUpdateContract,
  useSignatures,
} from './hooks/contract';

// Hooks - Execution
export {
  useExecutions,
  useExecution,
  useReports,
  useReceptions,
  useAmendments,
  useCreateAmendment,
} from './hooks/execution';

// Hooks - Payment
export {
  usePaymentRequests,
  usePaymentRequest,
  useCreatePaymentRequest,
  useInvoices,
  usePayments,
  usePenalties,
  useGuarantees,
} from './hooks/payment';

// Hooks - Recours
export {
  useAppeals,
  useAppeal,
  useCreateAppeal,
  useDecisions,
  useArbitrations,
  useCreateArbitration,
  useDenunciations,
  useCreateDenunciation,
} from './hooks/recours';

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_IAM_URL: string;
  readonly VITE_API_PLANNING_URL: string;
  readonly VITE_API_PASSATION_URL: string;
  readonly VITE_API_SUBMISSION_URL: string;
  readonly VITE_API_EVALUATION_URL: string;
  readonly VITE_API_CONTRACT_URL: string;
  readonly VITE_API_EXECUTION_URL: string;
  readonly VITE_API_PAYMENT_URL: string;
  readonly VITE_API_RECOURS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

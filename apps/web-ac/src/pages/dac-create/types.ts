export interface QualificationCriterion {
  id: string
  name: string
  description: string
  isRequired: boolean
}

export interface EvaluationCriterion {
  id: string
  name: string
  weight: number
}

export interface StagedDocument {
  id: string
  file: File
  category: string
  status: 'pending' | 'uploading' | 'uploaded' | 'error'
}

export interface DocumentCategory {
  code: string
  label: string
}

export const DEFAULT_REQUIRED_DOCUMENTS: DocumentCategory[] = [
  { code: 'CCAG', label: 'Cahier des clauses administratives generales (CCAG)' },
  { code: 'CCTP', label: 'Cahier des clauses techniques particulieres (CCTP)' },
  { code: 'CCAP', label: 'Cahier des clauses administratives particulieres (CCAP)' },
  { code: 'BPU', label: 'Bordereau des prix unitaires (BPU)' },
  { code: 'DQE', label: 'Detail quantitatif et estimatif (DQE)' },
  { code: 'RPAO', label: "Reglement particulier d'appel d'offres (RPAO)" },
]

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  AUTRE: 'Autre document',
}

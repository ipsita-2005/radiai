/**
 * TypeScript type definitions for Ashwini frontend
 */

export interface AnalysisResult {
  id: string;
  modality: ModalityType;
  prediction: string;
  confidence: number;
  severity_score: number;
  uncertainty_std: number;
  is_uncertain: boolean;
  exact_point: ExactPoint;
  processing_time_ms: number;
  pdf_url: string;
  heatmap_url?: string | null;
}

export interface ExactPoint {
  x: number;
  y: number;
}

export type ModalityType = 'mri' | 'chest_ct' | 'head_ct' | 'ecg' | 'xray';

export interface HistoryItem extends AnalysisResult {
  timestamp: string;
  heatmap_path: string;
  pdf_report_path: string;
}

export interface HistoryResponse {
  data: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

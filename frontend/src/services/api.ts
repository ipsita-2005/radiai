/**
 * API Service for communicating with FastAPI backend
 */
import axios, { AxiosProgressEvent } from 'axios';
import type { AnalysisResult, HistoryResponse } from '../types';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload and analyse medical image
 */
export const uploadAndAnalyse = async (
  file: File,
  overrideModality?: string,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (overrideModality) {
    formData.append('override_modality', overrideModality);
  }

  try {
    const response = await api.post<AnalysisResult>('/analyse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Upload failed');
    }
    throw error;
  }
};

/**
 * Get analysis history
 */
export const getHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<HistoryResponse> => {
  try {
    const response = await api.get<HistoryResponse>('/history', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch history');
    }
    throw error;
  }
};

/**
 * Download PDF report
 */
export const downloadReport = async (logId: string): Promise<void> => {
  try {
    const response = await api.get(`/report/${logId}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${logId}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to download report');
    }
    throw error;
  }
};

/**
 * Get heatmap image URL
 */
export const getHeatmapUrl = (heatmapPath: string): string => {
  return `${API_BASE_URL}/${heatmapPath}`;
};

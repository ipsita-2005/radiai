/**
 * Mock API Service for Demo/Testing
 * Use this when backend is not available
 */
import type { AnalysisResult, HistoryResponse, ModalityType } from '../types';

const MOCK_PREDICTIONS = {
  mri: ['Glioma', 'Meningioma', 'Pituitary', 'No Tumour'],
  chest_ct: ['COVID-19', 'Lung Opacity', 'Normal', 'Viral Pneumonia'],
  head_ct: ['Haemorrhage', 'No Haemorrhage'],
  xray: ['Comminuted', 'Displaced', 'Hairline', 'Normal'],
  ecg: ['Myocardial Infarction', 'Abnormal heartbeat', 'History of myocardial infarction', 'Normal', 'Other']
};

export const mockAnalysisResult: AnalysisResult = {
  id: `demo-${Date.now()}`,
  modality: 'chest_ct' as ModalityType,
  prediction: 'Normal',
  confidence: 0.95,
  severity_score: 1.2,
  uncertainty_std: 0.05,
  is_uncertain: false,
  exact_point: { x: 112, y: 98 },
  processing_time_ms: 1234,
  pdf_url: '/demo-report.pdf',
  heatmap_url: null,
};

export const mockHistoryResponse: HistoryResponse = {
  data: [
    {
      ...mockAnalysisResult,
      timestamp: new Date().toISOString(),
      heatmap_path: '',
      pdf_report_path: '/reports/demo.pdf',
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  pages: 1,
};

/**
 * Upload and analyse - MOCK VERSION
 * Returns simulated results after delay
 */
export const uploadAndAnalyse = async (
  file: File,
  overrideModality?: string,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> => {
  // Simulate upload progress
  if (onProgress) {
    for (let i = 0; i <= 100; i += 10) {
      onProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Determine modality
  const modality = (overrideModality || 'chest_ct') as ModalityType;
  
  // Get random prediction for that modality
  const predictions = MOCK_PREDICTIONS[modality] || MOCK_PREDICTIONS.chest_ct;
  const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
  
  // Generate realistic-looking result
  const result: AnalysisResult = {
    ...mockAnalysisResult,
    id: `demo-${Date.now()}`,
    modality,
    prediction: randomPrediction,
    confidence: 0.85 + Math.random() * 0.14, // Random between 0.85-0.99
    severity_score: 1.0 + Math.random() * 3, // Random between 1-4 for normal cases
    uncertainty_std: 0.03 + Math.random() * 0.05,
    is_uncertain: false,
  };

  return result;
};

/**
 * Get history - MOCK VERSION
 */
export const getHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<HistoryResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate some mock history items
  const mockItems: HistoryResponse['data'] = [];
  const modalities: ModalityType[] = ['mri', 'chest_ct', 'head_ct', 'xray', 'ecg'];
  
  for (let i = 0; i < 5; i++) {
    const modality = modalities[i % modalities.length];
    const predictions = MOCK_PREDICTIONS[modality];
    
    mockItems.push({
      id: `demo-history-${i}`,
      modality,
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      confidence: 0.80 + Math.random() * 0.19,
      severity_score: 1.0 + Math.random() * 5,
      uncertainty_std: 0.02 + Math.random() * 0.10,
      is_uncertain: Math.random() > 0.8,
      exact_point: { x: 100 + Math.random() * 24, y: 100 + Math.random() * 24 },
      processing_time_ms: 800 + Math.floor(Math.random() * 1000),
      pdf_url: `/reports/demo-${i}.pdf`,
      heatmap_url: null,
      timestamp: new Date(Date.now() - i * 86400000).toISOString(), // Days ago
      heatmap_path: '',
      pdf_report_path: `/reports/demo-${i}.pdf`,
    });
  }

  return {
    data: mockItems,
    total: mockItems.length,
    page,
    limit,
    pages: 1,
  };
};

/**
 * Download report - MOCK VERSION
 */
export const downloadReport = async (logId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock PDF download
  const pdfContent = `
DEMO REPORT - ${logId}
=====================

This is a demo report generated for testing purposes.

Prediction: Demo Result
Confidence: 95%
Severity Score: 2.5/10

Note: This is a mock report. Connect to actual backend for real reports.

Generated: ${new Date().toISOString()}
  `;
  
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `demo-report-${logId}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Get heatmap URL - MOCK VERSION
 */
export const getHeatmapUrl = (heatmapPath: string): string => {
  // Return a placeholder image or null
  return heatmapPath || '';
};

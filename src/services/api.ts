/**
 * Hybrid API Service - Uses Gemini AI with Mock Fallback
 * Works perfectly on Vercel without backend!
 */
import type { AnalysisResult, HistoryResponse } from '../types';
import { 
  uploadAndAnalyseHybrid, 
  getHistory as getMockHistory, 
  downloadReport as downloadMockReport 
} from './api.gemini';

/**
 * Upload and analyse - HYBRID MODE
 * Tries Gemini AI first, falls back to mock data if API key not configured
 */
export const uploadAndAnalyse = uploadAndAnalyseHybrid;

/**
 * Get history - MOCK MODE
 * Returns demo data for portfolio purposes
 */
export const getHistory = getMockHistory;

/**
 * Download report - MOCK MODE  
 * Generates demo PDF reports
 */
export const downloadReport = downloadMockReport;

/**
 * Get heatmap URL - PLACEHOLDER
 */
export const getHeatmapUrl = (heatmapPath: string): string => {
  return heatmapPath || '';
};

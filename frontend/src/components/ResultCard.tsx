/**
 * ResultCard Component - Display analysis results
 */
import { Download, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { downloadReport } from '../services/api';

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const handleDownloadPDF = async () => {
    try {
      await downloadReport(result.id);
    } catch (error) {
      alert('Failed to download PDF report');
      console.error(error);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 8) return 'CRITICAL';
    if (score >= 6) return 'SEVERE';
    if (score >= 4) return 'MODERATE';
    if (score >= 2) return 'MILD';
    return 'MINIMAL';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
        {result.is_uncertain ? (
          <div className="flex items-center space-x-2 bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/50">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">High Uncertainty</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/50">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Confident</span>
          </div>
        )}
      </div>

      {/* Prediction */}
      <div className="mb-6">
        <p className="text-medical-200 mb-2">Prediction</p>
        <p className="text-3xl font-bold text-white">{result.prediction}</p>
        <p className="text-sm text-medical-300 mt-1">Modality: {result.modality.toUpperCase().replace('_', ' ')}</p>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-medical-200">Confidence</p>
          <p className="text-white font-semibold">{(result.confidence * 100).toFixed(1)}%</p>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              result.confidence > 0.8 ? 'bg-green-500' :
              result.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Severity Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-medical-200">Severity Score</p>
          <p className={`font-bold ${getSeverityColor(result.severity_score)}`}>
            {result.severity_score.toFixed(1)}/10.0
          </p>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getSeverityColor(result.severity_score)}`}
            style={{ width: `${(result.severity_score / 10) * 100}%` }}
          />
        </div>
        <p className={`text-xs mt-2 ${getSeverityColor(result.severity_score)}`}>
          {getSeverityLabel(result.severity_score)}
        </p>
      </div>

      {/* Uncertainty Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-medical-200 text-sm mb-1">Uncertainty (Std)</p>
          <p className="text-xl font-semibold text-white">{result.uncertainty_std.toFixed(4)}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-medical-200 text-sm mb-1">Processing Time</p>
          <p className="text-xl font-semibold text-white">{result.processing_time_ms} ms</p>
        </div>
      </div>

      {/* Exact Point */}
      {result.exact_point && (
        <div className="mb-6 bg-white/5 rounded-lg p-4">
          <p className="text-medical-200 text-sm mb-2">Exact Point of Maximum Activation</p>
          <div className="flex space-x-4">
            <p className="text-white font-semibold">X: {result.exact_point.x.toFixed(0)}</p>
            <p className="text-white font-semibold">Y: {result.exact_point.y.toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownloadPDF}
        className="w-full bg-medical-500 hover:bg-medical-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
      >
        <Download className="w-5 h-5" />
        <span>Download PDF Report</span>
      </button>
    </div>
  );
}

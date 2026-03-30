/**
 * ResultCard Component - Clinical Enterprise Theme
 * Displays analysis results in professional medical format
 */
import { Download, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
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
      console.error('Failed to download PDF report', error);
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
    <div className="clinical-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-clinical-700">
        <h2 className="text-xl font-semibold text-clinical-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent-500" />
          Analysis Results
        </h2>
        {result.is_uncertain ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-700 rounded-sm">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">High Uncertainty</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700 rounded-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Confident</span>
          </div>
        )}
      </div>

      {/* Primary Finding */}
      <div className="mb-6">
        <p className="text-clinical-400 text-sm mb-2 uppercase tracking-wide">Primary Finding</p>
        <p className="text-2xl font-semibold text-clinical-100">{result.prediction}</p>
        <p className="text-clinical-500 text-sm mt-1">
          Modality: <span className="text-clinical-300 font-medium">{result.modality.toUpperCase().replace('_', ' ')}</span>
        </p>
      </div>

      {/* Confidence Metrics */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-clinical-300 text-sm">Confidence Level</p>
          <p className="text-clinical-100 font-semibold text-sm">{(result.confidence * 100).toFixed(1)}%</p>
        </div>
        <div className="w-full bg-clinical-800 rounded-sm h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              result.confidence > 0.8 ? 'bg-green-600' :
              result.confidence > 0.6 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Severity Assessment */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-clinical-300 text-sm">Severity Score</p>
          <p className={`font-semibold text-sm ${getSeverityColor(result.severity_score)}`}>
            {result.severity_score.toFixed(1)}/10.0
          </p>
        </div>
        <div className="w-full bg-clinical-800 rounded-sm h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getSeverityColor(result.severity_score)}`}
            style={{ width: `${(result.severity_score / 10) * 100}%` }}
          />
        </div>
        <p className={`text-xs mt-2 font-medium ${getSeverityColor(result.severity_score)}`}>
          {getSeverityLabel(result.severity_score)}
        </p>
      </div>

      {/* Clinical Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-clinical-800/50 p-3 rounded-sm border border-clinical-700">
          <p className="text-clinical-500 text-xs mb-1">Uncertainty (Std Dev)</p>
          <p className="text-clinical-100 font-mono text-sm">{result.uncertainty_std.toFixed(4)}</p>
        </div>
        <div className="bg-clinical-800/50 p-3 rounded-sm border border-clinical-700">
          <p className="text-clinical-500 text-xs mb-1">Processing Time</p>
          <p className="text-clinical-100 font-mono text-sm">{result.processing_time_ms} ms</p>
        </div>
      </div>

      {/* Peak Activation Coordinates */}
      {result.exact_point && (
        <div className="mb-6 bg-clinical-800/30 p-3 rounded-sm border border-clinical-700">
          <p className="text-clinical-400 text-xs mb-2">Peak Activation Coordinates</p>
          <div className="flex gap-4">
            <code className="bg-clinical-900 px-2 py-1 rounded-sm text-clinical-200 font-mono text-sm">
              X: {result.exact_point.x.toFixed(1)}
            </code>
            <code className="bg-clinical-900 px-2 py-1 rounded-sm text-clinical-200 font-mono text-sm">
              Y: {result.exact_point.y.toFixed(1)}
            </code>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleDownloadPDF}
        className="w-full bg-accent-600 hover:bg-accent-700 text-white font-medium py-2.5 px-4 rounded-sm transition-all flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        <span>Download Clinical Report (PDF)</span>
      </button>
    </div>
  );
}

/**
 * History Page Component - Display past analyses
 */
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import type { HistoryItem, HistoryResponse } from '../types';
import { getHistory, downloadReport } from '../services/api';

interface HistoryPageProps {
  onViewAnalysis?: (analysisId: string) => void;
}

export function HistoryPage({ onViewAnalysis }: HistoryPageProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadHistory(currentPage);
  }, [currentPage]);

  const loadHistory = async (page: number) => {
    try {
      setLoading(true);
      const response: HistoryResponse = await getHistory(page, 20);
      setHistory(response.data);
      setTotalPages(response.pages);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Failed to load history:', error);
      alert('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (logId: string) => {
    try {
      await downloadReport(logId);
    } catch (error) {
      alert('Failed to download PDF report');
      console.error(error);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getModalityLabel = (modality: string) => {
    return modality.toUpperCase().replace('_', ' ');
  };

  const getSeverityColor = (score: number) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-white mb-6">Analysis History</h2>

      {loading ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
          <p className="text-medical-200">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-medical-400" />
          <p className="text-white text-lg">No analyses found</p>
          <p className="text-medical-300 mt-2">Upload a medical image to get started</p>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-medical-200 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-medical-200 uppercase tracking-wider">
                      Modality
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-medical-200 uppercase tracking-wider">
                      Prediction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-medical-200 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-medical-200 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-medical-200 uppercase tracking-wider">
                      Uncertainty
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-medical-200 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-medical-200">
                        {formatDate(item.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {getModalityLabel(item.modality)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {item.prediction}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-24 bg-white/20 rounded-full h-2 mr-2">
                            <div
                              className={`h-full rounded-full ${
                                item.confidence > 0.8 ? 'bg-green-500' :
                                item.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-medical-200">{(item.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getSeverityColor(item.severity_score)}`}>
                        {item.severity_score.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-medical-200">
                        {item.is_uncertain ? (
                          <span className="text-red-400">High ({item.uncertainty_std.toFixed(3)})</span>
                        ) : (
                          <span className="text-green-400">Low ({item.uncertainty_std.toFixed(3)})</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDownload(item.id)}
                          className="text-medical-400 hover:text-medical-300 mr-3 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {onViewAnalysis && (
                          <button
                            onClick={() => onViewAnalysis(item.id)}
                            className="text-medical-400 hover:text-medical-300 transition-colors"
                            title="View Details"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-medical-200 text-sm">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalItems)} of {totalItems} analyses
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <span className="px-4 py-2 bg-white/10 rounded-lg text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

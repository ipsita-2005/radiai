/**
 * Upload Page Component - Main analysis interface
 */
import { useState } from 'react';
import { Upload as UploadIcon, AlertCircle } from 'lucide-react';
import type { AnalysisResult, ModalityType } from '../types';
import { uploadAndAnalyse } from '../services/api';
import { UploadZone } from '../components/UploadZone';
import { ResultCard } from '../components/ResultCard';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';

interface UploadPageProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export function UploadPage({ onAnalysisComplete }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overrideModality, setOverrideModality] = useState<ModalityType | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleModalityOverride = (modality: ModalityType | null) => {
    setOverrideModality(modality);
  };

  const handleAnalyse = async () => {
    if (!selectedFile) return;

    try {
      setIsAnalysing(true);
      setError(null);
      setUploadProgress(0);

      const analysisResult = await uploadAndAnalyse(
        selectedFile,
        overrideModality || undefined,
        (progress) => setUploadProgress(progress)
      );

      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOverrideModality(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Medical Image Analysis</h2>
        <p className="text-medical-200">
          Upload medical images for AI-powered diagnosis with explainability reports
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Upload Zone */}
        <div className="space-y-6">
          {!result ? (
            <>
              <UploadZone
                onFileSelected={handleFileSelected}
                onModalityOverride={handleModalityOverride}
                disabled={isAnalysing}
              />

              {/* Analyse Button */}
              {selectedFile && (
                <button
                  onClick={handleAnalyse}
                  disabled={isAnalysing}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-lg transition-all
                    flex items-center justify-center space-x-2
                    ${isAnalysing
                      ? 'bg-medical-600 cursor-not-allowed'
                      : 'bg-medical-500 hover:bg-medical-600'
                    } text-white
                  `}
                >
                  {isAnalysing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Analysing... {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-6 h-6" />
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>
              )}

              {/* Progress Bar */}
              {isAnalysing && (
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-medical-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold">Analysis Failed</p>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Result Card */}
              <ResultCard result={result} />
              
              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all"
              >
                Analyse Another Image
              </button>
            </>
          )}
        </div>

        {/* Right Column - Explainability Panel */}
        <div>
          {result ? (
            <ExplainabilityPanel result={result} />
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <UploadIcon className="w-16 h-16 mx-auto mb-4 text-medical-400" />
                <p className="text-medical-200 text-lg">
                  Upload an image to see explainability analysis
                </p>
                <p className="text-medical-300 text-sm mt-2">
                  Grad-CAM heatmaps and ECG waveforms will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

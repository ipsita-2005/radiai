/**
 * Upload Page Component - Clinical Enterprise Theme
 * Professional medical imaging interface
 */
import { useState } from 'react';
import { 
  Upload as UploadIcon, 
  AlertCircle,
  Brain, 
  Activity,
  FileScan,
  Bone,
  Heart,
  FileText
} from 'lucide-react';
import type { AnalysisResult, ModalityType } from '../types';
import { uploadAndAnalyse } from '../services/api';
import { UploadZone } from '../components/UploadZone';
import { ResultCard } from '../components/ResultCard.clinical';
import ClinicalImageViewer from '../components/ClinicalImageViewer';

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
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Clinical Header */}
      <div className="mb-8 pb-6 border-b border-clinical-700">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-accent-500" />
          <h1 className="text-3xl font-semibold text-clinical-100">
            Medical Imaging Analysis System
          </h1>
        </div>
        <p className="text-clinical-400 ml-11">
          AI-powered radiology intelligence platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload & Controls */}
        <div className="space-y-6">
          {/* Upload Zone */}
          <div className="clinical-card p-6">
            <h2 className="text-lg font-semibold text-clinical-100 mb-4 flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-accent-500" />
              Upload Medical Scan
            </h2>
            
            <UploadZone 
              onFileSelected={handleFileSelected}
              disabled={isAnalysing}
            />

            {/* Modality Override */}
            {selectedFile && (
              <div className="mt-6 pt-6 border-t border-clinical-700">
                <label className="block text-sm font-medium text-clinical-300 mb-3">
                  Modality Type (Optional Override)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'mri', label: 'MRI', icon: Brain },
                    { id: 'ct', label: 'CT', icon: FileScan },
                    { id: 'xray', label: 'X-Ray', icon: Bone },
                    { id: 'ecg', label: 'ECG', icon: Heart },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleModalityOverride(id as ModalityType)}
                      className={`flex flex-col items-center justify-center p-3 rounded-sm border transition-all ${
                        overrideModality === id
                          ? 'bg-accent-600 border-accent-500 text-white'
                          : 'bg-clinical-800 border-clinical-700 text-clinical-400 hover:border-accent-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analyse Button */}
            {selectedFile && (
              <button
                onClick={handleAnalyse}
                disabled={isAnalysing}
                className={`w-full mt-6 py-3 px-4 rounded-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  isAnalysing
                    ? 'bg-clinical-700 text-clinical-400 cursor-not-allowed'
                    : 'bg-accent-600 text-white hover:bg-accent-700'
                }`}
              >
                {isAnalysing ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Run Analysis
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isAnalysing && (
            <div className="clinical-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-clinical-300">
                  Processing Scan
                </span>
                <span className="text-xs text-clinical-400 font-mono">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-clinical-800 rounded-sm h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-accent-600 to-accent-400 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="clinical-card p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-400 mb-1">
                    Analysis Error
                  </h3>
                  <p className="text-sm text-clinical-300">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {result ? (
            <>
              <ResultCard result={result} />
              
              {/* Grad-CAM Visualization */}
              {(result.heatmap_url || result.exact_point) && (
                <ClinicalImageViewer
                  originalImageUrl={URL.createObjectURL(selectedFile!)}
                  heatmapImageUrl={result.heatmap_url ? `http://localhost:8000/${result.heatmap_url}` : null}
                  exactPoint={result.exact_point}
                />
              )}
            </>
          ) : (
            /* Empty State */
            <div className="clinical-card p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-clinical-800 rounded-full flex items-center justify-center">
                  <FileScan className="w-10 h-10 text-clinical-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-clinical-300 mb-2">
                    No Analysis Results
                  </h3>
                  <p className="text-sm text-clinical-500 max-w-md">
                    Upload a medical scan to view AI-powered analysis results with Grad-CAM explainability visualization
                  </p>
                </div>
                
                {/* Features Preview */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-clinical-700">
                  {[
                    { label: 'Multi-Modal Analysis', icon: Brain },
                    { label: 'Grad-CAM Heatmaps', icon: Activity },
                    { label: 'Severity Scoring', icon: AlertCircle },
                    { label: 'Clinical Reports', icon: FileText },
                  ].map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 text-clinical-500">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

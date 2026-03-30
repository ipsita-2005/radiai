/**
 * Upload Page Component - Enhanced with auto-detection and creative UI
 */
import { useState } from 'react';
import { 
  Upload as UploadIcon, 
  AlertCircle, 
  Sparkles, 
  Brain, 
  Activity,
  FileScan,
  Bone,
  Heart
} from 'lucide-react';
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
      {/* Enhanced Header with Icons */}
      <div className="text-center mb-10 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 animate-pulse">
          <Brain className="w-12 h-12 text-purple-400 opacity-50" />
        </div>
        <div className="absolute top-0 right-1/4 animate-pulse delay-300">
          <Heart className="w-12 h-12 text-red-400 opacity-50" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-spin-slow" />
            <h2 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              AI Medical Imaging
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-spin-slow" />
          </div>
          <p className="text-medical-200 text-lg max-w-2xl mx-auto">
            Advanced multi-modal analysis powered by Google Gemini AI
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">Brain MRI</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
              <FileScan className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">Chest CT</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">ECG</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
              <Bone className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white">X-Ray</span>
            </div>
          </div>
        </div>
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

              {/* Enhanced Analyse Button with Effects */}
              {selectedFile && (
                <>
                  <button
                    onClick={handleAnalyse}
                    disabled={isAnalysing}
                    className={`
                      w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300
                      flex items-center justify-center gap-3 relative overflow-hidden
                      ${isAnalysing
                        ? 'bg-gradient-to-r from-medical-600 to-medical-700 cursor-not-allowed opacity-80'
                        : 'bg-gradient-to-r from-medical-500 via-purple-500 to-medical-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50'
                      } text-white
                    `}
                  >
                    {/* Animated background effect */}
                    {!isAnalysing && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    )}
                    
                    {isAnalysing ? (
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="font-mono">Analysing... {uploadProgress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 relative z-10">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <span>Analyse with AI</span>
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                    )}
                  </button>

                  {/* Enhanced Progress Bar */}
                  {isAnalysing && (
                    <div className="relative">
                      <div className="bg-white/10 backdrop-blur rounded-full h-3 overflow-hidden border border-white/20">
                        <div
                          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full transition-all duration-300 relative"
                          style={{ width: `${uploadProgress}%` }}
                        >
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
                        </div>
                      </div>
                      {/* Percentage indicator */}
                      <div className="absolute -top-7 right-0 text-sm font-mono text-white/80 bg-black/30 px-2 py-0.5 rounded">
                        {uploadProgress}%
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Enhanced Error Message */}
              {error && (
                <div className="bg-red-500/20 backdrop-blur border-2 border-red-500/50 rounded-2xl p-5 flex items-start gap-4 animate-shake">
                  <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300 font-bold text-lg mb-1">Analysis Failed</p>
                    <p className="text-red-200 text-sm leading-relaxed">{error}</p>
                    <button
                      onClick={handleReset}
                      className="mt-3 bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Result Card */}
              <ResultCard result={result} />
              
              {/* Enhanced Reset Button */}
              <button
                onClick={handleReset}
                className="w-full bg-gradient-to-r from-white/20 to-white/30 hover:from-white/30 hover:to-white/40 backdrop-blur text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/30 flex items-center justify-center gap-2"
              >
                <UploadIcon className="w-5 h-5" />
                <span>Analyse Another Image</span>
              </button>

              {/* Helpful Tips */}
              <div className="bg-blue-500/10 backdrop-blur border border-blue-500/30 rounded-xl p-4 mt-4">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Pro Tips
                </h4>
                <ul className="text-blue-200/80 text-sm space-y-1 list-disc list-inside">
                  <li>Select the correct modality for accurate results</li>
                  <li>High-quality images produce better analysis</li>
                  <li>AI provides suggestions, always consult medical professionals</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Explainability Panel */}
        <div>
          {result ? (
            <ExplainabilityPanel result={result} />
          ) : (
            <div className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-white/20 p-8 h-full min-h-[500px] flex items-center justify-center">
              {/* Animated background elements */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-700" />
              
              <div className="text-center relative z-10">
                {/* Icon with animation */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-medical-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-white/10 backdrop-blur rounded-full p-6 border-2 border-white/30">
                    <UploadIcon className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Explainability Analysis
                </h3>
                <p className="text-medical-200 text-lg mb-4 max-w-md">
                  Visualize how the AI "sees" the image
                </p>
                
                {/* Feature list */}
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur px-4 py-3 rounded-xl border border-white/10">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/90">Grad-CAM Heatmaps</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur px-4 py-3 rounded-xl border border-white/10">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200" />
                    <span className="text-white/90">ECG Waveform Visualization</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur px-4 py-3 rounded-xl border border-white/10">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-400" />
                    <span className="text-white/90">Confidence Scoring</span>
                  </div>
                </div>
                
                <p className="text-medical-300 text-sm mt-6 italic opacity-70">
                  Results will appear here after analysis ✨
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

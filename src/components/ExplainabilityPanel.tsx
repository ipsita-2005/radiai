/**
 * ExplainabilityPanel Component - Display GradCAM heatmap and ECG waveform
 */
import { useEffect, useRef, useState } from 'react';
import type { AnalysisResult } from '../types';

interface ExplainabilityPanelProps {
  result: AnalysisResult;
}

export function ExplainabilityPanel({ result }: ExplainabilityPanelProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const [waveformError, setWaveformError] = useState<string | null>(null);

  // Load WaveSurfer for ECG
  useEffect(() => {
    if (result.modality === 'ecg' && waveformRef.current) {
      loadECGWaveform();
    }
  }, [result.modality, result.id]);

  const loadECGWaveform = async () => {
    try {
      // Note: In a real implementation, you'd fetch the actual ECG data
      // For MVP, we'll show a placeholder message
      setWaveformError(null);
    } catch (error) {
      setWaveformError('Failed to load ECG waveform');
      console.error(error);
    }
  };

  const getHeatmapUrl = () => {
    if (result.heatmap_url) {
      return result.heatmap_url;
    }
    return null;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Explainability Analysis</h2>

      {/* GradCAM Heatmap for Image Modalities */}
      {result.modality !== 'ecg' && (
        <div>
          <p className="text-medical-200 mb-4">
            Grad-CAM heatmap showing regions of interest identified by the AI
          </p>
          
          {getHeatmapUrl() ? (
            <div className="rounded-lg overflow-hidden border border-white/20">
              <img
                src={getHeatmapUrl() || ''}
                alt="GradCAM Heatmap"
                className="w-full h-auto"
              />
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <p className="text-medical-300">Heatmap not available for this analysis</p>
            </div>
          )}

          {result.exact_point && (
            <div className="mt-4 bg-white/5 rounded-lg p-4">
              <p className="text-medical-200 text-sm mb-2">
                Maximum activation point indicates the area the model focused on most
              </p>
              <div className="flex space-x-4">
                <div className="flex-1 bg-white/10 rounded p-3">
                  <p className="text-xs text-medical-300 mb-1">X Coordinate</p>
                  <p className="text-lg font-semibold text-white">{result.exact_point.x.toFixed(0)}</p>
                </div>
                <div className="flex-1 bg-white/10 rounded p-3">
                  <p className="text-xs text-medical-300 mb-1">Y Coordinate</p>
                  <p className="text-lg font-semibold text-white">{result.exact_point.y.toFixed(0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ECG Waveform Visualization */}
      {result.modality === 'ecg' && (
        <div>
          <p className="text-medical-200 mb-4">
            ECG signal waveform visualization
          </p>
          
          <div
            ref={waveformRef}
            className="bg-white/5 rounded-lg p-8 min-h-[200px] flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-medical-300 mb-2">ECG Waveform Visualization</p>
              <p className="text-sm text-medical-400">
                WaveSurfer.js would render the interactive ECG waveform here
              </p>
              {waveformError && (
                <p className="text-red-400 mt-4 text-sm">{waveformError}</p>
              )}
            </div>
          </div>

          <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> For full ECG waveform visualization with WaveSurfer.js, 
              the raw ECG data file (.csv) would be loaded and rendered as an interactive waveform.
            </p>
          </div>
        </div>
      )}

      {/* Clinical Context */}
      <div className="mt-6 bg-gradient-to-r from-medical-600/20 to-medical-500/20 rounded-lg p-4 border border-medical-400/30">
        <h3 className="text-lg font-semibold text-white mb-2">What is Grad-CAM?</h3>
        <p className="text-medical-200 text-sm">
          Gradient-weighted Class Activation Mapping (Grad-CAM) highlights the important regions 
          in an image that the convolutional neural network focuses on when making predictions. 
          The heatmap shows which areas contributed most to the diagnosis.
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

interface ClinicalImageViewerProps {
  originalImageUrl: string;
  heatmapImageUrl?: string | null;
  exactPoint?: { x: number; y: number };
}

const ClinicalImageViewer: React.FC<ClinicalImageViewerProps> = ({
  originalImageUrl,
  heatmapImageUrl,
  exactPoint
}) => {
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);
  const [showOverlay, setShowOverlay] = useState(true);

  if (!originalImageUrl) {
    return null;
  }

  return (
    <div className="clinical-card p-4">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-clinical-700">
        <h3 className="text-lg font-semibold text-clinical-100">
          Medical Imaging Analysis
        </h3>
        <p className="text-sm text-clinical-400 mt-1">
          Original Scan & Grad-CAM Heatmap Visualization
        </p>
      </div>

      {/* Image Viewer */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Left Panel: Original Image */}
        <div className="relative">
          <div className="absolute top-2 left-2 bg-clinical-900/90 px-2 py-1 text-xs text-clinical-200 rounded-sm z-10">
            Original Scan
          </div>
          <img
            src={originalImageUrl}
            alt="Original medical scan"
            className="w-full h-auto object-contain bg-clinical-950 rounded-sm"
            style={{ maxHeight: '400px' }}
          />
        </div>

        {/* Right Panel: Heatmap or Overlay */}
        <div className="relative">
          <div className="absolute top-2 left-2 bg-clinical-900/90 px-2 py-1 text-xs text-clinical-200 rounded-sm z-10">
            Grad-CAM Activation Map
          </div>
          
          {heatmapImageUrl ? (
            showOverlay ? (
              // Overlay Mode
              <div className="relative w-full h-auto bg-clinical-950 rounded-sm" style={{ maxHeight: '400px' }}>
                <img
                  src={originalImageUrl}
                  alt="Base scan"
                  className="w-full h-full object-contain absolute inset-0"
                  style={{ maxHeight: '400px' }}
                />
                <img
                  src={heatmapImageUrl}
                  alt="Grad-CAM heatmap"
                  className="w-full h-full object-contain absolute inset-0 opacity-60"
                  style={{ 
                    maxHeight: '400px',
                    opacity: overlayOpacity 
                  }}
                />
              </div>
            ) : (
              // Heatmap Only
              <img
                src={heatmapImageUrl}
                alt="Grad-CAM heatmap"
                className="w-full h-auto object-contain bg-clinical-950 rounded-sm"
                style={{ maxHeight: '400px' }}
              />
            )
          ) : (
            // No heatmap available
            <div className="w-full h-64 flex items-center justify-center bg-clinical-950 rounded-sm">
              <div className="text-center">
                <div className="text-clinical-500 text-sm">
                  Heatmap not available
                </div>
                <div className="text-clinical-600 text-xs mt-1">
                  Grad-CAM analysis pending
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {heatmapImageUrl && (
        <div className="space-y-3 pt-4 border-t border-clinical-700">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-clinical-300 font-medium">
              Overlay Mode
            </label>
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-sm transition-colors ${
                showOverlay ? 'bg-accent-600' : 'bg-clinical-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-sm bg-white transition-transform ${
                  showOverlay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Opacity Slider */}
          {showOverlay && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-clinical-300 font-medium">
                  Heatmap Intensity
                </label>
                <span className="text-xs text-clinical-400 font-mono">
                  {Math.round(overlayOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(overlayOpacity * 100)}
                onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                className="w-full h-2 bg-clinical-700 rounded-lg appearance-none cursor-pointer accent-accent-600"
              />
              <div className="flex justify-between mt-1 text-xs text-clinical-500">
                <span>Transparent</span>
                <span>Opaque</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exact Point Coordinates */}
      {exactPoint && (
        <div className="mt-4 pt-4 border-t border-clinical-700">
          <div className="flex items-center gap-4 text-xs text-clinical-400">
            <span className="font-medium">Peak Activation:</span>
            <code className="bg-clinical-800 px-2 py-1 rounded-sm font-mono">
              X: {exactPoint.x.toFixed(1)}, Y: {exactPoint.y.toFixed(1)}
            </code>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-clinical-700">
        <div className="flex items-center gap-2 text-xs text-clinical-400">
          <span className="font-medium">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 via-green-500 to-red-600 rounded-sm"></div>
            <span>Low → High activation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalImageViewer;

/**
 * UploadZone Component - Drag and drop file upload
 */
import { useState, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import type { ModalityType } from '../types';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onModalityOverride?: (modality: ModalityType | null) => void;
  disabled?: boolean;
}

const MODALITY_OPTIONS: { value: ModalityType; label: string }[] = [
  { value: 'mri', label: 'Brain MRI' },
  { value: 'chest_ct', label: 'Chest CT' },
  { value: 'head_ct', label: 'Head CT' },
  { value: 'xray', label: 'Bone X-Ray' },
  { value: 'ecg', label: 'ECG Signal' },
];

export function UploadZone({ onFileSelected, onModalityOverride, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overrideModality, setOverrideModality] = useState<ModalityType | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file size (50 MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50 MB limit');
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setOverrideModality(null);
    onModalityOverride?.(null);
  };

  const handleModalityChange = (modality: string) => {
    const selectedModality = modality === '' ? null : (modality as ModalityType);
    setOverrideModality(selectedModality);
    onModalityOverride?.(selectedModality);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${isDragging 
              ? 'border-medical-400 bg-medical-500/20' 
              : 'border-white/30 hover:border-medical-400 hover:bg-white/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".jpg,.jpeg,.png,.dcm,.csv"
            onChange={handleFileInput}
            disabled={disabled}
          />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 mx-auto mb-4 text-medical-300" />
            <p className="text-lg font-semibold text-white mb-2">
              Drop your medical image here
            </p>
            <p className="text-medical-200 mb-4">
              or click to browse
            </p>
            <p className="text-sm text-medical-300">
              Supported formats: JPG, PNG, DICOM (.dcm), ECG (.csv)
            </p>
            <p className="text-xs text-medical-400 mt-2">
              Maximum file size: 50 MB
            </p>
          </label>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <File className="w-8 h-8 text-medical-400" />
              <div>
                <p className="text-white font-semibold">{selectedFile.name}</p>
                <p className="text-sm text-medical-200">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleClearFile}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              disabled={disabled}
            >
              <X className="w-5 h-5 text-medical-300" />
            </button>
          </div>

          {/* Modality Override */}
          <div className="mt-4">
            <label className="block text-sm text-medical-200 mb-2">
              Override Modality (Optional):
            </label>
            <select
              value={overrideModality || ''}
              onChange={(e) => handleModalityChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-medical-400"
              disabled={disabled}
            >
              <option value="" className="bg-medical-900">Auto-detect</option>
              {MODALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-medical-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

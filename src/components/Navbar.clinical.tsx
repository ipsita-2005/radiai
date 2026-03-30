/**
 * Navbar Component - Clinical Enterprise Theme
 */
import { Activity, Upload, History } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <nav className="bg-clinical-900 border-b border-clinical-700 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-accent-500" />
            <div>
              <h1 className="text-lg font-semibold text-clinical-100">Ashwini</h1>
              <p className="text-xs text-clinical-400">Radiology Intelligence System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all ${
                currentPage === 'upload'
                  ? 'bg-accent-600 text-white'
                  : 'text-clinical-300 hover:bg-clinical-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all ${
                currentPage === 'history'
                  ? 'bg-accent-600 text-white'
                  : 'text-clinical-300 hover:bg-clinical-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">History</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

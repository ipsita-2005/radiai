/**
 * Navbar Component
 */
import { useState } from 'react';
import { Activity, History, Upload, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-medical-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Ashwini</h1>
              <p className="text-xs text-medical-200">Radiology Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'upload'
                  ? 'bg-medical-500 text-white'
                  : 'text-medical-100 hover:bg-white/10'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'history'
                  ? 'bg-medical-500 text-white'
                  : 'text-medical-100 hover:bg-white/10'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            title="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-medical-700" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

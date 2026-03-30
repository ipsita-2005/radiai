import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import type { AnalysisResult } from './types';

// Import both real and mock API services
// import { uploadAndAnalyse } from './services/api';  // Real backend
import { uploadAndAnalyse as _uploadAndAnalyse } from './services/api.mock';  // Mock data - WORKS WITHOUT BACKEND!

function App() {
  const [currentPage, setCurrentPage] = useState('upload');
  const [_lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setLastAnalysis(result);
  };

  const handleViewAnalysis = (_analysisId: string) => {
    setCurrentPage('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-900 to-medical-700">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className="flex-1">
        {currentPage === 'upload' && (
          <UploadPage 
            onAnalysisComplete={handleAnalysisComplete} 
          />
        )}
        
        {currentPage === 'history' && (
          <HistoryPage onViewAnalysis={handleViewAnalysis} />
        )}
      </main>

      {/* Demo Mode Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm">
        🎯 DEMO MODE - Using mock data. Connect to backend for real analysis.
      </div>
    </div>
  );
}

export default App;

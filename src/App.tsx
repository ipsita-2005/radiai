import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import type { AnalysisResult } from './types';

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
    // For now, just switch to upload page
    // In a full implementation, you'd load the specific analysis
    setCurrentPage('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-900 to-medical-700">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className="flex-1">
        {currentPage === 'upload' && (
          <UploadPage onAnalysisComplete={handleAnalysisComplete} />
        )}
        
        {currentPage === 'history' && (
          <HistoryPage onViewAnalysis={handleViewAnalysis} />
        )}
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { getOfflinePdfBlob, isBookAvailableOffline } from '../services/offlineStorage';

const PDFViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pdfSource, setPdfSource] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const blobUrlRef = useRef(null);
  
  // Get PDF URL and title from location state
  const pdfUrl = location.state?.pdfUrl || '';
  const title = location.state?.title || 'PDF Document';
  const bookDetails = location.state?.bookDetails || {};
  const resourceId = location.state?.resourceId || '';
  
  // Load PDF (offline or online)
  useEffect(() => {
    loadPdf();
    
    // Cleanup blob URL on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [pdfUrl, resourceId]);
  
  const loadPdf = async () => {
    if (!pdfUrl && !resourceId) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if available offline first
      const availableOffline = await isBookAvailableOffline(resourceId);
      
      if (availableOffline) {
        const blob = await getOfflinePdfBlob(resourceId);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          blobUrlRef.current = blobUrl;
          setPdfSource(blobUrl);
          setIsOffline(true);
          setLoading(false);
          return;
        }
      }
      
      // Use Google Docs Viewer for online viewing (avoids CORS issues)
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
      setPdfSource(googleDocsUrl);
      setIsOffline(false);
      setLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      
      // Fallback to Google Docs Viewer
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
      setPdfSource(googleDocsUrl);
      setIsOffline(false);
      setLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!pdfUrl && !pdfSource) return;
    
    try {
      let blob;
      
      if (isOffline && blobUrlRef.current) {
        // Already have the blob from offline storage
        const response = await fetch(pdfSource);
        blob = await response.blob();
      } else {
        // Fetch from online
        const proxyUrl = `http://localhost:8080/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Failed to download PDF');
        blob = await response.blob();
      }
      
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (!pdfUrl && !resourceId) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 md:ml-64 pt-20 pb-24 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">PDF Not Found</h1>
            <button 
              onClick={() => navigate('/books')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
            >
              Go Back to Books
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 pt-20 pb-24 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {/* Header with Title and Actions */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <button 
                onClick={() => navigate('/books')}
                className="text-primary-600 dark:text-primary-400 hover:underline mb-2 flex items-center gap-2"
              >
                ← Back to Books
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {bookDetails.subject && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Subject: {bookDetails.subject} {bookDetails.exam && `• ${bookDetails.exam}`}
                </p>
              )}
              {/* Offline Indicator */}
              {isOffline && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Viewing Offline
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {loading && (
              <div className="flex flex-col justify-center items-center py-20">
                <Loader />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            )}
            
            {!loading && loadError && (
              <div className="p-6 text-center">
                <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 dark:text-red-400 mb-2 font-semibold">Failed to load PDF</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Unable to load the PDF viewer</p>
                <button
                  onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  disabled={!pdfUrl}
                >
                  Open in New Tab Instead
                </button>
              </div>
            )}
            
            {!loading && !loadError && pdfSource && (
              <iframe
                src={pdfSource}
                className="w-full"
                style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
                title={title}
                frameBorder="0"
                onError={() => {
                  console.error('PDF viewer failed');
                  setLoadError(true);
                }}
              />
            )}
          </div>

          {/* Additional Info */}
          {(bookDetails.exam || bookDetails.year || bookDetails.size) && (
            <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {bookDetails.exam && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Exam:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{bookDetails.exam}</p>
                  </div>
                )}
                {bookDetails.year && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Year:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{bookDetails.year}</p>
                  </div>
                )}
                {bookDetails.size && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{bookDetails.size}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default PDFViewer;

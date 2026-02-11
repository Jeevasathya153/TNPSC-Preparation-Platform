import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { 
  getStudyMaterials, 
  getPreviousYearQuestions,
  getSubjects
} from '../services/pdfService';
import { 
  isBookAvailableOffline, 
  downloadBookForOffline, 
  deleteOfflineBook 
} from '../services/offlineStorage';

const Books = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('BOOK');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [offlineStatus, setOfflineStatus] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});

  const categories = [
    { id: 'BOOK', label: 'Study Materials' },
    { id: 'PREVIOUS_YEAR', label: 'Previous Year' }
  ];

  const subjects = getSubjects();

  useEffect(() => { 
    loadMaterials(); 
  }, [selectedCategory, selectedSubject]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      let data = [];
      
      if (selectedCategory === 'BOOK') {
        data = getStudyMaterials(selectedSubject);
      } else {
        data = getPreviousYearQuestions(selectedSubject);
      }
      
      setMaterials(data);
      
      // Check offline status for each material
      await checkOfflineStatus(data);
    } catch (error) {
      console.error('Error loading materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const checkOfflineStatus = async (materialList) => {
    const status = {};
    for (const material of materialList) {
      status[material.id] = await isBookAvailableOffline(material.id);
    }
    setOfflineStatus(status);
  };

  const handleSaveOffline = async (material, e) => {
    e.stopPropagation();
    const materialId = material.id;
    
    // Check if already offline
    if (offlineStatus[materialId]) {
      // Remove from offline
      try {
        await deleteOfflineBook(materialId);
        setOfflineStatus(prev => ({ ...prev, [materialId]: false }));
      } catch (error) {
        console.error('Error removing offline material:', error);
        alert('Failed to remove from offline storage');
      }
      return;
    }
    
    // Download for offline
    try {
      setDownloadProgress(prev => ({ ...prev, [materialId]: 0 }));
      
      await downloadBookForOffline(material, (progress) => {
        setDownloadProgress(prev => ({ ...prev, [materialId]: progress }));
      });
      
      setOfflineStatus(prev => ({ ...prev, [materialId]: true }));
      setDownloadProgress(prev => {
        const newState = { ...prev };
        delete newState[materialId];
        return newState;
      });
    } catch (error) {
      console.error('Error saving offline:', error);
      setDownloadProgress(prev => {
        const newState = { ...prev };
        delete newState[materialId];
        return newState;
      });
      alert('Failed to save offline. Please try again.');
    }
  };

  const handleViewPDF = (material, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    navigate('/pdf-viewer', {
      state: {
        pdfUrl: material.pdfUrl,
        title: material.title,
        resourceId: material.id,
        resourceType: material.category === 'PREVIOUS_YEAR' ? 'previous_year_question' : 'book',
        bookDetails: {
          subject: material.subject,
          exam: material.exam,
          year: material.year,
          size: material.size
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-64 pt-20 pb-24 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📚 Books & Materials</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Free TNPSC study materials & previous year questions
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubject('All');
                  }}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {subjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedSubject === subj
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Materials List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No materials found for "{selectedSubject}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {materials.map(material => {
                const isOffline = offlineStatus[material.id];
                const progress = downloadProgress[material.id];
                
                return (
                  <div
                    key={material.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Title & Badge Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
                          {material.title}
                        </h3>
                        {isOffline && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full shrink-0">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Saved
                          </span>
                        )}
                      </div>
                      
                      {/* Subject Badge */}
                      <div className="mb-4">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                          {material.subject}
                        </span>
                      </div>

                      {/* Download Progress Bar */}
                      {progress !== undefined && (
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Downloading... {progress}%
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleViewPDF(material, e)}
                          className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                          disabled={progress !== undefined}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        
                        <button
                          onClick={(e) => handleSaveOffline(material, e)}
                          className={`px-4 py-2.5 rounded-lg transition-all font-medium ${
                            isOffline 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                          title={isOffline ? 'Remove from offline' : 'Save for offline'}
                          disabled={progress !== undefined}
                        >
                          {isOffline ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Books;

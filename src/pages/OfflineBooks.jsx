import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Loader from '../components/common/Loader';
import { 
  getAllOfflineBooks, 
  deleteOfflineBook,
  getOfflineStorageSize,
  clearAllOfflineData
} from '../services/offlineStorage';

const OfflineBooks = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offlineBooks, setOfflineBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ count: 0, size: 0, sizeFormatted: '0 B' });

  useEffect(() => {
    loadOfflineBooks();
    loadStorageInfo();
  }, []);

  const loadOfflineBooks = async () => {
    setLoading(true);
    try {
      const books = await getAllOfflineBooks();
      setOfflineBooks(books);
    } catch (error) {
      console.error('Error loading offline books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getOfflineStorageSize();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Are you sure you want to remove this book from offline storage?')) {
      return;
    }

    try {
      await deleteOfflineBook(bookId);
      await loadOfflineBooks();
      await loadStorageInfo();
      alert('Book removed from offline storage');
    } catch (error) {
      console.error('Error removing book:', error);
      alert('Failed to remove book');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      return;
    }

    try {
      await clearAllOfflineData();
      await loadOfflineBooks();
      await loadStorageInfo();
      alert('All offline data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear offline data');
    }
  };

  const handleViewBook = (book) => {
    navigate('/pdf-viewer', {
      state: {
        pdfUrl: book.pdfUrl,
        title: book.title,
        resourceId: book.id,
        resourceType: 'book',
        bookDetails: {
          subject: book.subject,
          language: book.language,
          exam: book.exam,
          year: book.year,
          source: book.source,
          totalPages: 0
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
            <button 
              onClick={() => navigate('/books')}
              className="text-primary-600 dark:text-primary-400 hover:underline mb-3 flex items-center gap-2"
            >
              ← Back to Books
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📥 Offline Books</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your downloaded books</p>
          </div>

          {/* Storage Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Storage Information
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Books Downloaded:</span> {storageInfo.count}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Total Size:</span> {storageInfo.sizeFormatted}
                  </p>
                </div>
              </div>
              {storageInfo.count > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Books List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : offlineBooks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No offline books yet
              </p>
              <button
                onClick={() => navigate('/books')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
              >
                Browse Books
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offlineBooks.map(book => (
                <div
                  key={book.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Downloaded Badge */}
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Downloaded
                      </span>
                    </div>

                    <div className="text-5xl mb-3">📚</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      {book.subject && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Subject:</span> {book.subject}
                        </p>
                      )}
                      {book.language && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Language:</span> {book.language}
                        </p>
                      )}
                      {book.size && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Size:</span> {formatBytes(book.size)}
                        </p>
                      )}
                      {book.downloadedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Downloaded: {new Date(book.downloadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewBook(book)}
                        className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
                        title="Remove from offline"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default OfflineBooks;

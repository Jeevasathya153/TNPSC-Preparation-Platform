// Offline storage utility for books using IndexedDB
// User-specific storage - each user's downloads are separate
const DB_NAME = 'tngov_exam_prep';
const DB_VERSION = 3; // Upgraded version for user-specific storage
const STORE_NAME = 'books';
const PDF_STORE_NAME = 'pdfs';

// Get current user ID from sessionStorage (matching authService)
const getCurrentUserId = () => {
  try {
    const userStr = sessionStorage.getItem('tngov_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user._id || user.id || null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
};

// Create user-specific key for book/pdf
const getUserSpecificId = (bookId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('No user logged in - using global storage');
    return bookId;
  }
  return `${userId}_${bookId}`;
};

// Extract original book ID from user-specific key
const extractBookId = (userSpecificId) => {
  const userId = getCurrentUserId();
  if (userId && userSpecificId.startsWith(`${userId}_`)) {
    return userSpecificId.substring(userId.length + 1);
  }
  return userSpecificId;
};

export const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Books metadata store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const bookStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        bookStore.createIndex('subject', 'subject', { unique: false });
        bookStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        bookStore.createIndex('userId', 'userId', { unique: false });
      }
      
      // PDFs blob store
      if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
        const pdfStore = db.createObjectStore(PDF_STORE_NAME, { keyPath: 'id' });
        pdfStore.createIndex('bookId', 'bookId', { unique: false });
        pdfStore.createIndex('userId', 'userId', { unique: false });
      }
    };
  });
};

export const saveBookOffline = async (book, pdfBlob) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User must be logged in to save books offline');
  }
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, PDF_STORE_NAME], 'readwrite');
    const bookStore = transaction.objectStore(STORE_NAME);
    const pdfStore = transaction.objectStore(PDF_STORE_NAME);
    
    const originalBookId = book.id || book._id;
    const userSpecificId = getUserSpecificId(originalBookId);
    
    // Save book metadata with user ID
    const bookData = {
      id: userSpecificId,
      originalId: originalBookId,
      userId: userId,
      title: book.title,
      subject: book.subject,
      language: book.language,
      exam: book.exam,
      year: book.year,
      source: book.source,
      pdfUrl: book.pdfUrl || book.pdfSource,
      downloadedAt: new Date().toISOString(),
      size: pdfBlob.size
    };
    
    // Save PDF blob with user ID
    const pdfData = {
      id: userSpecificId,
      bookId: userSpecificId,
      userId: userId,
      blob: pdfBlob,
      savedAt: new Date().toISOString()
    };
    
    bookStore.put(bookData);
    const pdfRequest = pdfStore.put(pdfData);
    
    pdfRequest.onerror = () => reject(pdfRequest.error);
    pdfRequest.onsuccess = () => resolve(true);
  });
};

export const getOfflineBook = async (bookId) => {
  const db = await initDB();
  const userSpecificId = getUserSpecificId(bookId);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(userSpecificId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllOfflineBooks = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    return []; // No books if not logged in
  }
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Filter books by current user
      const allBooks = request.result || [];
      const userBooks = allBooks.filter(book => book.userId === userId);
      
      // Return with original IDs for display
      const booksWithOriginalIds = userBooks.map(book => ({
        ...book,
        id: book.originalId || extractBookId(book.id)
      }));
      
      resolve(booksWithOriginalIds);
    };
  });
};

export const deleteOfflineBook = async (bookId) => {
  const db = await initDB();
  const userSpecificId = getUserSpecificId(bookId);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, PDF_STORE_NAME], 'readwrite');
    const bookStore = transaction.objectStore(STORE_NAME);
    const pdfStore = transaction.objectStore(PDF_STORE_NAME);
    
    bookStore.delete(userSpecificId);
    const pdfRequest = pdfStore.delete(userSpecificId);
    
    pdfRequest.onerror = () => reject(pdfRequest.error);
    pdfRequest.onsuccess = () => resolve(true);
  });
};

export const downloadBookForOffline = async (book, onProgress) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User must be logged in to download books');
  }
  
  try {
    const fileUrl = book.pdfUrl || book.pdfSource;
    if (!fileUrl) {
      throw new Error('PDF URL not available');
    }

    if (onProgress) onProgress(10); // Starting download
    
    // Use backend proxy (make sure backend is running on port 8080)
    const proxyUrl = `http://localhost:8080/api/pdf-proxy?url=${encodeURIComponent(fileUrl)}`;
    
    if (onProgress) onProgress(20);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download PDF. Make sure backend server is running. Status: ${response.status}`);
    }
    
    if (onProgress) onProgress(40); // Download started
    
    // Get blob directly
    const blob = await response.blob();
    
    if (onProgress) onProgress(80);
    
    // Ensure it's a PDF blob
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    
    if (onProgress) onProgress(95); // Saving to storage
    
    await saveBookOffline(book, pdfBlob);
    
    if (onProgress) onProgress(100); // Complete
    
    return true;
  } catch (error) {
    console.error('Error downloading book for offline:', error);
    throw error;
  }
};

export const getOfflinePdfBlob = async (bookId) => {
  const db = await initDB();
  const userSpecificId = getUserSpecificId(bookId);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PDF_STORE_NAME], 'readonly');
    const store = transaction.objectStore(PDF_STORE_NAME);
    const request = store.get(userSpecificId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (request.result && request.result.blob) {
        resolve(request.result.blob);
      } else {
        resolve(null);
      }
    };
  });
};

export const isBookAvailableOffline = async (bookId) => {
  try {
    const book = await getOfflineBook(bookId);
    return !!book;
  } catch (error) {
    return false;
  }
};

export const getOfflineStorageSize = async () => {
  try {
    const books = await getAllOfflineBooks();
    const totalSize = books.reduce((sum, book) => sum + (book.size || 0), 0);
    return {
      count: books.length,
      size: totalSize,
      sizeFormatted: formatBytes(totalSize)
    };
  } catch (error) {
    return { count: 0, size: 0, sizeFormatted: '0 B' };
  }
};

export const clearAllOfflineData = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    return true; // Nothing to clear if not logged in
  }
  
  // Only clear current user's data
  const db = await initDB();
  const books = await getAllOfflineBooks();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, PDF_STORE_NAME], 'readwrite');
    const bookStore = transaction.objectStore(STORE_NAME);
    const pdfStore = transaction.objectStore(PDF_STORE_NAME);
    
    let completed = 0;
    const total = books.length;
    
    if (total === 0) {
      resolve(true);
      return;
    }
    
    books.forEach(book => {
      const userSpecificId = getUserSpecificId(book.id);
      bookStore.delete(userSpecificId);
      pdfStore.delete(userSpecificId);
      completed++;
      
      if (completed === total) {
        resolve(true);
      }
    });
    
    transaction.onerror = () => reject(transaction.error);
  });
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

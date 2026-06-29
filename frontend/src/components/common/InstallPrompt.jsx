import React, { useEffect, useState } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed the prompt recently (within 7 days)
    const dismissedTime = localStorage.getItem('tngov_install_prompt_dismissed');
    if (dismissedTime) {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime, 10) < sevenDaysMs) {
        return;
      }
    }

    // 3. Detect iOS platform
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // 4. Capture native beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. If iOS, show standard share-to-install prompt after a short delay
    if (iOS) {
      const iosTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(iosTimer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show native prompt
    deferredPrompt.prompt();
    // Wait for response
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    // Save dismissal timestamp
    localStorage.setItem('tngov_install_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl z-50 animate-slide-up border border-indigo-500">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white hover:text-gray-200 bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
        aria-label="Close Prompt"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-base mb-1">Install TN Exam Platform</h3>
          
          {isIOS ? (
            <div className="text-xs text-white/90">
              <p className="mb-2">Install on your iPhone / iPad for offline use:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Tap the <strong>Share</strong> button in Safari</li>
                <li>Tap <strong>"Add to Home Screen"</strong></li>
                <li>Confirm by tapping <strong>"Add"</strong></li>
              </ol>
            </div>
          ) : (
            <>
              <p className="text-xs text-white/90 mb-3">
                Get full offline exam practice, quick startup, and notification support.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg font-bold hover:bg-gray-100 transition-all text-xs flex-1 text-center shadow"
                >
                  📥 Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-indigo-700/50 hover:bg-indigo-700/80 text-white px-3 py-1.5 rounded-lg transition-all text-xs font-semibold"
                >
                  Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;

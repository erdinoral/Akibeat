import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SupportSection({ onClose }) {
  const kreosusContainerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Kreosus script'ini dinamik olarak yükle
    const scriptId = 'kreosus-iframe-api';
    
    // Script zaten yüklenmiş mi kontrol et
    if (document.getElementById(scriptId)) {
      scriptLoadedRef.current = true;
      return;
    }

    // Kreosus script'ini yükle
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://kreosus.com/iframe-api.js';
    script.async = true;
    
    script.onload = () => {
      scriptLoadedRef.current = true;
    };

    script.onerror = () => {
      console.error('Kreosus script yüklenemedi');
    };

    document.body.appendChild(script);

    // Cleanup function - bileşen kapandığında script'i temizle
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
      // Kreosus container'ı temizle
      if (kreosusContainerRef.current) {
        kreosusContainerRef.current.innerHTML = '';
      }
      scriptLoadedRef.current = false;
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0a0a0a] border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.9) 100%)',
          }}
        >
          {/* Gradient Border Glow Effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 rounded-lg blur-sm -z-10" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              💜 Destek Ol
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-purple-500/20"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Açıklama Metni */}
            <div className="mb-6">
              <div className="relative rounded-lg p-[1px]" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                <div
                  className="relative rounded-lg p-4 backdrop-blur-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)',
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.15)',
                  }}
                >
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-purple-300">Akiyom</span> olarak hayallerinizi teknolojiyle buluşturuyoruz. Artan sunucu ve AI maliyetlerimizi karşılamamıza destek olarak{' '}
                    <span className="text-pink-400 font-medium">Akibeat</span>'in bağımsız kalmasına katkıda bulunabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Kreosus Container - Glassmorphism Card with Gradient Border */}
            <div
              className="relative rounded-lg overflow-hidden p-[1px]"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899, #a855f7)',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2), 0 0 40px rgba(236, 72, 153, 0.1)',
              }}
            >
              <div
                className="relative rounded-lg w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(10, 10, 10, 0.95) 100%)',
                  minHeight: '500px',
                }}
              >
                {/* Kreosus Widget */}
                <div
                  id="kreosus"
                  ref={kreosusContainerRef}
                  data-id="5293"
                  data-start-page="0"
                  data-bg-color="0d0d0d"
                  data-iframe-api="true"
                  style={{
                    width: '100%',
                    minHeight: '500px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer - External Link Button */}
          <div className="p-6 border-t border-purple-500/20 flex justify-center">
            <motion.a
              href="https://kreosus.com/akiyom"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>💜</span>
              <span>Tüm Destek Seviyelerini Gör</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SupportSection;

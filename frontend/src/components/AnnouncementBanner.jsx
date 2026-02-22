import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('akibeat_announcement_dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('akibeat_announcement_dismissed', 'true');
  };

  if (isDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="w-full px-4 py-3 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Outer container with gradient border */}
        <div
          className="relative w-full rounded-lg p-[1px]"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899, #a855f7)',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(236, 72, 153, 0.2)',
          }}
        >
          {/* Inner container with glassmorphism background */}
          <div
            className="relative w-full rounded-lg p-4 backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(10, 10, 10, 0.95) 100%)',
            }}
          >
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              {/* Blinking Live Icon */}
              <motion.div
                className="flex items-center gap-2 flex-shrink-0"
                animate={{
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative">
                  <span className="text-lg">🔴</span>
                  <motion.span
                    className="absolute inset-0 text-lg"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    🔴
                  </motion.span>
                </div>
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider hidden sm:inline">
                  Live
                </span>
              </motion.div>

              {/* Message */}
              <div className="flex-1 text-xs sm:text-sm text-gray-200 leading-relaxed min-w-0">
                <span className="text-base sm:text-lg mr-1 sm:mr-2">🚀</span>
                <span>
                  <span className="font-semibold text-purple-300">Akibeat Her Gün Gelişiyor:</span>{' '}
                  Analiz algoritmalarımızı sürekli güncelliyoruz. Uygulamamızı beğendiyseniz mağaza üzerinden bizi değerlendirerek destek olabilir veya{' '}
                  <span className="text-pink-400 font-medium">Görüş/Öneri</span> kısmından fikirlerinizi paylaşabilirsiniz!
                </span>
              </div>

              {/* Close Button */}
              <motion.button
                onClick={handleDismiss}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-500/20 transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Banner'ı kapat"
              >
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AnnouncementBanner;

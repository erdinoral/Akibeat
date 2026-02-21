import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // localStorage kontrolü
    const hasSeenWelcome = localStorage.getItem('akibeat_hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // localStorage'a kaydet
    localStorage.setItem('akibeat_hasSeenWelcome', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-[#0a0a0a] border-2 border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 max-w-2xl w-full overflow-hidden flex flex-col relative"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Border Glow Effect */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 rounded-lg blur-sm -z-10" />
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              🎵 Akibeat'e Hoş Geldiniz!
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-purple-500/20"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-6">
              {/* Bölüm 1: Mantık */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                      Müziğinizin Matematiğini Keşfedin
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Yapay zeka destekli analiz motorumuzla BPM, Key ve Mastering verilerinizi saniyeler içinde analiz edin.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Bölüm 2: İletişim */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💬</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                      Fikirleriniz Bizim İçin Altın Değerinde
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Herhangi bir hata görürseniz veya öneriniz olursa <span className="text-pink-400 font-medium">Görüş ve Öneri</span> kısmından e-posta girmeden bana doğrudan yazabilirsiniz.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Bölüm 3: Değerlendirme */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⭐</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                      Akiyom Topluluğuna Destek Olun
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Eğer analizler işinizi kolaylaştırıyorsa, bizi mağazada değerlendirerek Akiyom topluluğuna destek olabilirsiniz.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-purple-500/20">
            <motion.button
              onClick={handleClose}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white font-bold text-lg rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/30 relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">🚀 Akibeat'i Keşfetmeye Başla</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WelcomeModal;

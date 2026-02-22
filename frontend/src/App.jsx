import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AudioAnalyzer from './components/AudioAnalyzer';
import AnalysisResults from './components/AnalysisResults';
import PromptEngine from './components/PromptEngine';
import MasteringAssistant from './components/MasteringAssistant';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import AnnouncementBanner from './components/AnnouncementBanner';

function App() {
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Welcome Modal */}
      <WelcomeModal />
      
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-purple-500/20 p-6 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse-glow" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-4"
          >
            {/* Animated icon */}
            <motion.div
              className="text-4xl"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              🎧
            </motion.div>
            
            {/* Main title with animated gradient */}
            <div className="flex-1">
              <motion.h1
                className="text-4xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Akibeat
                </span>
                <span className="text-white ml-3 text-2xl font-normal">
                  İhtiyacınız Olan Müzik Analistiniz
                </span>
              </motion.h1>
              
              {/* Subtitle with glow effect */}
              <motion.p
                className="text-gray-400 text-sm mt-2 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse glow-green" />
                <span>Tamamen Offline</span>
                <span className="text-purple-400">•</span>
                <span>Yerel AI Analiz</span>
                <span className="text-purple-400">•</span>
                <span className="text-pink-400">Mastering Assistant</span>
              </motion.p>
            </div>
            
            {/* Decorative elements */}
            <div className="hidden md:flex items-center gap-2">
              <motion.div
                className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scaleY: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                className="w-1 h-12 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scaleY: [1, 1.3, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2
                }}
              />
              <motion.div
                className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scaleY: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4
                }}
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Main Layout - Basit Yatay Satırlar */}
      <main className="w-full max-w-[100%] p-4 space-y-4">
        {/* Satır 1: Ses Dosyası Yükleme - TAM YATAY */}
        <div className="w-full">
          <AudioAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* Satır 2: Analiz Sonuçları - TAM YATAY */}
        {analysisData && (
          <div className="w-full">
            <AnalysisResults data={analysisData} />
          </div>
        )}

        {/* Satır 3: Mastering Assistant - 3 KOLON YATAY */}
        {analysisData?.mastering && Object.keys(analysisData.mastering).length > 0 && (
          <div className="w-full">
            <MasteringAssistant masteringData={analysisData.mastering} genre={analysisData.genre} />
          </div>
        )}

        {/* Satır 4: Prompt Üretimi - TAM YATAY */}
        <div className="w-full">
          <PromptEngine analysisData={analysisData} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

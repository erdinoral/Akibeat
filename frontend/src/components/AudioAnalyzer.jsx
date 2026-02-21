import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { electronAPI } from '../utils/electronAPI';

function AudioAnalyzer({ onAnalysisComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => 
      file.type.startsWith('audio/') || 
      ['.mp3', '.wav', '.flac', '.m4a'].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (audioFile) {
      handleFileSelect(audioFile);
    } else {
      setError('Lütfen geçerli bir ses dosyası seçin (MP3, WAV, FLAC, M4A)');
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const filePath = file.path || file.name;
      if (filePath) {
        const fileWithPath = { ...file, path: filePath, name: file.name };
        handleFileSelect(fileWithPath);
      } else {
        setError('Dosya yolu alınamadı. Lütfen dosyayı sürükleyip bırakın.');
      }
    }
  }, []);

  const handleFileSelect = async (file) => {
    setError(null);
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Lütfen önce bir dosya seçin');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress('');

    try {
      let filePath;
      if (selectedFile.path) {
        filePath = selectedFile.path;
      } else {
        setError('Lütfen dosyayı tekrar seçin (dosya yolu alınamadı)');
        setIsAnalyzing(false);
        return;
      }

      const progressListener = (progressMessage) => {
        console.log('[AudioAnalyzer] Progress:', progressMessage);
        setProgress(progressMessage);
      };
      
      if (electronAPI.isAvailable()) {
        electronAPI.onProgress(progressListener);
      }

      console.log('[AudioAnalyzer] Starting full analysis (with lyrics) for:', filePath);
      setProgress('Analiz başlatılıyor...');
      
      const analysisPromise = electronAPI.isAvailable() && electronAPI.startFullAnalysis
        ? electronAPI.startFullAnalysis(filePath)
        : electronAPI.analyzeAudio(filePath);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Analiz zaman aşımına uğradı. Lütfen tekrar deneyin.')), 600000);
      });
      
      const result = await Promise.race([analysisPromise, timeoutPromise]);
      
      if (electronAPI.isAvailable()) {
        electronAPI.removeProgressListener();
      }
      console.log('[AudioAnalyzer] Analysis result:', result);

      if (result && result.success) {
        console.log('[AudioAnalyzer] Analysis successful, data:', result.data);
        onAnalysisComplete(result.data);
        setProgress('Analiz tamamlandı!');
        
        try {
          await electronAPI.dbPush('analyses', {
            filePath,
            fileName: selectedFile.name,
            timestamp: new Date().toISOString(),
            ...result.data
          });
        } catch (dbError) {
          console.warn('[AudioAnalyzer] Database save failed:', dbError);
        }
      } else {
        const errorMsg = result?.error || 'Analiz başarısız oldu';
        console.error('[AudioAnalyzer] Analysis failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('[AudioAnalyzer] Exception during analysis:', err);
      setError(`Hata: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(''), 2000);
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-purple-500/20 w-full">
      <h2 className="text-lg font-bold mb-3 text-purple-400 flex items-center gap-2">
        🎵 Ses Dosyası Yükle
      </h2>

      {/* BASIT YATAY LAYOUT: Drop Zone + Waveform + Button */}
      <div className="flex flex-row gap-3 items-center w-full">
        {/* Sol: Drag & Drop Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
              transition-all duration-300 h-32 flex flex-col items-center justify-center
              ${isDragging 
                ? 'border-purple-500 bg-purple-500/10 animate-pulse-glow' 
                : 'border-purple-500/30 hover:border-purple-500/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <input
              id="file-input"
              type="file"
              accept="audio/*,.mp3,.wav,.flac,.m4a"
              onChange={handleFileInput}
              className="hidden"
              webkitdirectory="false"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-green-400 text-lg font-semibold">
                  ✓ {selectedFile.name}
                </div>
                <div className="text-sm text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-3xl">🎧</div>
                <div className="text-sm text-gray-300">
                  Dosyayı sürükleyin
                </div>
              </div>
            )}
          </motion.div>

          {/* Progress & Error Messages */}
          <div className="mt-2 space-y-1">
            {progress && (
              <motion.div
                className="p-2 bg-blue-500/20 border border-blue-500/50 rounded text-blue-400 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {progress}
              </motion.div>
            )}
            {error && (
              <motion.div
                className="p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* Orta: Boş Alan veya Gelecekte Başka Bir Görselleştirme */}
        <div className="flex-1 bg-[#0a0a0a] p-3 rounded-lg border border-purple-500/20 h-32 min-w-[200px] flex items-center justify-center">
          <div className="text-gray-600 text-xs text-center">
            {selectedFile ? 'Dosya seçildi' : 'Dosya seçin'}
          </div>
        </div>

        {/* Sağ: Analyze Button */}
        <div className="flex items-center">
          {selectedFile && (
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all button-press glow-purple whitespace-nowrap"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAnalyzing ? 'Analiz...' : 'Analiz Et'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AudioAnalyzer;

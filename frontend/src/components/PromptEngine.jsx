import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { electronAPI } from '../utils/electronAPI';

function PromptEngine({ analysisData }) {
  const [userRequest, setUserRequest] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!analysisData) {
      setError('Lütfen önce bir ses dosyası analiz edin');
      return;
    }

    if (!userRequest.trim()) {
      setError('Lütfen bir istek girin');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedPrompt('');

    try {
      const result = await electronAPI.generatePrompt(analysisData, userRequest);

      if (result.success) {
        setGeneratedPrompt(result.data);
        
        try {
          await electronAPI.dbPush('prompts', {
            analysisData,
            userRequest,
            generatedPrompt: result.data,
            timestamp: new Date().toISOString()
          });
        } catch (dbError) {
          console.warn('Database save failed:', dbError);
        }
      } else {
        setError(result.error || 'Prompt üretimi başarısız oldu');
      }
    } catch (err) {
      setError(`Hata: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedPrompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        const button = document.getElementById('copy-button');
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✓ Kopyalandı!';
          button.classList.add('bg-green-500');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-500');
          }, 2000);
        }
      } catch (err) {
        setError('Kopyalama başarısız oldu');
      }
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-purple-500/20 w-full">
      <h2 className="text-lg font-bold mb-3 text-purple-400 flex items-center gap-2">
        🧠 Prompt Üretimi
      </h2>

      {/* BASIT YATAY: Input + Output */}
      <div className="flex flex-row gap-3 w-full">


        {/* Sol: Input Area */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Genre-based Style Tags Display */}
          {analysisData?.genre && (
            <div className="bg-[#0a0a0a] p-2 rounded-lg border border-purple-500/20">
              <div className="text-xs text-gray-400 mb-1 uppercase">Tür: {analysisData.genre}</div>
              <div className="flex flex-wrap gap-1">
                {analysisData.genre && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                    {analysisData.genre} Style
                  </span>
                )}
                {analysisData.genre_probabilities && Object.entries(analysisData.genre_probabilities)
                  .filter(([g, p]) => g !== analysisData.genre && p > 0.1)
                  .slice(0, 2)
                  .map(([genre, prob]) => (
                    <span key={genre} className="px-2 py-1 bg-pink-500/10 text-pink-400 text-xs rounded border border-pink-500/20">
                      {genre} ({(prob * 100).toFixed(0)}%)
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* User Request Input */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase">İsteğiniz (Türkçe)</label>
            <textarea
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              placeholder={analysisData?.genre 
                ? `Örn: Bu ${analysisData.genre} şarkıyı daha agresif hale getir`
                : "Örn: Bu şarkıyı daha agresif ve gece sürüşü moduna sok"}
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-purple-500/30 rounded-lg text-white text-sm placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              rows={4}
            />
          </div>

          {/* Generate Button */}
          <motion.button
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all button-press glow-purple disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            onClick={handleGenerate}
            disabled={isGenerating || !analysisData || !userRequest.trim()}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
          >
            {isGenerating ? 'Üretiliyor...' : 'Prompt Üret'}
          </motion.button>

          {/* Error Message */}
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

        {/* Sağ: Generated Prompt Output */}
        <div className="flex-1 min-w-0">
          {generatedPrompt ? (
            <motion.div
              className="bg-[#0a0a0a] p-3 rounded-lg border border-purple-500/20 h-full flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-400 uppercase">Üretilen Prompt</div>
                <button
                  id="copy-button"
                  onClick={handleCopy}
                  className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30 transition-colors"
                >
                  Kopyala
                </button>
              </div>
              <div className="text-xs text-gray-300 font-mono bg-[#000000] p-3 rounded border border-purple-500/10 flex-1 overflow-y-auto custom-scrollbar mb-2">
                {generatedPrompt}
              </div>
              {/* Deneysel Mod Uyarısı */}
              <div className="text-[0.85rem] text-gray-500 mt-2 pt-2 border-t border-purple-500/10 space-y-1">
                <div>
                  <span className="text-yellow-400">⚠️</span> Not: Bu mod deneyseldir. Sonuçlara tamamen bağlı kalmayın; en iyi sonucu elde etmek için üzerinde ufak düzenlemeler ve ekle-çıkar yapmayı deneyin.
                </div>
                <div className="text-[0.75rem] text-gray-600 italic">
                  Akiyom tarafından geliştirilmiştir
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0a0a0a] p-3 rounded-lg border border-purple-500/20 h-full flex items-center justify-center text-gray-600 text-xs">
              Prompt üretildikten sonra burada görünecek
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PromptEngine;

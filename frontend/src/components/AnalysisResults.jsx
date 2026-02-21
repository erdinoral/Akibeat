import React from 'react';
import { motion } from 'framer-motion';
import LEDDisplay from './ui/LEDDisplay';
import DJFader from './ui/DJFader';
import GenreBadge from './ui/GenreBadge';
import SpectralEqualizer from './ui/SpectralEqualizer';

function AnalysisResults({ data }) {
  if (!data) {
    return (
      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-purple-500/20">
        <h2 className="text-xl font-bold mb-4 text-purple-400">📊 Analiz Sonuçları</h2>
        <p className="text-gray-400 text-center py-8">
          Analiz sonuçları burada görünecek
        </p>
      </div>
    );
  }


  return (
    <motion.div
      className="bg-[#1a1a1a] p-3 rounded-lg border border-purple-500/20 w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-base font-bold mb-2 text-purple-400 flex items-center gap-2">
        📊 Analiz Sonuçları
      </h2>

      {/* Üst Satır: Temel Metrikler - Daha Kompakt */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {/* BPM */}
        <LEDDisplay
          label="BPM"
          value={data.bpm}
          unit="BPM"
          color="purple"
        />

        {/* Key */}
        <LEDDisplay
          label="Key"
          value={data.key}
          color="pink"
        />

        {/* Energy */}
        <DJFader
          label="Energy"
          value={data.energy}
          min={0}
          max={100}
          color="purple"
        />

        {/* Loudness */}
        <DJFader
          label="Loudness"
          value={data.loudness}
          min={0}
          max={100}
          color="pink"
        />
      </div>

      {/* Orta Satır: Genre, Spectral Centroid ve Spectral Equalizer - Yatay */}
      <div className="grid grid-cols-6 gap-2 mb-2">
        {/* Genre Badge */}
        <div className="col-span-2 flex items-center justify-center">
          <GenreBadge
            genre={data.genre}
            confidence={data.genre_confidence}
          />
        </div>

        {/* Spectral Centroid */}
        <div className="col-span-1">
          <LEDDisplay
            label="Spectral Centroid"
            value={Math.round(data.spectral_centroid)}
            unit="Hz"
            color="green"
          />
        </div>

        {/* Spectral Equalizer */}
        <div className="col-span-3 bg-[#0a0a0a] p-2 rounded-lg border border-purple-500/20">
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
            SPECTRAL EQUALIZER
          </div>
          <div className="h-16">
            {data.spectral_magnitude ? (
              <SpectralEqualizer
                frequencies={data.spectral_magnitude.map(v => Math.max(0.1, Math.min(1, v * 0.7 + 0.3)))}
                isActive={true}
              />
            ) : (
              <SpectralEqualizer
                frequencies={Array.from({ length: 20 }, () => 0.1)}
                isActive={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Alt Satır: Genre Probabilities ve Lyrics - Yatay */}
      <div className="grid grid-cols-2 gap-2">
        {/* Genre Probabilities */}
        {data.genre_probabilities && (
          <div className="bg-[#0a0a0a] p-2 rounded-lg border border-purple-500/20">
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
              Genre Olasılıkları
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(data.genre_probabilities)
                .sort(([, a], [, b]) => b - a)
                .map(([genre, prob]) => (
                  <div key={genre} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] text-gray-300 truncate flex-1 mr-1">{genre}</span>
                      <span className="text-[0.7rem] text-purple-400 font-bold whitespace-nowrap">
                        {(prob * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${prob * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Lyrics Card */}
        {data.lyrics && data.lyrics.trim() && (
          <motion.div
            className="bg-[#0a0a0a] p-2 rounded-lg border border-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-2">
              🎤 Şarkı Sözleri
            </div>
            <div className="text-[0.7rem] text-gray-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {data.lyrics}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AnalysisResults;

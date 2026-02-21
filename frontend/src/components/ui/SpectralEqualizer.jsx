import React from 'react';
import { motion } from 'framer-motion';

function SpectralEqualizer({ frequencies = [], isActive = false }) {
  // Generate default frequencies if none provided
  const defaultFreqs = Array.from({ length: 20 }, () => Math.random() * 0.5 + 0.3);
  const displayFreqs = frequencies.length > 0 ? frequencies : defaultFreqs;

  return (
    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-purple-500/20">
      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Spectral Equalizer</div>
      <div className="flex items-end justify-between gap-1 h-32">
        {displayFreqs.map((freq, index) => (
          <motion.div
            key={index}
            className="equalizer-bar flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
            style={{
              height: `${freq * 100}%`,
              '--delay': `${index * 0.05}s`,
            }}
            animate={
              isActive
                ? {
                    scaleY: [0.3, 1, 0.3],
                  }
                : {}
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.05,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SpectralEqualizer;

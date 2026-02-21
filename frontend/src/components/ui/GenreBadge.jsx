import React from 'react';
import { motion } from 'framer-motion';

function GenreBadge({ genre, confidence }) {
  const genreColors = {
    'Dark Phonk': 'bg-red-500/20 text-red-400 border-red-500/50',
    'Drift Phonk': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'Ambient': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };

  const colorClass = genreColors[genre] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${colorClass} animate-pulse-glow`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="font-bold text-xs">{genre}</span>
      <span className="text-[0.7rem] opacity-75">
        {Math.round(confidence * 100)}%
      </span>
    </motion.div>
  );
}

export default GenreBadge;

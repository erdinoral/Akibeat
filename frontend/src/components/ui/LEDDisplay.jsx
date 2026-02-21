import React from 'react';
import { motion } from 'framer-motion';

function LEDDisplay({ label, value, unit = '', color = 'purple' }) {
  const colorClasses = {
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    green: 'text-green-400',
    red: 'text-red-400',
  };

  return (
    <div className="bg-[#0a0a0a] p-2 rounded-lg border border-purple-500/20 h-full flex flex-col justify-between">
      <div className="text-[0.7rem] text-gray-400 mb-0.5 uppercase tracking-wider">{label}</div>
      <motion.div
        className={`led-display text-2xl font-bold ${colorClasses[color]}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </motion.div>
    </div>
  );
}

export default LEDDisplay;

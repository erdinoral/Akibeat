import React from 'react';
import { motion } from 'framer-motion';

function DJFader({ label, value, min = 0, max = 100, color = 'purple', onChange }) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const colorClasses = {
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-purple-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <div className="bg-[#0a0a0a] p-2 rounded-lg border border-purple-500/20 h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
          {Math.round(value)}
        </span>
      </div>
      <div className="dj-fader h-5 relative rounded">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={!onChange}
        />
      </div>
    </div>
  );
}

export default DJFader;

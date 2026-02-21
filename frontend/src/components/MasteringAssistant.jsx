import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function MasteringAssistant({ masteringData, genre }) {
  if (!masteringData || Object.keys(masteringData).length === 0) {
    return null;
  }

  const lufs = masteringData.lufs || -20;
  const peak = masteringData.peak || {};
  const freqBalance = masteringData.frequency_balance || {};
  const transients = masteringData.transients || {};
  const recommendations = masteringData.recommendations || [];
  const canvasRef = useRef(null);

  // CSS Variables for dynamic colors
  const peakColor = useMemo(() => {
    const peakDbfs = peak.peak_dbfs || -1;
    return peakDbfs > -0.3 ? '#ff0055' : '#00ffcc';
  }, [peak.peak_dbfs]);

  // LUFS bar calculation
  const lufsWidth = useMemo(() => {
    const normalized = ((lufs + 24) / 24) * 100;
    return Math.max(0, Math.min(100, normalized));
  }, [lufs]);

  const lufsBarColor = useMemo(() => {
    if (lufs < -16) return 'from-green-500 via-emerald-400 to-green-500';
    if (lufs < -14) return 'from-green-400 via-yellow-400 to-yellow-500';
    if (lufs < -12) return 'from-yellow-500 via-pink-500 to-pink-600';
    return 'from-pink-600 via-red-500 to-red-600';
  }, [lufs]);

  // Get actual FFT spectrum data
  const spectrumData = useMemo(() => {
    if (freqBalance.spectrum_data && freqBalance.pink_noise_data) {
      return {
        spectrum: freqBalance.spectrum_data,
        pinkNoise: freqBalance.pink_noise_data
      };
    }
    const bins = 64;
    const spectrum = [];
    const pinkNoise = [];
    
    for (let i = 0; i < bins; i++) {
      const freq = 20 * Math.pow(20000 / 20, i / bins);
      pinkNoise.push(1 / (freq + 1));
      
      let amplitude = 0.5;
      if (freq < 200) {
        amplitude = 0.5 + (freqBalance.low_db_diff || 0) / 20;
      } else if (freq < 5000) {
        amplitude = 0.5 + (freqBalance.mid_db_diff || 0) / 20;
      } else {
        amplitude = 0.5 + (freqBalance.high_db_diff || 0) / 20;
      }
      spectrum.push(Math.max(0, Math.min(1, amplitude)));
    }
    
    const maxPink = Math.max(...pinkNoise);
    return {
      spectrum: spectrum,
      pinkNoise: pinkNoise.map(v => v / maxPink)
    };
  }, [freqBalance]);

  // Canvas drawing
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    const bins = spectrumData.spectrum.length;
    const binWidth = width / bins;
    
    // Pink Noise reference
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    for (let i = 0; i < bins; i++) {
      const x = i * binWidth;
      const y = height - (spectrumData.pinkNoise[i] * height * 0.8) - height * 0.1;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Actual spectrum
    ctx.setLineDash([]);
    ctx.strokeStyle = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < bins; i++) {
      const x = i * binWidth;
      const y = height - (spectrumData.spectrum[i] * height * 0.8) - height * 0.1;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // High energy regions
    const threshold = 0.1;
    for (let i = 0; i < bins; i++) {
      if (spectrumData.spectrum[i] > spectrumData.pinkNoise[i] + threshold) {
        const x = i * binWidth;
        const y = height - (spectrumData.spectrum[i] * height * 0.8) - height * 0.1;
        ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
        ctx.fillRect(x - binWidth/2, y - 2, binWidth, 4);
      }
    }
  }, [spectrumData]);

  // Smart Tips Logic Gate
  const smartTips = useMemo(() => {
    const tips = [];
    const peakDbfs = peak.peak_dbfs || -1;
    const lowEnergyBalance = freqBalance.low_db_diff || 0;
    const midEnergyBalance = freqBalance.mid_db_diff || 0;
    const highEnergyBalance = freqBalance.high_db_diff || 0;
    
    if (peakDbfs > -0.1) {
      tips.push({
        type: 'error',
        message: '⚠️ Peak çok yüksek, -1dB True Peak limiter kullan.',
        priority: 1
      });
    } else if (lufs > -8) {
      tips.push({
        type: 'warning',
        message: '🔥 Parça çok sıcak (loud)! Phonk için uygun ama dinamik ezilmiş.',
        priority: 2
      });
    }
    
    if (lowEnergyBalance > 5) {
      tips.push({
        type: 'warning',
        message: '🎸 Baslar referanstan 5dB daha güçlü, EQ ile tıraşla.',
        priority: 2
      });
    }
    
    if (midEnergyBalance > 5) {
      tips.push({
        type: 'warning',
        message: '🎹 Mid-range fazla parlak, 2-5kHz aralığını kontrol et.',
        priority: 2
      });
    }
    
    if (highEnergyBalance > 5) {
      tips.push({
        type: 'warning',
        message: '✨ High-end fazla parlak, 8kHz+ aralığını azalt.',
        priority: 2
      });
    }
    
    return tips.sort((a, b) => a.priority - b.priority);
  }, [peak, lufs, freqBalance]);

  // Crest Factor Gauge
  const crestFactor = transients.crest_factor_db || 0;
  const gaugeAngle = useMemo(() => {
    if (crestFactor < 8) {
      return (crestFactor / 8) * 60;
    } else if (crestFactor < 12) {
      return 60 + ((crestFactor - 8) / 4) * 60;
    } else {
      return 120 + Math.min(60, ((crestFactor - 12) / 8) * 60);
    }
  }, [crestFactor]);

  const gaugeLabel = useMemo(() => {
    if (crestFactor < 8) return 'Crushed';
    if (crestFactor < 12) return 'Normal';
    return 'Dynamic/Punchy';
  }, [crestFactor]);

  const gaugeColor = useMemo(() => {
    if (crestFactor < 8) return '#ff0055';
    if (crestFactor < 12) return '#00ffcc';
    return '#00ff00';
  }, [crestFactor]);

  return (
    <motion.div
      className="bg-[#0a0a0a]/80 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30 shadow-lg shadow-purple-500/10 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 26, 0.8) 100%)',
        '--peak-color': peakColor,
        '--lufs-width': `${lufsWidth}%`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          className="text-xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎚️
        </motion.div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Mastering Assistant
        </h3>
      </div>

      {/* BASIT YATAY: 3 Kolon */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {/* Sütun 1: Loudness & Peak */}
        <div className="space-y-4">
          {/* LUFS Bar */}
          <div className="bg-[#1a1a1a]/50 p-4 rounded-lg border border-purple-500/20">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
              LUFS (Loudness)
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-2xl font-bold font-mono ${
                lufs < -16 ? 'text-green-400' : 
                lufs < -12 ? 'text-yellow-400' : 
                'text-pink-400'
              }`}>
                {lufs.toFixed(1)} LUFS
              </span>
            </div>
            <div className="relative h-6 bg-[#0a0a0a] rounded-full overflow-hidden border border-purple-500/20">
              <motion.div
                className={`h-full bg-gradient-to-r ${lufsBarColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `calc(100% * (${lufs} + 24) / 24)` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
              <span>-24</span>
              <span className="text-purple-400">Hedef: -14</span>
              <span>0</span>
            </div>
          </div>

          {/* True Peak */}
          <div className="bg-[#1a1a1a]/50 p-4 rounded-lg border border-purple-500/20">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
              True Peak
            </div>
            <div className="flex justify-between items-center">
              <motion.div
                className="text-2xl font-bold font-mono"
                style={{ color: peakColor }}
                animate={peak.clipping_detected ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: peak.clipping_detected ? Infinity : 0 }}
              >
                {peak.peak_dbfs ? peak.peak_dbfs.toFixed(2) : '-1.00'} dBFS
              </motion.div>
            </div>
            {peak.clipping_detected && (
              <motion.div
                className="mt-3 text-sm text-red-400 font-semibold flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-lg">⚠️</span>
                <span>CLIPPING TESPİT EDİLDİ!</span>
              </motion.div>
            )}
          </div>

          {/* Transient Punch Meter (Gauge) */}
          <div className="bg-[#1a1a1a]/50 p-4 rounded-lg border border-purple-500/20">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
              Transient "Punch" Meter
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <path
                    d="M 10,50 A 40,40 0 0,1 90,50"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="8"
                  />
                  <path
                    d="M 10,50 A 40,40 0 0,1 50,10"
                    fill="none"
                    stroke="#ff0055"
                    strokeWidth="6"
                    opacity="0.3"
                  />
                  <path
                    d="M 50,10 A 40,40 0 0,1 90,50"
                    fill="none"
                    stroke="#00ffcc"
                    strokeWidth="6"
                    opacity="0.3"
                  />
                  <line
                    x1="50"
                    y1="50"
                    x2={50 + 40 * Math.cos((gaugeAngle - 90) * Math.PI / 180)}
                    y2={50 + 40 * Math.sin((gaugeAngle - 90) * Math.PI / 180)}
                    stroke={gaugeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 5px ${gaugeColor})`
                    }}
                  />
                  <circle cx="50" cy="50" r="4" fill={gaugeColor} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-lg font-bold font-mono" style={{ color: gaugeColor }}>
                    {crestFactor.toFixed(1)} dB
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{gaugeLabel}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Crushed</span>
              <span>Normal</span>
              <span>Punchy</span>
            </div>
          </div>
        </div>

        {/* Sütun 2: Frequency Balance (Geniş Canvas) */}
        <div className="bg-[#1a1a1a]/50 p-4 rounded-lg border border-purple-500/20">
          <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
            Frekans Dengesi (Pink Noise Referans)
          </div>
          <div className="relative h-64 bg-[#0a0a0a] rounded border border-purple-500/20 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={256}
              className="w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-gray-500 bg-[#0a0a0a]/50">
              <span>20Hz</span>
              <span>200Hz</span>
              <span>2kHz</span>
              <span>20kHz</span>
            </div>
          </div>
          
          {/* Band Analysis */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {['Low', 'Mid', 'High'].map((band, idx) => {
              const dbDiff = idx === 0 ? freqBalance.low_db_diff : idx === 1 ? freqBalance.mid_db_diff : freqBalance.high_db_diff;
              const isHighEnergy = dbDiff > 3;
              return (
                <div
                  key={band}
                  className={`text-center p-2 rounded border ${
                    isHighEnergy ? 'border-yellow-500/50 bg-yellow-500/10' :
                    dbDiff < -3 ? 'border-blue-500/50 bg-blue-500/10' :
                    'border-gray-500/30 bg-gray-500/5'
                  }`}
                >
                  <div className="text-xs text-gray-400">{band}</div>
                  <div className={`text-sm font-bold ${
                    isHighEnergy ? 'text-yellow-400' :
                    dbDiff < -3 ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {dbDiff ? dbDiff.toFixed(1) : '0.0'} dB
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sütun 3: Smart Tips (Akıllı Tavsiyeler) */}
        <div className="space-y-4">
          {/* Smart Tips Logic Gate */}
          {smartTips.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <span>Akıllı Tavsiyeler</span>
              </div>
              <div className="space-y-3">
                {smartTips.map((tip, index) => (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      tip.type === 'error' ? 'border-red-500/50 bg-red-500/10' :
                      tip.type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' :
                      'border-green-500/50 bg-green-500/10'
                    } backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`text-sm font-semibold ${
                      tip.type === 'error' ? 'text-red-400' : 
                      tip.type === 'warning' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {tip.message}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Original Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span>Detaylı Tavsiyeler</span>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, index) => {
                  const style = {
                    error: { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400', icon: '🚨' },
                    warning: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: '⚠️' },
                    success: { border: 'border-green-500/50', bg: 'bg-green-500/10', text: 'text-green-400', icon: '✅' }
                  }[rec.type] || { border: 'border-gray-500/50', bg: 'bg-gray-500/10', text: 'text-gray-400', icon: '💡' };
                  
                  return (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg border ${style.border} ${style.bg} backdrop-blur-sm`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`text-sm font-semibold ${style.text} flex items-start gap-2`}>
                        <span className="text-lg">{style.icon}</span>
                        <span className="flex-1">{rec.message}</span>
                      </div>
                      {rec.action && (
                        <div className="text-xs text-gray-400 mt-2 ml-7 flex items-center gap-1">
                          <span>→</span>
                          <span>{rec.action}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}

export default MasteringAssistant;

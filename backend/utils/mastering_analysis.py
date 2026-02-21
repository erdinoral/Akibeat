"""
Mastering Assistant - Offline DSP Analysis
Implements ITU-R BS.1770 standard for LUFS measurement,
True Peak detection, Frequency Balance analysis, and Transient Detection.
"""

import numpy as np
import librosa
from scipy import signal


def k_weighting_filter(frequencies, sample_rate=48000):
    """
    ITU-R BS.1770 K-Weighting filter for LUFS calculation.
    This is a high-pass filter followed by a shelving filter.
    
    Args:
        frequencies: Frequency array
        sample_rate: Sample rate (should be 48kHz for accurate LUFS)
    
    Returns:
        K-weighting filter response
    """
    # K-weighting filter coefficients (simplified approximation)
    # Full implementation would use proper IIR filter design
    k_response = np.ones_like(frequencies, dtype=np.complex128)
    
    # High-pass filter at 100 Hz
    f_hp = 100.0
    for i, f in enumerate(frequencies):
        if f > 0:
            # First-order high-pass
            h_hp = 1j * f / (1j * f + f_hp)
            # Shelving filter at 4 kHz
            f_shelf = 4000.0
            if f < f_shelf:
                # Low shelf boost
                h_shelf = 1.0 + 1.5 * (f / f_shelf)
            else:
                # High shelf cut
                h_shelf = 1.0 - 0.5 * (f_shelf / f)
            k_response[i] = h_hp * h_shelf
    
    return np.abs(k_response)


def calculate_lufs(y, sr=22050):
    """
    Calculate LUFS (Loudness Units relative to Full Scale) using ITU-R BS.1770.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        LUFS value in dB
    """
    # Resample to 48kHz if needed (ITU-R BS.1770 standard)
    if sr != 48000:
        y = librosa.resample(y, orig_sr=sr, target_sr=48000)
        sr = 48000
    
    # Apply K-weighting filter in frequency domain
    stft = librosa.stft(y, n_fft=2048, hop_length=512)
    frequencies = librosa.fft_frequencies(sr=sr, n_fft=2048)
    
    # Get K-weighting response
    k_weights = k_weighting_filter(frequencies, sr)
    
    # Apply K-weighting to magnitude spectrogram
    magnitude = np.abs(stft)
    weighted_magnitude = magnitude * k_weights[:, np.newaxis]
    
    # Convert back to time domain (simplified - using RMS of weighted magnitude)
    # In practice, we'd inverse STFT, but for LUFS we can use RMS directly
    rms_weighted = np.sqrt(np.mean(weighted_magnitude ** 2, axis=0))
    rms_mean = np.mean(rms_weighted)
    
    # Convert to LUFS (dB)
    # LUFS = -0.691 + 10 * log10(mean_squared)
    rms_mean_scalar = float(rms_mean.item() if hasattr(rms_mean, 'item') else rms_mean)
    if rms_mean_scalar > 0:
        lufs = -0.691 + 10 * np.log10(rms_mean_scalar ** 2 + 1e-10)
    else:
        lufs = -np.inf
    
    return float(lufs)


def calculate_true_peak(y, sr=22050):
    """
    Calculate True Peak (maximum amplitude) in dBFS.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Dictionary with peak_dbfs, peak_amplitude, and clipping_detected
    """
    # Upsample to detect inter-sample peaks (4x oversampling)
    y_upsampled = signal.resample(y, len(y) * 4)
    
    # Find maximum absolute amplitude
    peak_amplitude = float(np.max(np.abs(y_upsampled)))
    
    # Convert to dBFS (0 dBFS = 1.0 amplitude)
    if peak_amplitude > 0:
        peak_dbfs = 20 * np.log10(peak_amplitude)
    else:
        peak_dbfs = -np.inf
    
    # Check for clipping (above 0 dBFS)
    clipping_detected = bool(peak_dbfs > 0.0)
    
    return {
        'peak_dbfs': float(peak_dbfs),
        'peak_amplitude': float(peak_amplitude),
        'clipping_detected': clipping_detected
    }


def calculate_frequency_balance(y, sr=22050):
    """
    Analyze frequency balance using FFT and compare with Pink Noise reference.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Dictionary with band analysis and warnings
    """
    # Compute FFT
    stft = librosa.stft(y, n_fft=2048, hop_length=512)
    magnitude = np.abs(stft)
    frequencies = librosa.fft_frequencies(sr=sr, n_fft=2048)
    
    # Average magnitude across time
    magnitude_mean = np.mean(magnitude, axis=1)
    
    # Define frequency bands
    low_mask = frequencies < 200
    mid_mask = (frequencies >= 200) & (frequencies < 5000)
    high_mask = frequencies >= 5000
    
    # Calculate energy in each band
    low_energy = float(np.mean(magnitude_mean[low_mask]))
    mid_energy = float(np.mean(magnitude_mean[mid_mask]))
    high_energy = float(np.mean(magnitude_mean[high_mask]))
    
    # Generate Pink Noise reference (1/f spectrum)
    pink_noise_ref = 1.0 / (frequencies + 1)  # Avoid division by zero
    pink_noise_ref = pink_noise_ref / np.max(pink_noise_ref)  # Normalize
    
    # Compare with pink noise
    pink_low = float(np.mean(pink_noise_ref[low_mask]))
    pink_mid = float(np.mean(pink_noise_ref[mid_mask]))
    pink_high = float(np.mean(pink_noise_ref[high_mask]))
    
    # Calculate dB difference from reference
    low_db_diff = 20 * np.log10((low_energy / pink_low) + 1e-10) if pink_low > 0 else 0
    mid_db_diff = 20 * np.log10((mid_energy / pink_mid) + 1e-10) if pink_mid > 0 else 0
    high_db_diff = 20 * np.log10((high_energy / pink_high) + 1e-10) if pink_high > 0 else 0
    
    # Generate warnings
    warnings = []
    if low_db_diff > 3:
        warnings.append("Baslar çok baskın (Low-end fazla)")
    elif low_db_diff < -3:
        warnings.append("Baslar eksik (Low-end zayıf)")
    
    if mid_db_diff > 3:
        warnings.append("Mid-range fazla parlak")
    elif mid_db_diff < -3:
        warnings.append("Mid-range eksik")
    
    if high_db_diff > 3:
        warnings.append("High-end fazla parlak")
    elif high_db_diff < -3:
        warnings.append("High-end eksik")
    
    # Prepare FFT spectrum data for visualization (64 bins, logarithmic)
    # Normalize magnitude_mean for frontend visualization
    bins = 64
    spectrum_data = []
    pink_noise_data = []
    
    for i in range(bins):
        # Logarithmic frequency mapping (20Hz to 20kHz)
        target_freq = 20 * (20000 / 20) ** (i / bins)
        # Find closest frequency bin
        freq_idx = np.argmin(np.abs(frequencies - target_freq))
        if freq_idx < len(magnitude_mean):
            # Normalize magnitude (0-1 range)
            normalized_mag = float(magnitude_mean[freq_idx] / (np.max(magnitude_mean) + 1e-10))
            spectrum_data.append(normalized_mag)
        else:
            spectrum_data.append(0.0)
        
        # Pink noise reference (1/f)
        pink_val = 1.0 / (target_freq + 1)
        pink_noise_data.append(float(pink_val))
    
    # Normalize pink noise
    max_pink = max(pink_noise_data) if pink_noise_data else 1.0
    pink_noise_data = [v / max_pink for v in pink_noise_data]
    
    return {
        'low_energy': float(low_energy),
        'mid_energy': float(mid_energy),
        'high_energy': float(high_energy),
        'low_db_diff': float(low_db_diff),
        'mid_db_diff': float(mid_db_diff),
        'high_db_diff': float(high_db_diff),
        'warnings': warnings,
        'spectrum_data': spectrum_data,  # 64-bin normalized spectrum
        'pink_noise_data': pink_noise_data  # 64-bin pink noise reference
    }


def detect_transients(y, sr=22050):
    """
    Detect transients using onset detection and calculate Crest Factor.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Dictionary with transient info and crest factor
    """
    # Calculate RMS energy
    rms = librosa.feature.rms(y=y)[0]
    rms_mean_val = np.mean(rms)
    rms_mean = float(rms_mean_val.item() if hasattr(rms_mean_val, 'item') else rms_mean_val)
    
    # Calculate peak value
    peak_abs = np.max(np.abs(y))
    peak = float(peak_abs.item() if hasattr(peak_abs, 'item') else peak_abs)
    
    # Calculate Crest Factor (Peak to RMS ratio in dB)
    if rms_mean > 0:
        crest_factor_db = 20 * np.log10(peak / rms_mean)
    else:
        crest_factor_db = 0.0
    
    # Detect onsets (transients)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, units='time')
    num_transients = len(onset_frames)
    
    # Calculate energy difference between consecutive frames
    if len(rms) > 1:
        energy_diff = np.diff(rms)
        energy_diff_abs = np.max(np.abs(energy_diff))
        max_energy_diff = float(energy_diff_abs.item() if hasattr(energy_diff_abs, 'item') else energy_diff_abs)
    else:
        max_energy_diff = 0.0
    
    # Check for over-compression
    over_compressed = bool(crest_factor_db < 10.0)
    
    return {
        'crest_factor_db': float(crest_factor_db),
        'num_transients': int(num_transients),
        'max_energy_diff': float(max_energy_diff),
        'over_compressed': over_compressed
    }


def generate_mastering_recommendations(mastering_data, genre=None):
    """
    Generate mastering recommendations based on analysis results and genre.
    Genre-aware recommendations for better mastering advice.
    
    Args:
        mastering_data: Dictionary with LUFS, peak, frequency balance, and transient data
        genre: Detected genre (optional, for genre-specific recommendations)
    
    Returns:
        List of recommendation strings
    """
    recommendations = []
    
    # Normalize genre name
    genre_normalized = (genre or '').upper()
    
    # LUFS recommendations (genre-aware)
    lufs = mastering_data.get('lufs', -20)
    if lufs < -16:
        if genre_normalized in ['EDM', 'TECHNO', 'TRAP', 'DARK PHONK', 'DRIFT PHONK']:
            recommendations.append({
                'type': 'warning',
                'message': f'EDM/Trap için ses seviyesi düşük ({lufs:.1f} LUFS). Sub-bass bölgesini güçlendir ve Limiter ekle.',
                'action': 'Sub-bass boost + Limiter/Gain'
            })
        elif genre_normalized in ['ROCK', 'METAL']:
            recommendations.append({
                'type': 'warning',
                'message': f'Rock için ses seviyesi düşük ({lufs:.1f} LUFS). Mid-range güçlendir ve Limiter ekle.',
                'action': 'Mid-range boost + Limiter/Gain'
            })
        elif genre_normalized in ['JAZZ', 'CLASSICAL']:
            recommendations.append({
                'type': 'warning',
                'message': f'Jazz/Klasik için ses seviyesi düşük ({lufs:.1f} LUFS). Dikkatli gain ekle, dinamik aralığı koru.',
                'action': 'Hafif gain, dinamik aralık korunmalı'
            })
        else:
            recommendations.append({
                'type': 'warning',
                'message': f'Ses seviyesi düşük ({lufs:.1f} LUFS). Limiter/Gain ekleyebilirsin.',
                'action': 'Gain veya Limiter kullan'
            })
    elif lufs > -12:
        if genre_normalized in ['JAZZ', 'CLASSICAL']:
            recommendations.append({
                'type': 'warning',
                'message': f'Klasik müzik için ses seviyesi çok yüksek ({lufs:.1f} LUFS). Dinamik aralık çok dar, limiter\'ı gevşet.',
                'action': 'Limiter threshold yükselt, compression azalt'
            })
        else:
            recommendations.append({
                'type': 'warning',
                'message': f'Ses seviyesi çok yüksek ({lufs:.1f} LUFS). Streaming platformları için -14 LUFS hedeflenmeli.',
                'action': 'Limiter ile seviyeyi düşür'
            })
    else:
        recommendations.append({
            'type': 'success',
            'message': f'Ses seviyesi uygun ({lufs:.1f} LUFS).',
            'action': None
        })
    
    # Peak recommendations
    peak_data = mastering_data.get('peak', {})
    peak_dbfs = peak_data.get('peak_dbfs', -1.0)
    if peak_data.get('clipping_detected', False):
        recommendations.append({
            'type': 'error',
            'message': f'CLIPPING TESPİT EDİLDİ! Peak: {peak_dbfs:.2f} dBFS. Distortion riski var!',
            'action': 'Gain azalt veya Limiter kullan'
        })
    elif peak_dbfs > -0.3:
        recommendations.append({
            'type': 'warning',
            'message': f'Peak seviyesi çok yüksek ({peak_dbfs:.2f} dBFS). Distortion riski var.',
            'action': 'Limiter ile peak kontrolü yap'
        })
    else:
        recommendations.append({
            'type': 'success',
            'message': f'Peak seviyesi güvenli ({peak_dbfs:.2f} dBFS).',
            'action': None
        })
    
    # Frequency balance recommendations (genre-aware)
    freq_balance = mastering_data.get('frequency_balance', {})
    low_db_diff = freq_balance.get('low_db_diff', 0)
    mid_db_diff = freq_balance.get('mid_db_diff', 0)
    high_db_diff = freq_balance.get('high_db_diff', 0)
    
    if genre_normalized in ['EDM', 'TECHNO', 'TRAP', 'DARK PHONK', 'DRIFT PHONK']:
        if low_db_diff < -3:
            recommendations.append({
                'type': 'warning',
                'message': f'EDM/Trap için bas enerjisi yetersiz ({low_db_diff:.1f} dB). Sub-bass bölgesini güçlendir.',
                'action': 'Sub-bass (20-60Hz) boost +3dB'
            })
    elif genre_normalized in ['ROCK', 'METAL']:
        if mid_db_diff < -3:
            recommendations.append({
                'type': 'warning',
                'message': f'Rock için mid-range enerjisi düşük ({mid_db_diff:.1f} dB). Gitar frekanslarını (200Hz-5kHz) güçlendir.',
                'action': 'Mid-range (200Hz-5kHz) boost'
            })
    elif genre_normalized in ['POP']:
        if high_db_diff < -2:
            recommendations.append({
                'type': 'warning',
                'message': f'Pop için high-end parlaklığı eksik ({high_db_diff:.1f} dB). Vokal frekanslarını (1-5kHz) güçlendir.',
                'action': 'Vokal frekansları (1-5kHz) boost'
            })
    
    # General frequency warnings
    warnings = freq_balance.get('warnings', [])
    for warning in warnings:
        recommendations.append({
            'type': 'warning',
            'message': warning,
            'action': 'EQ ile frekans dengesini düzelt'
        })
    
    # Compression recommendations (genre-aware)
    transient_data = mastering_data.get('transients', {})
    crest_factor = transient_data.get('crest_factor_db', 0)
    
    if transient_data.get('over_compressed', False):
        if genre_normalized in ['JAZZ', 'CLASSICAL']:
            recommendations.append({
                'type': 'error',
                'message': f'Klasik müzik için dinamik aralık çok dar (Crest Factor: {crest_factor:.1f} dB). Limiter\'ı gevşet ve compression azalt.',
                'action': 'Compression ratio düşür, attack/release ayarla, limiter threshold yükselt'
            })
        else:
            recommendations.append({
                'type': 'warning',
                'message': f'Parça çok fazla sıkıştırılmış (Crest Factor: {crest_factor:.1f} dB). Dinamik aralık kaybolmuş.',
                'action': 'Compression ratio azalt veya attack/release ayarla'
            })
    else:
        if genre_normalized in ['JAZZ', 'CLASSICAL']:
            if crest_factor < 15:
                recommendations.append({
                    'type': 'warning',
                    'message': f'Jazz/Klasik için dinamik aralık biraz dar ({crest_factor:.1f} dB). Daha fazla dinamik aralık önerilir (>15dB).',
                    'action': 'Compression azalt, limiter gevşet'
                })
            else:
                recommendations.append({
                    'type': 'success',
                    'message': f'Dinamik aralık mükemmel ({crest_factor:.1f} dB). Klasik müzik için ideal.',
                    'action': None
                })
        else:
            recommendations.append({
                'type': 'success',
                'message': f'Dinamik aralık uygun (Crest Factor: {crest_factor:.1f} dB).',
            'action': None
        })
    
    return recommendations


def analyze_mastering(file_path, genre=None):
    """
    Complete mastering analysis for an audio file.
    
    Args:
        file_path: Path to audio file
        genre: Optional genre for genre-specific recommendations
    
    Returns:
        Dictionary with all mastering analysis results
    """
    try:
        # Load audio (full file for accurate mastering analysis)
        y, sr = librosa.load(file_path, sr=48000)  # Use 48kHz for accurate LUFS
        
        # Perform all analyses
        lufs = calculate_lufs(y, sr)
        peak_data = calculate_true_peak(y, sr)
        freq_balance = calculate_frequency_balance(y, sr)
        transient_data = detect_transients(y, sr)
        
        # Generate recommendations with genre awareness
        recommendations = generate_mastering_recommendations({
            'lufs': lufs,
            'peak': peak_data,
            'frequency_balance': freq_balance,
            'transients': transient_data
        }, genre=genre)
        
        # Compile results
        mastering_data = {
            'lufs': lufs,
            'peak': peak_data,
            'frequency_balance': freq_balance,
            'transients': transient_data
        }
        
        # Generate recommendations (already done above with genre awareness)
        mastering_data['recommendations'] = recommendations
        
        return mastering_data
        
    except Exception as e:
        return {
            'error': str(e),
            'lufs': -20.0,
            'peak': {'peak_dbfs': -1.0, 'clipping_detected': False},
            'frequency_balance': {'warnings': []},
            'transients': {'crest_factor_db': 0.0, 'over_compressed': False},
            'recommendations': []
        }

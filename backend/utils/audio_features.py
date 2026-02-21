"""
Audio feature extraction utilities:
- FFT-based onset detection with Perceptual Weighting
- Chroma feature extraction for key detection
- Spectral centroid calculation
"""

import numpy as np
import librosa
from scipy import signal


def perceptual_weighting_filter(frequencies, sample_rate=22050):
    """
    Perceptual weighting filter for phonk music analysis.
    Emphasizes kick and cowbell frequencies (60-200 Hz and 800-2000 Hz).
    
    Args:
        frequencies: Frequency array
        sample_rate: Sample rate of the audio
    
    Returns:
        Weight array for frequency domain filtering
    """
    weights = np.ones_like(frequencies)
    
    # Kick drum emphasis (60-200 Hz)
    kick_mask = (frequencies >= 60) & (frequencies <= 200)
    weights[kick_mask] *= 2.0
    
    # Cowbell emphasis (800-2000 Hz)
    cowbell_mask = (frequencies >= 800) & (frequencies <= 2000)
    weights[cowbell_mask] *= 1.8
    
    # High frequency roll-off (phonk is typically bass-heavy)
    high_freq_mask = frequencies > 5000
    weights[high_freq_mask] *= 0.7
    
    return weights


def detect_bpm_with_perceptual_weighting(y, sr=22050):
    """
    Detect BPM using FFT-based onset detection with perceptual weighting.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Estimated BPM value
    """
    # Compute onset strength
    onset_frames = librosa.onset.onset_detect(
        y=y,
        sr=sr,
        units='time',
        hop_length=512
    )
    
    # Calculate tempo using tempo estimation
    tempo, beats = librosa.beat.beat_track(
        y=y,
        sr=sr,
        onset_envelope=librosa.onset.onset_strength(y=y, sr=sr),
        hop_length=512
    )
    
    # Apply perceptual weighting to refine tempo
    # Get frequency domain representation
    stft = librosa.stft(y, hop_length=512)
    frequencies = librosa.fft_frequencies(sr=sr, n_fft=stft.shape[0] * 2 - 1)
    
    # Apply perceptual weighting
    weights = perceptual_weighting_filter(frequencies, sr)
    
    # Weight the magnitude spectrogram
    magnitude = np.abs(stft)
    weighted_magnitude = magnitude * weights[:, np.newaxis]
    
    # Recompute onset strength with weighted spectrogram
    onset_strength_weighted = np.sum(weighted_magnitude, axis=0)
    
    # Re-estimate tempo with weighted onset strength
    tempo_refined, _ = librosa.beat.beat_track(
        onset_envelope=onset_strength_weighted,
        sr=sr,
        hop_length=512
    )
    
    # Use the refined tempo if it's reasonable (60-200 BPM for phonk)
    # Convert to scalar if array
    tempo_scalar = float(tempo.item() if hasattr(tempo, 'item') else tempo)
    tempo_refined_scalar = float(tempo_refined.item() if hasattr(tempo_refined, 'item') else tempo_refined)
    
    if 60 <= tempo_refined_scalar <= 200:
        return tempo_refined_scalar
    else:
        return tempo_scalar


def detect_key(y, sr=22050):
    """
    Detect musical key using chroma features.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Detected key (e.g., "C Minor", "A Major")
    """
    # Extract chroma features
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    
    # Average chroma across time
    chroma_mean = np.mean(chroma, axis=1)
    
    # Key profiles (simplified - can be enhanced with more sophisticated key detection)
    major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
    
    # Normalize profiles
    major_profile = major_profile / np.sum(major_profile)
    minor_profile = minor_profile / np.sum(minor_profile)
    
    # Correlate with all 12 keys
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    best_correlation = -1
    best_key = 'C'
    best_mode = 'Major'
    
    for i, key in enumerate(keys):
        # Rotate chroma to match key
        rotated_chroma = np.roll(chroma_mean, -i)
        
        # Correlate with major and minor profiles
        major_corr_matrix = np.corrcoef(rotated_chroma, major_profile)
        minor_corr_matrix = np.corrcoef(rotated_chroma, minor_profile)
        # Extract scalar values
        major_corr = float(major_corr_matrix[0, 1].item() if hasattr(major_corr_matrix[0, 1], 'item') else major_corr_matrix[0, 1])
        minor_corr = float(minor_corr_matrix[0, 1].item() if hasattr(minor_corr_matrix[0, 1], 'item') else minor_corr_matrix[0, 1])
        
        if major_corr > best_correlation:
            best_correlation = major_corr
            best_key = key
            best_mode = 'Major'
        
        if minor_corr > best_correlation:
            best_correlation = minor_corr
            best_key = key
            best_mode = 'Minor'
    
    return f"{best_key} {best_mode}"


def calculate_energy(y, sr=22050):
    """
    Calculate energy level of the audio.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Energy value (0-100)
    """
    # RMS energy
    rms = librosa.feature.rms(y=y)[0]
    energy = np.mean(rms)
    
    # Convert to scalar if array
    energy_scalar = float(energy.item() if hasattr(energy, 'item') else energy)
    
    # Normalize to 0-100 scale
    energy_normalized = min(100, max(0, energy_scalar * 1000))
    
    return float(energy_normalized)


def calculate_loudness(y, sr=22050):
    """
    Calculate loudness (perceptual loudness).
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Loudness value (LUFS approximation)
    """
    # Simple loudness approximation using RMS
    rms = librosa.feature.rms(y=y)[0]
    rms_mean = np.mean(rms)
    # Convert to scalar if array
    rms_mean_scalar = float(rms_mean.item() if hasattr(rms_mean, 'item') else rms_mean)
    loudness_db = 20 * np.log10(rms_mean_scalar + 1e-10)
    
    # Normalize to 0-100 scale (typical range: -23 to -5 LUFS)
    loudness_normalized = min(100, max(0, (loudness_db + 23) / 0.18))
    
    return float(loudness_normalized)


def calculate_spectral_centroid(y, sr=22050):
    """
    Calculate spectral centroid (brightness indicator).
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Spectral centroid value
    """
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    centroid_mean = np.mean(centroid)
    # Convert to scalar if array
    return float(centroid_mean.item() if hasattr(centroid_mean, 'item') else centroid_mean)


def extract_mfcc(y, sr=22050, n_mfcc=13):
    """
    Extract MFCC (Mel-Frequency Cepstral Coefficients) features.
    MFCC captures timbre characteristics of the audio.
    
    Args:
        y: Audio time series
        sr: Sample rate
        n_mfcc: Number of MFCC coefficients (default: 13)
    
    Returns:
        Dictionary with MFCC features (mean, std, and full array)
    """
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    
    # Calculate statistics
    mfcc_mean = np.mean(mfcc, axis=1)
    mfcc_std = np.std(mfcc, axis=1)
    
    # Convert to Python native types
    return {
        'mean': [float(v.item() if hasattr(v, 'item') else v) for v in mfcc_mean],
        'std': [float(v.item() if hasattr(v, 'item') else v) for v in mfcc_std],
        'full': mfcc.tolist()
    }


def calculate_spectral_rolloff(y, sr=22050, roll_percent=0.85):
    """
    Calculate spectral rolloff - frequency below which a roll_percent of the spectral energy is contained.
    Indicates brightness and high-frequency content.
    
    Args:
        y: Audio time series
        sr: Sample rate
        roll_percent: Rolloff percentage (default: 0.85)
    
    Returns:
        Spectral rolloff value in Hz
    """
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=roll_percent)[0]
    rolloff_mean = np.mean(rolloff)
    return float(rolloff_mean.item() if hasattr(rolloff_mean, 'item') else rolloff_mean)


def calculate_zero_crossing_rate(y):
    """
    Calculate zero crossing rate - rate at which the signal changes sign.
    Indicates noise level and percussive content.
    
    Args:
        y: Audio time series
    
    Returns:
        Zero crossing rate (0-1)
    """
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    zcr_mean = np.mean(zcr)
    return float(zcr_mean.item() if hasattr(zcr_mean, 'item') else zcr_mean)


def extract_chroma_features(y, sr=22050):
    """
    Extract chroma features - harmonic structure analysis.
    Captures chord progressions and harmonic differences between genres.
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        Dictionary with chroma features (mean, std, and variance)
    """
    # Extract chroma features
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    
    # Calculate statistics
    chroma_mean = np.mean(chroma, axis=1)
    chroma_std = np.std(chroma, axis=1)
    chroma_var = np.var(chroma, axis=1)
    
    # Convert to Python native types
    return {
        'mean': [float(v.item() if hasattr(v, 'item') else v) for v in chroma_mean],
        'std': [float(v.item() if hasattr(v, 'item') else v) for v in chroma_std],
        'variance': [float(v.item() if hasattr(v, 'item') else v) for v in chroma_var],
        'full': chroma.tolist()
    }

"""
CNN-based genre classifier for phonk music.
Classifies audio into: Dark Phonk, Drift Phonk, Ambient
"""

import numpy as np
import librosa
import os

# Try to import TensorFlow (optional - only needed for CNN model)
try:
    import tensorflow as tf
    from tensorflow import keras
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    tf = None
    keras = None


def create_cnn_model(input_shape=(128, 128, 1), num_classes=3):
    """
    Create a lightweight CNN model for genre classification.
    Similar to MESSENGER architecture - optimized for speed.
    
    Args:
        input_shape: Shape of input spectrogram (height, width, channels)
        num_classes: Number of genre classes
    
    Returns:
        Compiled Keras model or None if TensorFlow is not available
    """
    if not TENSORFLOW_AVAILABLE:
        return None
    
    model = keras.Sequential([
        # First conv block
        keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Dropout(0.25),
        
        # Second conv block
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Dropout(0.25),
        
        # Third conv block
        keras.layers.Conv2D(128, (3, 3), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Dropout(0.25),
        
        # Flatten and dense layers
        keras.layers.Flatten(),
        keras.layers.Dense(256, activation='relu'),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model


def preprocess_spectrogram(y, sr=22050, target_shape=(128, 128)):
    """
    Convert audio to mel-spectrogram and preprocess for CNN.
    
    Args:
        y: Audio time series
        sr: Sample rate
        target_shape: Target shape for spectrogram (height, width)
    
    Returns:
        Preprocessed spectrogram array
    """
    # Compute mel-spectrogram
    mel_spec = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_mels=target_shape[0],
        hop_length=512
    )
    
    # Convert to dB
    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
    
    # Normalize to [0, 1]
    mel_spec_normalized = (mel_spec_db - mel_spec_db.min()) / (mel_spec_db.max() - mel_spec_db.min() + 1e-10)
    
    # Resize to target shape if needed
    if mel_spec_normalized.shape[1] != target_shape[1]:
        from scipy.ndimage import zoom
        zoom_factor = target_shape[1] / mel_spec_normalized.shape[1]
        mel_spec_normalized = zoom(mel_spec_normalized, (1, zoom_factor))
    
    # Add channel dimension
    mel_spec_normalized = np.expand_dims(mel_spec_normalized, axis=-1)
    
    return mel_spec_normalized


def classify_genre(y, sr=22050, model_path=None, mastering_data=None):
    """
    Classify audio genre using CNN model or rule-based classification.
    
    Args:
        y: Audio time series
        sr: Sample rate
        model_path: Path to trained model file (optional)
        mastering_data: Optional mastering analysis data for better classification
    
    Returns:
        Dictionary with genre classification results
    """
    # If TensorFlow is not available, use rule-based classification
    if not TENSORFLOW_AVAILABLE:
        return classify_genre_rule_based(y, sr, mastering_data)
    
    # Preprocess audio
    spectrogram = preprocess_spectrogram(y, sr)
    
    # If model path is provided and exists, load it
    if model_path and os.path.exists(model_path):
        try:
            model = keras.models.load_model(model_path)
        except Exception as e:
            print(f"Error loading model: {e}. Using default classification.")
            model = None
    else:
        model = None
    
    # If no model available, use rule-based classification as fallback
    # This now supports all major genres via genre signatures
    if model is None:
        return classify_genre_rule_based(y, sr, mastering_data)
    
    # Predict with model (legacy CNN model - only supports Phonk genres)
    spectrogram_batch = np.expand_dims(spectrogram, axis=0)
    predictions = model.predict(spectrogram_batch, verbose=0)[0]
    
    genres = ['Dark Phonk', 'Drift Phonk', 'Ambient']
    genre_idx = np.argmax(predictions)
    # Convert to scalar if array
    confidence_value = predictions[genre_idx]
    confidence = float(confidence_value.item() if hasattr(confidence_value, 'item') else confidence_value)
    
    # For legacy CNN models, return Phonk genres
    # But we can enhance with rule-based if confidence is low
    if confidence < 0.7:
        # Low confidence - try rule-based as backup
        rule_based = classify_genre_rule_based(y, sr, mastering_data)
        # Merge probabilities
        merged_probs = {}
        for genre in genres:
            merged_probs[genre] = float(predictions[genres.index(genre)].item() if hasattr(predictions[genres.index(genre)], 'item') else predictions[genres.index(genre)])
        # Add rule-based probabilities
        for genre, prob in rule_based['probabilities'].items():
            if genre not in merged_probs:
                merged_probs[genre] = prob * 0.3  # Weight rule-based lower
        
        return {
            'genre': rule_based['genre'] if rule_based['confidence'] > confidence else genres[genre_idx],
            'confidence': max(confidence, rule_based['confidence']),
            'probabilities': merged_probs
        }
    
    return {
        'genre': genres[genre_idx],
        'confidence': confidence,
        'probabilities': {
            genres[i]: float(predictions[i].item() if hasattr(predictions[i], 'item') else predictions[i]) for i in range(len(genres))
        }
    }


def classify_genre_rule_based(y, sr=22050, mastering_data=None):
    """
    Rule-based genre classification using genre signatures.
    Now supports: Rock, Pop, EDM, Hip-Hop, Jazz, Classical, Techno, Metal, Trap, Dark Phonk, Drift Phonk, Ambient
    
    Args:
        y: Audio time series
        sr: Sample rate
        mastering_data: Optional mastering analysis data for better classification
    
    Returns:
        Dictionary with genre classification results
    """
    # Import genre signatures
    try:
        from utils.genre_signatures import match_genre_by_features_advanced, GENRE_SIGNATURES
    except ImportError:
        # Fallback to old classification if signatures not available
        return classify_genre_rule_based_legacy(y, sr)
    
    # Extract features for classification
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    
    # Convert NumPy scalars to Python native types
    def to_scalar(value):
        """Safely convert NumPy scalar/array to Python native type."""
        if isinstance(value, np.ndarray):
            if value.size == 1:
                return float(value.item())
            else:
                return float(np.mean(value))
        elif isinstance(value, (np.integer, np.floating)):
            return float(value.item() if hasattr(value, 'item') else value)
        else:
            return float(value) if not isinstance(value, (int, float)) else value
    
    tempo = to_scalar(tempo)
    spectral_centroid = to_scalar(spectral_centroid)
    
    # Get frequency balance and transient data from mastering analysis if available
    if mastering_data:
        low_db_diff = to_scalar(mastering_data.get('frequency_balance', {}).get('low_db_diff', 0))
        mid_db_diff = to_scalar(mastering_data.get('frequency_balance', {}).get('mid_db_diff', 0))
        high_db_diff = to_scalar(mastering_data.get('frequency_balance', {}).get('high_db_diff', 0))
        crest_factor = to_scalar(mastering_data.get('transients', {}).get('crest_factor_db', 10))
    else:
        # Estimate from spectral analysis
        stft = librosa.stft(y, n_fft=2048, hop_length=512)
        magnitude = np.abs(stft)
        frequencies = librosa.fft_frequencies(sr=sr, n_fft=2048)
        
        # Calculate energy in different bands
        low_mask = frequencies < 200
        mid_mask = (frequencies >= 200) & (frequencies < 5000)
        high_mask = frequencies >= 5000
        
        low_energy = np.mean(magnitude[low_mask, :])
        mid_energy = np.mean(magnitude[mid_mask, :])
        high_energy = np.mean(magnitude[high_mask, :])
        
        # Pink noise reference (1/f)
        pink_ref_low = 1.0 / (200 + 1)
        pink_ref_mid = 1.0 / (2500 + 1)
        pink_ref_high = 1.0 / (12500 + 1)
        
        # Calculate dB differences
        low_db_diff = to_scalar(10 * np.log10((low_energy + 1e-10) / (pink_ref_low + 1e-10)))
        mid_db_diff = to_scalar(10 * np.log10((mid_energy + 1e-10) / (pink_ref_mid + 1e-10)))
        high_db_diff = to_scalar(10 * np.log10((high_energy + 1e-10) / (pink_ref_high + 1e-10)))
        
        # Estimate crest factor from RMS and peak
        rms = np.mean(librosa.feature.rms(y=y))
        peak = np.max(np.abs(y))
        if rms > 0:
            crest_factor = to_scalar(20 * np.log10(peak / (rms + 1e-10)))
        else:
            crest_factor = 10.0
    
    # Extract additional features for better classification
    try:
        from utils.audio_features import extract_mfcc, calculate_spectral_rolloff, calculate_zero_crossing_rate, extract_chroma_features
        
        mfcc_features = extract_mfcc(y, sr)
        spectral_rolloff = calculate_spectral_rolloff(y, sr)
        zcr = calculate_zero_crossing_rate(y)
        chroma_features = extract_chroma_features(y, sr)
    except ImportError:
        mfcc_features = None
        spectral_rolloff = 0
        zcr = 0
        chroma_features = None
    
    # Match to genre signatures with mathematical matching
    matches = match_genre_by_features_advanced(
        bpm=tempo,
        spectral_centroid=spectral_centroid,
        low_db_diff=low_db_diff,
        mid_db_diff=mid_db_diff,
        high_db_diff=high_db_diff,
        crest_factor=crest_factor,
        spectral_rolloff=spectral_rolloff,
        zcr=zcr,
        mfcc_features=mfcc_features,
        chroma_features=chroma_features
    )
    
    # Apply Phonk/Trap boost if applicable
    if 130 <= tempo <= 150 and low_db_diff > 3:
        # Boost Phonk genres
        phonk_genres = ['Dark Phonk', 'Drift Phonk', 'Trap']
        for i, (genre, conf) in enumerate(matches):
            if genre in phonk_genres:
                boosted_conf = min(1.0, conf * 1.3)  # 30% bonus
                matches[i] = (genre, boosted_conf)
        # Re-sort after boost
        matches.sort(key=lambda x: x[1], reverse=True)
    
    # Get top match
    if matches:
        top_genre, top_confidence = matches[0]
        # Ensure confidence is a Python native float
        top_confidence = to_scalar(top_confidence)
        
        # Build probabilities dictionary - use ALL matches, not just top 6
        probabilities = {}
        for genre, conf in matches:
            probabilities[genre] = to_scalar(conf)
        
        # Normalize probabilities to sum to 1.0 (optional, but ensures valid probability distribution)
        total_prob = sum(probabilities.values())
        if total_prob > 0:
            probabilities = {k: v / total_prob for k, v in probabilities.items()}
        
        return {
            'genre': top_genre,
            'confidence': top_confidence,
            'probabilities': probabilities
        }
    else:
        # Fallback
        return classify_genre_rule_based_legacy(y, sr)


def classify_genre_rule_based_legacy(y, sr=22050):
    """
    Legacy rule-based classification (fallback).
    """
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    rms = np.mean(librosa.feature.rms(y=y))
    
    if tempo > 140 and spectral_centroid > 2000:
        genre = 'Drift Phonk'
        confidence = 0.75
    elif tempo > 120 and rms > 0.1:
        genre = 'Dark Phonk'
        confidence = 0.70
    else:
        genre = 'Ambient'
        confidence = 0.65
    
    return {
        'genre': genre,
        'confidence': confidence,
        'probabilities': {
            'Dark Phonk': 0.3 if genre != 'Dark Phonk' else confidence,
            'Drift Phonk': 0.3 if genre != 'Drift Phonk' else confidence,
            'Ambient': 0.3 if genre != 'Ambient' else confidence
        }
    }

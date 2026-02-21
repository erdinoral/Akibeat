"""
Main audio analysis script.
Performs BPM detection, key detection, energy/loudness calculation,
and genre classification using CNN.
"""

import sys
import json
import os
import librosa
import subprocess
import numpy as np
from utils.audio_features import (
    detect_bpm_with_perceptual_weighting,
    detect_key,
    calculate_energy,
    calculate_loudness,
    calculate_spectral_centroid
)
from utils.cnn_classifier import classify_genre
from utils.mastering_analysis import analyze_mastering

# Optional imports for lyrics extraction
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    # Write to stderr so it doesn't interfere with JSON output
    sys.stderr.write("Warning: Whisper not available. Lyrics extraction will be disabled.\n")

try:
    import demucs
    DEMUCS_AVAILABLE = True
except ImportError:
    DEMUCS_AVAILABLE = False
    # Write to stderr so it doesn't interfere with JSON output
    sys.stderr.write("Warning: Demucs not available. Lyrics extraction will be disabled.\n")


def extract_lyrics(file_path):
    """
    Extract lyrics from audio file using Whisper (transcription).
    If Demucs is available, it will first separate vocals for better accuracy.
    Otherwise, it will transcribe directly from the audio file.
    
    Args:
        file_path: Path to audio file
    
    Returns:
        Extracted lyrics text or empty string if extraction fails
    """
    if not WHISPER_AVAILABLE:
        return ""
    
    try:
        # Get directory and filename
        file_dir = os.path.dirname(os.path.abspath(file_path))
        file_basename = os.path.basename(file_path)
        file_name_without_ext = os.path.splitext(file_basename)[0]
        
        audio_file_to_transcribe = file_path
        
        # 1. Aşama: Vokal Ayrıştırma (Demucs) - Opsiyonel, daha iyi sonuç için
        if DEMUCS_AVAILABLE:
            try:
                sys.stderr.write(f"Vokaller ayrıştırılıyor (Demucs)...\n")
                result = subprocess.run(
                    ["demucs", "-d", "cpu", file_path],
                    capture_output=True,
                    text=True,
                    cwd=file_dir,
                    timeout=300  # 5 dakika timeout
                )
                
                if result.returncode == 0:
                    # Demucs creates: separated/htdemucs/filename/vocals.wav
                    separated_path = os.path.join(file_dir, "separated", "htdemucs", file_name_without_ext, "vocals.wav")
                    
                    # Alternative path if file structure is different
                    if not os.path.exists(separated_path):
                        # Try to find vocals.wav in separated folder
                        for root, dirs, files in os.walk(os.path.join(file_dir, "separated")):
                            if "vocals.wav" in files:
                                separated_path = os.path.join(root, "vocals.wav")
                                break
                    
                    if os.path.exists(separated_path):
                        audio_file_to_transcribe = separated_path
                        sys.stderr.write(f"Vokaller ayrıştırıldı: {separated_path}\n")
                    else:
                        sys.stderr.write(f"Vokal dosyası bulunamadı, orijinal dosya kullanılacak\n")
                else:
                    sys.stderr.write(f"Demucs hatası (orijinal dosya kullanılacak): {result.stderr[:200]}\n")
            except subprocess.TimeoutExpired:
                sys.stderr.write("Demucs zaman aşımına uğradı, orijinal dosya kullanılacak\n")
            except Exception as e:
                sys.stderr.write(f"Demucs hatası (orijinal dosya kullanılacak): {str(e)}\n")
        else:
            sys.stderr.write("Demucs yüklü değil, doğrudan transkripsiyon yapılıyor\n")
        
        # 2. Aşama: Yazıya Dökme (Whisper)
        sys.stderr.write(f"Transkripsiyon yapılıyor: {audio_file_to_transcribe}\n")
        # Load Whisper model (base is fast, small is more accurate)
        model = whisper.load_model("base")
        result = model.transcribe(audio_file_to_transcribe, language="tr")  # Turkish language
        
        lyrics = result["text"].strip()
        sys.stderr.write(f"Sözler çıkarıldı ({len(lyrics)} karakter): {lyrics[:100]}...\n")
        return lyrics
        
    except Exception as e:
        sys.stderr.write(f"Lyrics extraction error: {str(e)}\n")
        return ""


def analyze_audio(file_path):
    """
    Analyze audio file and return comprehensive analysis results.
    
    Args:
        file_path: Path to audio file (MP3, WAV, etc.)
    
    Returns:
        Dictionary with analysis results
    """
    try:
        # Load audio file
        y, sr = librosa.load(file_path, sr=22050, duration=60)  # Load first 60 seconds for speed
        
        # 1. ADIM: Teknik Veri Hesaplama (BPM, Loudness, Spectral Centroid)
        sys.stderr.write("Teknik veriler hesaplanıyor...\n")
        bpm = detect_bpm_with_perceptual_weighting(y, sr)
        key = detect_key(y, sr)
        energy = calculate_energy(y, sr)
        loudness = calculate_loudness(y, sr)
        spectral_centroid = calculate_spectral_centroid(y, sr)
        
        # Calculate spectral magnitude for visualization (20 bins)
        stft = librosa.stft(y, n_fft=2048, hop_length=512)
        magnitude = np.abs(stft)
        magnitude_mean = np.mean(magnitude, axis=1)
        # Downsample to 20 bins for frontend visualization
        bins = 20
        step = len(magnitude_mean) // bins
        spectral_magnitude = [float(magnitude_mean[i * step]) for i in range(bins)]
        # Normalize to 0-1 range
        max_mag = max(spectral_magnitude) if spectral_magnitude else 1.0
        spectral_magnitude = [v / (max_mag + 1e-10) for v in spectral_magnitude]
        
        # 2. ADIM: Mastering Analizi (Tür Tahmininden Önce)
        # Mastering verilerini önce al ki tür tahmini bu verileri kullanabilsin
        mastering_data = {}
        try:
            sys.stderr.write("Mastering analizi başlatılıyor...\n")
            mastering_data = analyze_mastering(file_path, genre=None)  # Genre henüz bilinmiyor
            sys.stderr.write("Mastering analizi tamamlandı\n")
        except Exception as e:
            sys.stderr.write(f"Mastering analizi hatası: {str(e)}\n")
            mastering_data = {}
        
        # 3. ADIM: Genre Classification (Mastering Verileri ile)
        sys.stderr.write("Tür sınıflandırması yapılıyor...\n")
        model_path = None
        try:
            import os
            script_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(script_dir, 'models', 'cnn_model.h5')
        except:
            pass
        
        # Genre classification with mastering data for better accuracy
        try:
            import inspect
            sig = inspect.signature(classify_genre)
            if 'mastering_data' in sig.parameters:
                genre_result = classify_genre(y, sr, model_path, mastering_data=mastering_data)
            else:
                genre_result = classify_genre(y, sr, model_path)
        except Exception as e:
            sys.stderr.write(f"Tür sınıflandırma hatası: {str(e)}\n")
            genre_result = classify_genre(y, sr, model_path)
        
        # 4. ADIM: Mastering Tavsiyelerini Genre ile Güncelle
        detected_genre = genre_result.get('genre', '')
        if mastering_data and not mastering_data.get('error') and detected_genre:
            try:
                # Re-generate recommendations with genre awareness
                from utils.mastering_analysis import generate_mastering_recommendations
                mastering_data['recommendations'] = generate_mastering_recommendations(
                    mastering_data, genre=detected_genre
                )
            except:
                pass
        
        # Extract lyrics (this may take longer)
        lyrics = ""
        if WHISPER_AVAILABLE:
            sys.stderr.write("Söz çıkarma başlatılıyor...\n")
            try:
                lyrics = extract_lyrics(file_path)
                if lyrics:
                    sys.stderr.write(f"Sözler başarıyla çıkarıldı ({len(lyrics)} karakter)\n")
                else:
                    sys.stderr.write("Sözler çıkarılamadı (boş sonuç)\n")
            except Exception as e:
                sys.stderr.write(f"Söz çıkarma hatası: {str(e)}\n")
                lyrics = ""
        else:
            sys.stderr.write("Söz çıkarma atlandı (Whisper yüklü değil)\n")
        
        # Helper function to make data JSON serializable
        def make_json_serializable(obj):
            """Recursively convert numpy types and other non-serializable types to Python native types."""
            if isinstance(obj, dict):
                return {k: make_json_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_json_serializable(item) for item in obj]
            elif isinstance(obj, (np.integer, np.floating)):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, (np.bool_, bool)):
                return bool(obj)
            else:
                return obj
        
        # Compile results - ensure all values are scalars before rounding
        # Convert to Python native types if needed
        bpm_scalar = float(bpm) if not isinstance(bpm, (int, float)) else bpm
        energy_scalar = float(energy) if not isinstance(energy, (int, float)) else energy
        loudness_scalar = float(loudness) if not isinstance(loudness, (int, float)) else loudness
        spectral_centroid_scalar = float(spectral_centroid) if not isinstance(spectral_centroid, (int, float)) else spectral_centroid
        confidence_scalar = float(genre_result['confidence']) if not isinstance(genre_result['confidence'], (int, float)) else genre_result['confidence']
        
        # Ensure mastering data is JSON serializable
        mastering_data_serialized = make_json_serializable(mastering_data) if mastering_data else {}
        
        results = {
            'bpm': round(bpm_scalar, 1),
            'key': key,
            'energy': round(energy_scalar, 1),
            'loudness': round(loudness_scalar, 1),
            'spectral_centroid': round(spectral_centroid_scalar, 1),
            'spectral_magnitude': spectral_magnitude,  # Real spectral data for visualization
            'genre': genre_result['genre'],
            'genre_confidence': round(confidence_scalar, 2),
            'genre_probabilities': genre_result['probabilities'],
            'lyrics': lyrics,
            'mastering': mastering_data_serialized
        }
        
        return results
        
    except Exception as e:
        return {
            'error': str(e),
            'bpm': 0,
            'key': 'Unknown',
            'energy': 0,
            'loudness': 0,
            'spectral_centroid': 0,
            'spectral_magnitude': [],
            'genre': 'Unknown',
            'genre_confidence': 0,
            'genre_probabilities': {},
            'lyrics': '',
            'mastering': {}
        }


if __name__ == '__main__':
    # Get file path from command line argument
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No file path provided'}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    results = analyze_audio(file_path)
    
    # Output JSON results
    print(json.dumps(results, indent=2))

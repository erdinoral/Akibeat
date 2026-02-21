"""
Genre Signatures Database
Mathematical signatures for all major music genres
"""

GENRE_SIGNATURES = {
    'EDM': {
        'bpm_range': (120, 130),
        'sub_bass_energy': 'high',
        'beat_structure': '4/4',
        'mid_range_energy': 'medium',
        'high_range_energy': 'high',
        'transient_density': 'high',
        'dynamic_range': 'low',  # EDM is typically compressed
        'vocal_frequency_boost': False,
        'description': 'Electronic Dance Music with driving 4/4 beat, high sub-bass, and energetic high-end'
    },
    'Techno': {
        'bpm_range': (120, 140),
        'sub_bass_energy': 'very_high',
        'beat_structure': '4/4',
        'mid_range_energy': 'low',
        'high_range_energy': 'medium',
        'transient_density': 'very_high',
        'dynamic_range': 'very_low',
        'vocal_frequency_boost': False,
        'description': 'Industrial techno with analog synth sequences, driving kick, dark club vibe'
    },
    'Rock': {
        'bpm_range': (80, 160),
        'sub_bass_energy': 'medium',
        'beat_structure': 'variable',
        'mid_range_energy': 'very_high',  # Guitar frequencies
        'high_range_energy': 'high',
        'transient_density': 'very_high',  # Drum attacks
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,  # 1-5kHz
        'description': 'Rock music with distorted electric guitar, live drum room, raw energy, aggressive vocals'
    },
    'Metal': {
        'bpm_range': (100, 200),
        'sub_bass_energy': 'high',
        'beat_structure': 'variable',
        'mid_range_energy': 'very_high',
        'high_range_energy': 'very_high',
        'transient_density': 'very_high',
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,
        'description': 'Heavy metal with extreme distortion, fast double-kick drums, aggressive vocals'
    },
    'Hip-Hop': {
        'bpm_range': (70, 90),
        'sub_bass_energy': 'very_high',  # 808s
        'beat_structure': 'variable',
        'mid_range_energy': 'low',
        'high_range_energy': 'high',  # Hi-hats
        'transient_density': 'medium',
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,  # Rap vocals
        'description': 'Hip-hop with boom bap rhythm, lo-fi textures, heavy 808s, street atmosphere'
    },
    'Trap': {
        'bpm_range': (140, 160),
        'sub_bass_energy': 'very_high',
        'beat_structure': 'variable',
        'mid_range_energy': 'low',
        'high_range_energy': 'very_high',  # Sharp hi-hats
        'transient_density': 'high',
        'dynamic_range': 'low',
        'vocal_frequency_boost': True,
        'description': 'Trap music with heavy 808s, sharp hi-hats, dark atmosphere'
    },
    'Pop': {
        'bpm_range': (90, 120),
        'sub_bass_energy': 'medium',
        'beat_structure': '4/4',
        'mid_range_energy': 'balanced',
        'high_range_energy': 'high',
        'transient_density': 'medium',
        'dynamic_range': 'low',  # High compression, narrow dynamic range
        'vocal_frequency_boost': True,  # 1-5kHz brightness
        'description': 'Pop music with balanced spectrum, vocal brightness in 1-5kHz, polished production. Balanced spectrum, narrow dynamic range (high compression).'
    },
    'Jazz': {
        'bpm_range': (60, 180),  # Variable tempo
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'medium',
        'high_range_energy': 'medium',
        'transient_density': 'low',  # Brushed snare
        'dynamic_range': 'very_high',  # High crest factor
        'vocal_frequency_boost': False,
        'description': 'Jazz with smooth saxophone, brushed snare, sophisticated chords, lounge ambiance'
    },
    'Classical': {
        'bpm_range': (40, 200),  # Very variable
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'balanced',
        'high_range_energy': 'balanced',
        'transient_density': 'low',
        'dynamic_range': 'very_high',  # Highest dynamic range
        'vocal_frequency_boost': False,
        'description': 'Classical music with wide dynamic range, natural acoustics, minimal compression'
    },
    'Dark Phonk': {
        'bpm_range': (120, 140),
        'sub_bass_energy': 'very_high',  # Aggressive 808 bass energy
        'beat_structure': 'variable',
        'mid_range_energy': 'low',
        'high_range_energy': 'medium',
        'transient_density': 'high',
        'dynamic_range': 'low',
        'vocal_frequency_boost': False,
        'description': 'Dark Phonk with heavy 808s, lo-fi textures, dark atmosphere. Aggressive 808 bass, lo-fi frequency cuts.'
    },
    'Drift Phonk': {
        'bpm_range': (140, 160),
        'sub_bass_energy': 'very_high',
        'beat_structure': 'variable',
        'mid_range_energy': 'low',
        'high_range_energy': 'high',
        'transient_density': 'very_high',
        'dynamic_range': 'low',
        'vocal_frequency_boost': False,
        'description': 'Drift Phonk with high-speed racing vibe, aggressive bass, Tokyo street atmosphere'
    },
    'Ambient': {
        'bpm_range': (60, 100),
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'low',
        'high_range_energy': 'low',
        'transient_density': 'very_low',
        'dynamic_range': 'high',
        'vocal_frequency_boost': False,
        'description': 'Ambient music with minimal beats, atmospheric textures, wide dynamic range'
    },
    'Soul_RnB': {
        'bpm_range': (70, 100),
        'sub_bass_energy': 'medium',
        'beat_structure': 'variable',
        'mid_range_energy': 'high',
        'high_range_energy': 'medium',
        'transient_density': 'low',
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,  # Smooth vocal runs
        'description': 'Soul/RnB with smooth vocal runs, velvety rhodes, groovy bassline, late night vibes'
    },
    'Reggaeton_Latin': {
        'bpm_range': (90, 100),
        'sub_bass_energy': 'very_high',  # Dembow bass
        'beat_structure': 'variable',
        'mid_range_energy': 'medium',
        'high_range_energy': 'high',  # Synthetic percussions
        'transient_density': 'high',
        'dynamic_range': 'low',
        'vocal_frequency_boost': True,
        'description': 'Reggaeton/Latin with dembow rhythm, synthetic percussions, tropical atmosphere'
    },
    'Funk_Disco': {
        'bpm_range': (110, 130),
        'sub_bass_energy': 'high',  # Slap bass
        'beat_structure': '4/4',
        'mid_range_energy': 'high',  # Brass section
        'high_range_energy': 'high',
        'transient_density': 'high',  # Punchy snare
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,
        'description': 'Funk/Disco with slap bass, wha-wha guitar, four-on-the-floor kick, brass section'
    },
    'Synthwave_Retrowave': {
        'bpm_range': (100, 120),
        'sub_bass_energy': 'high',  # Arpeggiated bass
        'beat_structure': '4/4',
        'mid_range_energy': 'medium',
        'high_range_energy': 'high',  # 80s synths
        'transient_density': 'medium',
        'dynamic_range': 'medium',
        'vocal_frequency_boost': False,
        'description': 'Synthwave/Retrowave with 80s analog synths, LinnDrum samples, retro-future vibe'
    },
    'LoFi_HipHop': {
        'bpm_range': (70, 90),
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'low',  # Muted piano
        'high_range_energy': 'very_low',  # Low-pass filtering
        'transient_density': 'very_low',
        'dynamic_range': 'medium',
        'vocal_frequency_boost': False,
        'description': 'LoFi HipHop with dusty vinyl crackle, muted piano, chill hop drums, late night study'
    },
    'Drum_and_Bass': {
        'bpm_range': (170, 180),
        'sub_bass_energy': 'very_high',  # Reese bass
        'beat_structure': 'variable',
        'mid_range_energy': 'medium',
        'high_range_energy': 'high',  # Fast breakbeats
        'transient_density': 'very_high',
        'dynamic_range': 'low',
        'vocal_frequency_boost': False,
        'description': 'Drum and Bass with fast breakbeats, reese bass, liquid atmosphere, high energy'
    },
    'Hyperpop': {
        'bpm_range': (140, 180),
        'sub_bass_energy': 'high',
        'beat_structure': 'variable',
        'mid_range_energy': 'very_high',  # Distorted synths
        'high_range_energy': 'very_high',  # High-pitched melodies
        'transient_density': 'very_high',
        'dynamic_range': 'very_low',  # Maximized loudness
        'vocal_frequency_boost': True,  # Glitched vocals
        'description': 'Hyperpop with glitched vocals, distorted synths, experimental sound, chaotic energy'
    },
    'Country_Folk': {
        'bpm_range': (60, 120),
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'high',  # Acoustic guitar, steel guitar
        'high_range_energy': 'medium',
        'transient_density': 'low',
        'dynamic_range': 'high',  # Natural dynamics
        'vocal_frequency_boost': True,  # Storytelling lyrics
        'description': 'Country/Folk with acoustic guitar, storytelling lyrics, steel guitar, natural sound'
    },
    'Blues': {
        'bpm_range': (60, 120),
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'high',  # Guitar solo, presence 2-4kHz
        'high_range_energy': 'medium',
        'transient_density': 'low',
        'dynamic_range': 'high',  # Dynamic touch
        'vocal_frequency_boost': True,  # Raw vocals
        'description': 'Blues with 12-bar progression, emotional guitar solo, bending strings, raw vocals'
    },
    'Dubstep_Riddim': {
        'bpm_range': (140, 150),
        'sub_bass_energy': 'very_high',  # Wobble bass, sub-bass power
        'beat_structure': 'variable',
        'mid_range_energy': 'very_high',  # Harsh mid-range, growls
        'high_range_energy': 'high',
        'transient_density': 'very_high',
        'dynamic_range': 'very_low',  # Aggressive limiting
        'vocal_frequency_boost': False,
        'description': 'Dubstep/Riddim with wobble bass, half-time drums, growls, aggressive drops'
    },
    'City_Pop_Japan': {
        'bpm_range': (100, 120),
        'sub_bass_energy': 'high',  # Slap bass
        'beat_structure': '4/4',
        'mid_range_energy': 'high',  # Funk guitar licks, polished brass
        'high_range_energy': 'high',  # Bright mix, vintage synths
        'transient_density': 'medium',
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,
        'description': 'City Pop Japan with 80s Japanese funk, retro city vibes, vintage Yamaha DX7 synths'
    },
    'J_Pop_Modern': {
        'bpm_range': (120, 160),
        'sub_bass_energy': 'high',
        'beat_structure': 'variable',
        'mid_range_energy': 'high',  # Complex chord progressions
        'high_range_energy': 'very_high',  # Shimmering highs, bright synthesizers
        'transient_density': 'very_high',  # Fast-paced, dense arrangement
        'dynamic_range': 'low',  # Maximized loudness
        'vocal_frequency_boost': True,  # Vocal pitch correction
        'description': 'J-Pop Modern with high-energy idol pop, complex chord progressions, bright synthesizers'
    },
    'Anime_Epic_Hybrid': {
        'bpm_range': (80, 160),
        'sub_bass_energy': 'high',
        'beat_structure': 'variable',
        'mid_range_energy': 'very_high',  # Orchestral rock, dramatic strings
        'high_range_energy': 'high',  # Choral elements
        'transient_density': 'very_high',  # Epic cinematic drums
        'dynamic_range': 'high',  # Wide dynamic range
        'vocal_frequency_boost': True,  # Choral elements
        'description': 'Anime Epic Hybrid with orchestral rock, dramatic strings, epic cinematic drums, heroic themes'
    },
    'J_Rock': {
        'bpm_range': (120, 180),
        'sub_bass_energy': 'medium',
        'beat_structure': 'variable',
        'mid_range_energy': 'very_high',  # High-gain guitars, fast guitar solos
        'high_range_energy': 'high',  # High-pitched vocals, sustained leads
        'transient_density': 'very_high',  # Tight drumming
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,  # High-pitched vocals
        'description': 'J-Rock with Visual Kei influence, fast guitar solos, melodic basslines, high-pitched vocals'
    },
    'Baroque_Classical': {
        'bpm_range': (60, 120),
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'high',  # Mid-frequency focus, harpsichord, string ensembles
        'high_range_energy': 'medium',
        'transient_density': 'low',  # Natural dynamics
        'dynamic_range': 'very_high',  # Natural dynamics, minimal reverb
        'vocal_frequency_boost': False,
        'description': 'Baroque Classical with harpsichord textures, polyphonic melodies, chamber orchestra, counterpoint'
    },
    'K_Pop_Performance': {
        'bpm_range': (120, 140),
        'sub_bass_energy': 'very_high',  # Punchy sub-bass, synthetic basslines
        'beat_structure': 'variable',
        'mid_range_energy': 'high',  # Vocal harmonies
        'high_range_energy': 'very_high',  # Polished vocal layers
        'transient_density': 'very_high',  # Performance-ready beats
        'dynamic_range': 'very_low',  # Maximized loudness
        'vocal_frequency_boost': True,  # Vocal harmonies, polished vocal layers
        'description': 'K-Pop Performance with multi-genre hybrid, synthetic basslines, vocal harmonies, future-pop'
    },
    'Afrobeats': {
        'bpm_range': (100, 120),
        'sub_bass_energy': 'high',  # Melodic bass
        'beat_structure': 'variable',
        'mid_range_energy': 'high',  # Warm low-mids, percussive grooves
        'high_range_energy': 'high',  # Crisp percussion
        'transient_density': 'high',  # Polyrhythmic focus
        'dynamic_range': 'medium',
        'vocal_frequency_boost': True,  # Vocal reverb
        'description': 'Afrobeats with West African rhythms, percussive grooves, melodic bass, tropical textures'
    },
    'Bossa_Nova': {
        'bpm_range': (80, 120),
        'sub_bass_energy': 'low',
        'beat_structure': 'variable',
        'mid_range_energy': 'medium',  # Nylon-string guitar, jazz-influenced harmony
        'high_range_energy': 'medium',
        'transient_density': 'very_low',  # Soft transients, soft percussion
        'dynamic_range': 'high',  # Natural stereo width, gentle compression
        'vocal_frequency_boost': False,
        'description': 'Bossa Nova with nylon-string guitar, jazz-influenced harmony, soft percussion, lounge aesthetic'
    },
    'Future_Bass': {
        'bpm_range': (140, 160),
        'sub_bass_energy': 'very_high',  # Deep sub-bass, sidechained chords
        'beat_structure': 'variable',
        'mid_range_energy': 'high',  # Supersaw chords, emotional melodies
        'high_range_energy': 'very_high',  # Bright high-end, synth swells
        'transient_density': 'very_high',  # Sharp transients, hard-hitting trap drums
        'dynamic_range': 'low',
        'vocal_frequency_boost': True,  # Vocal chops
        'description': 'Future Bass with supersaw chords, vocal chops, hard-hitting trap drums, emotional melodies'
    },
    'Hardstyle': {
        'bpm_range': (140, 150),
        'sub_bass_energy': 'very_high',  # Distorted kick, reverse bass, distorted low-end
        'beat_structure': '4/4',
        'mid_range_energy': 'very_high',  # Euphoric leads, hardstyle screeches
        'high_range_energy': 'high',
        'transient_density': 'very_high',  # Rave energy
        'dynamic_range': 'very_low',  # Redlined master, aggressive compression
        'vocal_frequency_boost': False,
        'description': 'Hardstyle with distorted kick, euphoric leads, reverse bass, hardstyle screeches, rave energy'
    }
}


def get_genre_signature(genre):
    """
    Get signature for a specific genre.
    
    Args:
        genre: Genre name (case-insensitive)
    
    Returns:
        Dictionary with genre signature or None if not found
    """
    genre_upper = genre.upper()
    for key, value in GENRE_SIGNATURES.items():
        if key.upper() == genre_upper:
            return value
    return None


def match_genre_by_features(bpm, spectral_centroid, low_db_diff, mid_db_diff, high_db_diff, crest_factor):
    """
    Match audio features to genre signatures (legacy function for backward compatibility).
    Use match_genre_by_features_advanced for better accuracy.
    """
    return match_genre_by_features_advanced(
        bpm, spectral_centroid, low_db_diff, mid_db_diff, high_db_diff, crest_factor,
        spectral_rolloff=0, zcr=0, mfcc_features=None, chroma_features=None
    )


def match_genre_by_features_advanced(bpm, spectral_centroid, low_db_diff, mid_db_diff, high_db_diff, 
                                      crest_factor, spectral_rolloff=0, zcr=0, mfcc_features=None, chroma_features=None):
    """
    Advanced genre matching using Euclidean distance and weighted scoring.
    Uses mathematical matching with genre signatures for realistic probability calculation.
    
    Args:
        bpm: Beats per minute
        spectral_centroid: Spectral centroid in Hz
        low_db_diff: Low frequency energy difference from pink noise (dB)
        mid_db_diff: Mid frequency energy difference (dB)
        high_db_diff: High frequency energy difference (dB)
        crest_factor: Crest factor in dB
        spectral_rolloff: Spectral rolloff in Hz (brightness indicator)
        zcr: Zero crossing rate (noise/percussion indicator)
        mfcc_features: MFCC features dictionary (optional)
        chroma_features: Chroma features dictionary (optional)
    
    Returns:
        List of (genre, confidence) tuples sorted by confidence (0.0-1.0)
    """
    import numpy as np
    
    matches = []
    
    for genre, signature in GENRE_SIGNATURES.items():
        # Feature vector for current audio
        audio_features = []
        signature_features = []
        weights = []
        
        # 1. BPM feature (normalized 0-1)
        bpm_min, bpm_max = signature['bpm_range']
        bpm_center = (bpm_min + bpm_max) / 2
        bpm_range = bpm_max - bpm_min
        audio_features.append(bpm)
        signature_features.append(bpm_center)
        weights.append(0.25)  # 25% weight
        
        # 2. Spectral Centroid (normalized by typical range 0-5000 Hz)
        audio_features.append(spectral_centroid)
        # Estimate expected centroid from signature
        if signature['high_range_energy'] == 'very_high':
            expected_centroid = 3500
        elif signature['high_range_energy'] == 'high':
            expected_centroid = 2500
        elif signature['high_range_energy'] == 'medium':
            expected_centroid = 2000
        else:
            expected_centroid = 1500
        signature_features.append(expected_centroid)
        weights.append(0.15)  # 15% weight
        
        # 3. Low frequency energy (dB difference)
        audio_features.append(low_db_diff)
        if signature['sub_bass_energy'] == 'very_high':
            expected_low = 5.0
        elif signature['sub_bass_energy'] == 'high':
            expected_low = 2.0
        elif signature['sub_bass_energy'] == 'medium':
            expected_low = 0.0
        else:
            expected_low = -2.0
        signature_features.append(expected_low)
        weights.append(0.20)  # 20% weight
        
        # 4. Mid frequency energy (dB difference)
        audio_features.append(mid_db_diff)
        if signature['mid_range_energy'] == 'very_high':
            expected_mid = 5.0
        elif signature['mid_range_energy'] == 'high':
            expected_mid = 2.0
        elif signature['mid_range_energy'] == 'balanced':
            expected_mid = 0.0
        else:
            expected_mid = -2.0
        signature_features.append(expected_mid)
        weights.append(0.15)  # 15% weight
        
        # 5. High frequency energy (dB difference)
        audio_features.append(high_db_diff)
        if signature['high_range_energy'] == 'very_high':
            expected_high = 5.0
        elif signature['high_range_energy'] == 'high':
            expected_high = 2.0
        elif signature['high_range_energy'] == 'medium':
            expected_high = 0.0
        else:
            expected_high = -2.0
        signature_features.append(expected_high)
        weights.append(0.10)  # 10% weight
        
        # 6. Crest Factor (dynamic range indicator)
        audio_features.append(crest_factor)
        if signature['dynamic_range'] == 'very_high':
            expected_crest = 18.0
        elif signature['dynamic_range'] == 'high':
            expected_crest = 15.0
        elif signature['dynamic_range'] == 'medium':
            expected_crest = 12.0
        elif signature['dynamic_range'] == 'low':
            expected_crest = 10.0
        else:  # very_low
            expected_crest = 7.0
        signature_features.append(expected_crest)
        weights.append(0.15)  # 15% weight
        
        # Convert to numpy arrays for distance calculation
        audio_vec = np.array(audio_features)
        sig_vec = np.array(signature_features)
        weight_vec = np.array(weights)
        
        # Normalize features to similar scales
        # BPM: normalize by range
        audio_vec[0] = (audio_vec[0] - 60) / (200 - 60)  # Normalize 60-200 BPM to 0-1
        sig_vec[0] = (sig_vec[0] - 60) / (200 - 60)
        
        # Spectral Centroid: normalize by 5000 Hz
        audio_vec[1] = audio_vec[1] / 5000.0
        sig_vec[1] = sig_vec[1] / 5000.0
        
        # dB differences: normalize by 10 dB range
        audio_vec[2:5] = (audio_vec[2:5] + 5) / 10.0  # Map -5 to +5 dB to 0-1
        sig_vec[2:5] = (sig_vec[2:5] + 5) / 10.0
        
        # Crest Factor: normalize by 20 dB range
        audio_vec[5] = audio_vec[5] / 20.0
        sig_vec[5] = sig_vec[5] / 20.0
        
        # Weighted Euclidean distance
        diff = audio_vec - sig_vec
        weighted_diff = diff * weight_vec
        distance = np.sqrt(np.sum(weighted_diff ** 2))
        
        # Convert distance to confidence (0.0-1.0)
        # Smaller distance = higher confidence
        # Use exponential decay: confidence = exp(-distance * scale_factor)
        scale_factor = 2.0  # Adjust this to control sensitivity
        confidence = float(np.exp(-distance * scale_factor))
        
        matches.append((genre, confidence))
    
    # Sort by confidence (descending)
    matches.sort(key=lambda x: x[1], reverse=True)
    return matches

/**
 * Phonk Prompt Generator (Suno Style)
 * Generates prompts based on audio analysis data and tag library
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load tag libraries
let tagLibrary = null;
let genrePromptsLibrary = null;

function loadTagLibrary() {
  if (tagLibrary) return tagLibrary;
  
  try {
    const libraryPath = join(__dirname, '../prompts/phonk_tags_library.json');
    const libraryData = readFileSync(libraryPath, 'utf-8');
    tagLibrary = JSON.parse(libraryData);
    return tagLibrary;
  } catch (error) {
    console.error('Error loading tag library:', error);
    // Return default library
    return {
      genres: {},
      moods: {},
      technical_audio: {},
      visual_vibes: {}
    };
  }
}

function loadGenrePromptsLibrary() {
  if (genrePromptsLibrary) return genrePromptsLibrary;
  
  try {
    const libraryPath = join(__dirname, '../prompts/genre_prompts_library.json');
    const libraryData = readFileSync(libraryPath, 'utf-8');
    genrePromptsLibrary = JSON.parse(libraryData);
    return genrePromptsLibrary;
  } catch (error) {
    console.error('Error loading genre prompts library:', error);
    return {
      genre_templates: {},
      mood_mappings: {},
      technical_mappings: {}
    };
  }
}

/**
 * Round number to nearest integer
 */
function roundNumber(num) {
  return Math.round(num);
}

/**
 * Normalize genre name to match library keys
 */
function normalizeGenreName(genre) {
  if (!genre) return '';
  
  const genreMap = {
    'rock': 'Rock',
    'metal': 'Metal',
    'edm': 'EDM',
    'techno': 'Techno',
    'hip-hop': 'Hip-Hop',
    'hip hop': 'Hip-Hop',
    'trap': 'Trap',
    'pop': 'Pop',
    'jazz': 'Jazz',
    'classical': 'Classical',
    'dark phonk': 'Dark Phonk',
    'drift phonk': 'Drift Phonk',
    'ambient': 'Ambient',
    'soul': 'Soul_RnB',
    'rnb': 'Soul_RnB',
    'r&b': 'Soul_RnB',
    'soul_rnb': 'Soul_RnB',
    'reggaeton': 'Reggaeton_Latin',
    'latin': 'Reggaeton_Latin',
    'reggaeton_latin': 'Reggaeton_Latin',
    'funk': 'Funk_Disco',
    'disco': 'Funk_Disco',
    'funk_disco': 'Funk_Disco',
    'synthwave': 'Synthwave_Retrowave',
    'retrowave': 'Synthwave_Retrowave',
    'synthwave_retrowave': 'Synthwave_Retrowave',
    'lofi': 'LoFi_HipHop',
    'lofi hiphop': 'LoFi_HipHop',
    'lofi_hiphop': 'LoFi_HipHop',
    'chillhop': 'LoFi_HipHop',
    'drum and bass': 'Drum_and_Bass',
    'dnb': 'Drum_and_Bass',
    'drum_and_bass': 'Drum_and_Bass',
    'drum n bass': 'Drum_and_Bass',
    'hyperpop': 'Hyperpop',
    'country': 'Country_Folk',
    'folk': 'Country_Folk',
    'country_folk': 'Country_Folk',
    'blues': 'Blues',
    'dubstep': 'Dubstep_Riddim',
    'riddim': 'Dubstep_Riddim',
    'dubstep_riddim': 'Dubstep_Riddim',
    'city pop': 'City_Pop_Japan',
    'citypop': 'City_Pop_Japan',
    'city_pop_japan': 'City_Pop_Japan',
    'j-pop': 'J_Pop_Modern',
    'jpop': 'J_Pop_Modern',
    'j_pop_modern': 'J_Pop_Modern',
    'anime': 'Anime_Epic_Hybrid',
    'anime epic': 'Anime_Epic_Hybrid',
    'anime_epic_hybrid': 'Anime_Epic_Hybrid',
    'j-rock': 'J_Rock',
    'jrock': 'J_Rock',
    'j_rock': 'J_Rock',
    'visual kei': 'J_Rock',
    'baroque': 'Baroque_Classical',
    'baroque classical': 'Baroque_Classical',
    'baroque_classical': 'Baroque_Classical',
    'k-pop': 'K_Pop_Performance',
    'kpop': 'K_Pop_Performance',
    'k_pop_performance': 'K_Pop_Performance',
    'afrobeats': 'Afrobeats',
    'afrobeat': 'Afrobeats',
    'bossa nova': 'Bossa_Nova',
    'bossa_nova': 'Bossa_Nova',
    'future bass': 'Future_Bass',
    'futurebass': 'Future_Bass',
    'future_bass': 'Future_Bass',
    'hardstyle': 'Hardstyle'
  };
  
  const normalized = genre.toLowerCase().trim();
  return genreMap[normalized] || genre;
}

/**
 * Determine genre based on BPM (Suno style)
 */
function determineGenreByBPM(bpm) {
  const roundedBpm = roundNumber(bpm);
  
  if (roundedBpm > 145) {
    return 'drift';
  } else if (roundedBpm < 115) {
    return 'memphis';
  } else {
    return 'house';
  }
}

/**
 * Generate Suno-style prompt from analysis data
 * Now supports all major genres with dynamic templates
 */
export function generatePrompt(analysisData, userRequest = '') {
  const library = loadTagLibrary();
  const genreLibrary = loadGenrePromptsLibrary();
  
  // Round all numeric values
  const roundedBpm = roundNumber(analysisData.bpm);
  const roundedEnergy = roundNumber(analysisData.energy || 0);
  const roundedLoudness = roundNumber(analysisData.loudness || 0);
  const roundedSpectral = roundNumber(analysisData.spectral_centroid || 0);
  
  let finalTags = [];
  const input = userRequest.toLowerCase();
  
  // 1. ADIM: Tür Seçimi (Detected Genre veya BPM'e Göre)
  const detectedGenre = analysisData.genre || '';
  const genreKey = normalizeGenreName(detectedGenre);
  
  // Check if we have a template for this genre
  if (genreLibrary.genre_templates[genreKey]) {
    // Use genre-specific template
    const template = genreLibrary.genre_templates[genreKey];
    finalTags.push(...template.base_tags);
    
    // Add technical tags based on analysis
    if (template.technical_tags) {
      finalTags.push(...template.technical_tags);
    }
  } else {
    // Fallback to old BPM-based classification for Phonk
    const bpmGenreKey = determineGenreByBPM(roundedBpm);
    if (bpmGenreKey === 'drift') {
      finalTags.push(...(library.genres.drift || []));
    } else if (bpmGenreKey === 'memphis') {
      finalTags.push(...(library.genres.memphis || []));
    } else {
      if (library.genres.house && library.genres.house.length > 0) {
        finalTags.push(library.genres.house[0]);
      }
    }
  }

  // 2. ADIM: Kullanıcı İsteklerini ve Lyrics'i Kütüphaneyle Eşleştirme
  // Combine user input with lyrics for better matching
  const lyrics = (analysisData.lyrics || "").toLowerCase();
  const combinedInput = input + " " + lyrics;
  
  // Mood detection with genre-aware mapping
  if (combinedInput.includes("sert") || combinedInput.includes("agresif") || combinedInput.includes("aggressive") || combinedInput.includes("hardcore")) {
    if (genreLibrary.mood_mappings.aggressive) {
      finalTags.push(...genreLibrary.mood_mappings.aggressive);
    } else if (library.moods && library.moods.aggressive) {
      finalTags.push(...library.moods.aggressive);
    }
    if (genreLibrary.technical_mappings.bass_heavy) {
      finalTags.push(genreLibrary.technical_mappings.bass_heavy[1]); // Distorted Bass
    } else if (library.technical_audio && library.technical_audio.bass && library.technical_audio.bass.length > 1) {
      finalTags.push(library.technical_audio.bass[1]);
    }
  }
  
  if (combinedInput.includes("karanlık") || combinedInput.includes("dark") || combinedInput.includes("sinister") || combinedInput.includes("murder") || combinedInput.includes("kill")) {
    if (genreLibrary.mood_mappings.dark) {
      finalTags.push(...genreLibrary.mood_mappings.dark);
    } else if (library.genres && library.genres.dark) {
      finalTags.push(...library.genres.dark);
    }
    if (genreLibrary.mood_mappings.mysterious) {
      finalTags.push(...genreLibrary.mood_mappings.mysterious);
    } else if (library.moods && library.moods.mysterious) {
      finalTags.push(...library.moods.mysterious);
    }
  }
  
  if (combinedInput.includes("enerjik") || combinedInput.includes("energetic") || combinedInput.includes("hype") || combinedInput.includes("power")) {
    if (genreLibrary.mood_mappings.energetic) {
      finalTags.push(...genreLibrary.mood_mappings.energetic);
    } else if (library.moods && library.moods.energetic) {
      finalTags.push(...library.moods.energetic);
    }
  }
  
  if (combinedInput.includes("hüzünlü") || combinedInput.includes("melancholic") || combinedInput.includes("sad") || combinedInput.includes("depressing") || combinedInput.includes("lonely")) {
    if (genreLibrary.mood_mappings.melancholic) {
      finalTags.push(...genreLibrary.mood_mappings.melancholic);
    } else if (library.moods && library.moods.melancholic) {
      finalTags.push(...library.moods.melancholic);
    }
  }
  
  if (combinedInput.includes("gece") || combinedInput.includes("night") || combinedInput.includes("araba") || combinedInput.includes("car") || combinedInput.includes("drive") || combinedInput.includes("drift")) {
    if (library.visual_vibes && library.visual_vibes.night) {
      finalTags.push(...library.visual_vibes.night);
    }
  }
  
  if (combinedInput.includes("şehir") || combinedInput.includes("urban") || combinedInput.includes("street") || combinedInput.includes("racing") || combinedInput.includes("city")) {
    if (library.visual_vibes && library.visual_vibes.urban) {
      finalTags.push(...library.visual_vibes.urban);
    }
  }
  
  // Vocal detection
  if (lyrics && lyrics.trim().length > 0) {
    if (genreLibrary.technical_mappings.vocal_forward) {
      finalTags.push(...genreLibrary.technical_mappings.vocal_forward);
    } else if (library.technical_audio && library.technical_audio.vocal) {
      finalTags.push(...library.technical_audio.vocal);
    }
  } else if (combinedInput.includes("vokal") || combinedInput.includes("vocal") || combinedInput.includes("rap") || combinedInput.includes("şarkı") || combinedInput.includes("söyle")) {
    if (genreLibrary.technical_mappings.vocal_forward) {
      finalTags.push(...genreLibrary.technical_mappings.vocal_forward);
    } else if (library.technical_audio && library.technical_audio.vocal) {
      finalTags.push(...library.technical_audio.vocal);
    }
  }
  
  // Bass detection
  if (combinedInput.includes("bas") || combinedInput.includes("bass") || combinedInput.includes("808")) {
    if (genreLibrary.technical_mappings.bass_heavy) {
      finalTags.push(...genreLibrary.technical_mappings.bass_heavy);
    } else if (library.technical_audio && library.technical_audio.bass) {
      finalTags.push(...library.technical_audio.bass);
    }
  }
  
  // Percussion detection
  if (combinedInput.includes("cowbell") || combinedInput.includes("zil") || combinedInput.includes("perc")) {
    if (library.technical_audio && library.technical_audio.perc) {
      finalTags.push(...library.technical_audio.perc);
    }
  }
  
  // Lo-fi effects
  if (combinedInput.includes("lo-fi") || combinedInput.includes("lofi") || combinedInput.includes("vinyl") || combinedInput.includes("static")) {
    if (library.technical_audio && library.technical_audio.fx) {
      finalTags.push(...library.technical_audio.fx);
    }
  }

  // 3. ADIM: Analiz Verilerini Teknik Tag Olarak Ekle
  // BPM ekle (Key bilgisi çıkarıldı - sadece Analysis Results'ta gösterilecek)
  finalTags.push(`${roundedBpm} BPM`);
  
  // Energy ve Loudness'e göre ek tag'ler
  if (roundedEnergy >= 70) {
    finalTags.push(...library.moods.energetic);
  }
  if (roundedLoudness >= 70) {
    if (library.technical_audio.bass) {
      finalTags.push(library.technical_audio.bass[0]); // Heavy 808
    }
  }
  
  // Spectral centroid'e göre
  if (roundedSpectral < 2000) {
    if (library.technical_audio.fx) {
      finalTags.push(library.technical_audio.fx[0]); // Lo-fi Static
    }
  }

  // 4. ADIM: Çıktıyı Formatla (Suno Stili)
  // Tekrar eden tag'leri temizle ve birleştir
  const uniqueTags = [...new Set(finalTags)];
  
  return `[Style: ${uniqueTags.join(", ")}]`;
}

/**
 * Generate multiple prompt variations
 * Note: Since we're using deterministic logic, variations will be similar
 */
export function generatePromptVariations(analysisData, userRequest = '', count = 3) {
  const variations = [];
  
  for (let i = 0; i < count; i++) {
    // For variations, we can slightly modify the selection
    const basePrompt = generatePrompt(analysisData, userRequest);
    variations.push(basePrompt);
  }
  
  return variations;
}

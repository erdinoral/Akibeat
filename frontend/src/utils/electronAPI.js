// Electron API wrapper with safety checks
export const electronAPI = {
  // Check if electronAPI is available
  isAvailable: () => {
    return typeof window !== 'undefined' && window.electronAPI;
  },

  // Safe wrapper functions
  analyzeAudio: async (filePath) => {
    if (!electronAPI.isAvailable()) {
      throw new Error('Electron API yüklenemedi. Lütfen uygulamayı yeniden başlatın.');
    }
    return window.electronAPI.analyzeAudio(filePath);
  },

  startFullAnalysis: async (filePath) => {
    if (!electronAPI.isAvailable()) {
      throw new Error('Electron API yüklenemedi. Lütfen uygulamayı yeniden başlatın.');
    }
    return window.electronAPI.startFullAnalysis(filePath);
  },

  onProgress: (callback) => {
    if (!electronAPI.isAvailable()) {
      return;
    }
    window.electronAPI.onProgress(callback);
  },
  
  removeProgressListener: () => {
    if (!electronAPI.isAvailable()) {
      return;
    }
    if (window.electronAPI.removeProgressListener) {
      window.electronAPI.removeProgressListener();
    }
  },

  generatePrompt: async (analysisData, userRequest) => {
    if (!electronAPI.isAvailable()) {
      throw new Error('Electron API yüklenemedi. Lütfen uygulamayı yeniden başlatın.');
    }
    return window.electronAPI.generatePrompt(analysisData, userRequest);
  },

  dbGet: async (key) => {
    if (!electronAPI.isAvailable()) {
      throw new Error('Electron API yüklenemedi.');
    }
    return window.electronAPI.dbGet(key);
  },

  dbSet: async (key, value) => {
    if (!electronAPI.isAvailable()) {
      throw new Error('Electron API yüklenemedi.');
    }
    return window.electronAPI.dbSet(key, value);
  },

  dbPush: async (key, value) => {
    if (!electronAPI.isAvailable()) {
      throw new Error('Electron API yüklenemedi.');
    }
    return window.electronAPI.dbPush(key, value);
  },

  selectAudioFile: async () => {
    if (!electronAPI.isAvailable()) {
      throw new Error('Electron API yüklenemedi.');
    }
    return window.electronAPI.selectAudioFile();
  },
};

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Audio Analysis (Full analysis with lyrics)
  analyzeAudio: (filePath) => ipcRenderer.invoke('analyze-audio', filePath),
  startFullAnalysis: (filePath) => ipcRenderer.invoke('analyze-all', filePath),
  onProgress: (callback) => {
    ipcRenderer.on('analysis-progress', (event, value) => callback(value));
  },
  removeProgressListener: () => {
    ipcRenderer.removeAllListeners('analysis-progress');
  },
  
  // Prompt Generation
  generatePrompt: (analysisData, userRequest) => 
    ipcRenderer.invoke('generate-prompt', analysisData, userRequest),
  
  // Database Operations
  dbGet: (key) => ipcRenderer.invoke('db-get', key),
  dbSet: (key, value) => ipcRenderer.invoke('db-set', key, value),
  dbPush: (key, value) => ipcRenderer.invoke('db-push', key, value),
  dbFind: (key, predicate) => ipcRenderer.invoke('db-find', key, predicate),
  
  // File Operations - handled via IPC in main process
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file')
});

// Debug: Log that preload script loaded
console.log('[Preload] Electron API exposed to window.electronAPI');

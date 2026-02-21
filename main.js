import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let mainWindow;

function createWindow() {
  const preloadPath = join(__dirname, 'preload.js');
  console.log('[Main] Preload path:', preloadPath);
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#000000',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    titleBarStyle: 'hiddenInset',
    frame: true,
    show: false, // Don't show until ready
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('[Main] Window ready to show');
    mainWindow.show();
    mainWindow.focus();
  });
  
  // Ensure window is shown even if ready-to-show doesn't fire
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('[Main] Force showing window (ready-to-show timeout)');
      mainWindow.show();
    }
  }, 1000);
  
  // Debug: Check if preload loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Main] Frontend loaded successfully');
    mainWindow.webContents.executeJavaScript(`
      console.log('[Renderer] window.electronAPI available:', typeof window.electronAPI !== 'undefined');
      if (typeof window.electronAPI === 'undefined') {
        console.error('[Renderer] ERROR: window.electronAPI is not defined!');
      }
    `).catch((err) => {
      console.error('[Main] Failed to execute debug script:', err);
    });
  });
  
  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}]:`, message);
  });

  // Development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
    // In dev mode, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173').catch((error) => {
      console.error('Failed to load dev server:', error);
      // Fallback to built files if dev server is not running
      mainWindow.loadFile(join(__dirname, 'dist-frontend/index.html')).catch((err) => {
        console.error('Failed to load built files:', err);
      });
    });
  } else {
    // In production, load from built files
    const indexPath = join(__dirname, 'dist-frontend/index.html');
    console.log('[Main] Loading frontend from:', indexPath);
    mainWindow.loadFile(indexPath).catch((error) => {
      console.error('[Main] Failed to load frontend:', error);
      // Try alternative path
      const altPath = join(process.cwd(), 'dist-frontend/index.html');
      console.log('[Main] Trying alternative path:', altPath);
      mainWindow.loadFile(altPath).catch((err) => {
        console.error('[Main] All load attempts failed:', err);
        // Show error to user
        mainWindow.webContents.executeJavaScript(`
          document.body.innerHTML = '<div style="padding: 20px; color: white; font-family: Arial;">
            <h1>Frontend Yüklenemedi</h1>
            <p>Frontend dosyaları bulunamadı. Lütfen uygulamayı yeniden build edin:</p>
            <code>npm run build</code>
            <p>Veya dev modunda çalıştırın:</p>
            <code>npm run electron:dev</code>
          </div>';
        `);
      });
    });
  }
  
  // Handle window errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[Main] Failed to load:', errorCode, errorDescription, validatedURL);
    if (errorCode === -6) {
      // ERR_FILE_NOT_FOUND
      console.error('[Main] File not found, trying to build frontend...');
    }
  });
  
  mainWindow.webContents.on('crashed', () => {
    console.error('[Main] Renderer process crashed!');
  });
  
  mainWindow.webContents.on('unresponsive', () => {
    console.error('[Main] Renderer process unresponsive!');
  });
}

app.whenReady().then(async () => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // IPC Handlers - set up after app is ready
  try {
    const pythonBridge = await import('./src/main/pythonBridge.js');
    
    // Standard audio analysis (without lyrics - faster)
    ipcMain.handle('analyze-audio', async (event, filePath) => {
      try {
        console.log('[Main] Starting audio analysis for:', filePath);
        const result = await pythonBridge.analyzeAudio(filePath);
        console.log('[Main] Analysis completed successfully');
        return { success: true, data: result };
      } catch (error) {
        console.error('[Main] Analysis failed:', error);
        return { success: false, error: error.message };
      }
    });
    
    // Full analysis with lyrics extraction (slower but complete)
    ipcMain.handle('analyze-all', async (event, filePath) => {
      try {
        // Send progress updates
        event.sender.send('analysis-progress', 'Audio analiz ediliyor...');
        
        const result = await pythonBridge.analyzeAudio(filePath);
        
        // Check if lyrics extraction was successful
        if (result.lyrics && result.lyrics.trim()) {
          if (event.sender && !event.sender.isDestroyed()) {
            event.sender.send('analysis-progress', 'Sözler çıkarıldı!');
          }
        } else {
          if (event.sender && !event.sender.isDestroyed()) {
            event.sender.send('analysis-progress', 'Sözler bulunamadı (Whisper/Demucs gerekli)');
          }
        }
        
        if (event.sender && !event.sender.isDestroyed()) {
          event.sender.send('analysis-progress', 'Analiz tamamlandı!');
        }
        
        return { success: true, data: result };
      } catch (error) {
        event.sender.send('analysis-progress', `Hata: ${error.message}`);
        return { success: false, error: error.message };
      }
    });
  } catch (error) {
    console.error('Python bridge not available:', error);
  }

  // Prompt generation using local tag library
  try {
    const promptGenerator = await import('./src/main/promptGenerator.js');
    ipcMain.handle('generate-prompt', async (event, analysisData, userRequest) => {
      try {
        const result = await promptGenerator.generatePrompt(analysisData, userRequest);
        return { success: true, data: result };
      } catch (error) {
        console.error('Prompt generation error:', error);
        return { success: false, error: error.message };
      }
    });
  } catch (error) {
    console.error('Prompt generator not available:', error);
  }

  try {
    const dbModule = await import('./src/main/db.js');
    // Ensure database is initialized
    await dbModule.initializeDatabase();
    
    ipcMain.handle('db-get', async (event, key) => {
      try {
        return await dbModule.dbGet(key);
      } catch (error) {
        console.error('DB get error:', error);
        throw error;
      }
    });

    ipcMain.handle('db-set', async (event, key, value) => {
      try {
        return await dbModule.dbSet(key, value);
      } catch (error) {
        console.error('DB set error:', error);
        throw error;
      }
    });

    ipcMain.handle('db-push', async (event, key, value) => {
      try {
        return await dbModule.dbPush(key, value);
      } catch (error) {
        console.error('DB push error:', error);
        throw error;
      }
    });

    ipcMain.handle('db-find', async (event, key, predicate) => {
      try {
        return await dbModule.dbFind(key, predicate);
      } catch (error) {
        console.error('DB find error:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Database not available:', error);
  }

  // File selection handler
  ipcMain.handle('select-audio-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'm4a'] }
      ]
    });
    return result.canceled ? null : result.filePaths[0];
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

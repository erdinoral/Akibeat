import { spawn, spawnSync, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Find Python executable
 * @returns {string} Path to Python executable
 */
function findPythonExecutable() {
  // PRIORITY 1: Try to find Python 3.11 specifically (preferred for TensorFlow support)
  if (process.platform === 'win32') {
    const homeDir = os.homedir();
    
    const python311Paths = [
      // User AppData paths (most common)
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
      // System paths
      'C:\\Python311\\python.exe',
      'C:\\Program Files\\Python311\\python.exe',
    ];
    
    for (const path of python311Paths) {
      if (existsSync(path)) {
        try {
          const result = spawnSync(path, ['--version'], {
            stdio: 'pipe',
            shell: false,
            timeout: 2000
          });
          if (result.status === 0) {
            const version = result.stdout.toString() || result.stderr.toString();
            if (version.includes('3.11')) {
              return path;
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
  } else {
    // Unix: try python3.11 first
    const python311Commands = ['python3.11', 'python311'];
    for (const cmd of python311Commands) {
      try {
        const result = spawnSync(cmd, ['--version'], {
          stdio: 'pipe',
          shell: false,
          timeout: 2000
        });
        if (result.status === 0) {
          const version = result.stdout.toString() || result.stderr.toString();
          if (version.includes('3.11')) {
            return cmd;
          }
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  // PRIORITY 2: Try standard Python commands
  const pythonCommands = ['python', 'python3', 'py'];
  
  for (const cmd of pythonCommands) {
    try {
      // Use spawnSync for better cross-platform support
      const result = spawnSync(cmd, ['--version'], {
        stdio: 'pipe',
        shell: process.platform === 'win32',
        timeout: 2000
      });
      
      if (result.status === 0 || result.stdout.toString().includes('Python')) {
        return cmd;
      }
    } catch (error) {
      continue;
    }
  }
  
  // PRIORITY 3: Fallback: try common Windows paths (other versions)
  if (process.platform === 'win32') {
    const homeDir = os.homedir();
    
    const commonPaths = [
      // User-specific Python installations
      join(homeDir, 'AppData', 'Local', 'Python', 'bin', 'python.exe'),
      join(homeDir, 'AppData', 'Local', 'Python', 'python.exe'),
      // User AppData paths (prioritize 3.11, then newer versions)
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'python.exe'),
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python314', 'python.exe'),
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'python.exe'),
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python39', 'python.exe'),
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python38', 'python.exe'),
      // Python Launcher paths (Windows Store stub - use as last resort)
      join(homeDir, 'AppData', 'Local', 'Microsoft', 'WindowsApps', 'python.exe'),
      // System paths
      'C:\\Python311\\python.exe',
      'C:\\Python312\\python.exe',
      'C:\\Python313\\python.exe',
      'C:\\Python314\\python.exe',
      'C:\\Python310\\python.exe',
      'C:\\Python39\\python.exe',
      'C:\\Python38\\python.exe',
      'C:\\Program Files\\Python311\\python.exe',
      'C:\\Program Files\\Python312\\python.exe',
      'C:\\Program Files\\Python313\\python.exe',
      'C:\\Program Files\\Python314\\python.exe',
      'C:\\Program Files\\Python310\\python.exe',
      'C:\\Program Files\\Python39\\python.exe',
      'C:\\Program Files\\Python38\\python.exe',
    ];
    
    for (const path of commonPaths) {
      if (existsSync(path)) {
        return path;
      }
    }
    
    // Try to find via 'where' command on Windows
    try {
      const whereResult = spawnSync('where', ['python'], {
        stdio: 'pipe',
        shell: true,
        timeout: 2000
      });
      
      if (whereResult.status === 0) {
        const output = whereResult.stdout.toString().trim();
        const paths = output.split('\n').map(p => p.trim()).filter(p => p);
        // Prefer the actual Python installation over Windows Store stub
        for (const pythonPath of paths) {
          if (pythonPath && existsSync(pythonPath) && !pythonPath.includes('WindowsApps')) {
            return pythonPath;
          }
        }
        // If only WindowsApps version found, use it
        if (paths.length > 0 && existsSync(paths[0])) {
          return paths[0];
        }
      }
    } catch (error) {
      // Ignore
    }
  } else {
    // Unix paths
    const commonPaths = [
      '/usr/bin/python3',
      '/usr/local/bin/python3',
      '/opt/homebrew/bin/python3',
      '/usr/bin/python',
      '/usr/local/bin/python',
    ];
    
    for (const path of commonPaths) {
      if (existsSync(path)) {
        return path;
      }
    }
  }
  
  throw new Error('Python executable not found. Please install Python 3.8+ and ensure it is in your PATH.');
}

/**
 * Analyze audio file using Python analysis script
 * @param {string} filePath - Path to audio file
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeAudio(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const pythonExec = findPythonExecutable();
      const scriptPath = join(__dirname, '../../backend/analysis.py');
      
      if (!existsSync(scriptPath)) {
        reject(new Error(`Analysis script not found: ${scriptPath}`));
        return;
      }
      
      if (!existsSync(filePath)) {
        reject(new Error(`Audio file not found: ${filePath}`));
        return;
      }
      
      console.log('[PythonBridge] Starting analysis for:', filePath);
      
      // Spawn Python process
      const pythonProcess = spawn(pythonExec, [scriptPath, filePath], {
        cwd: join(__dirname, '../../'),
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      
      let stdout = '';
      let stderr = '';
      
      // Set timeout (5 minutes for audio analysis)
      const timeout = setTimeout(() => {
        console.error('[PythonBridge] Analysis timeout - killing process');
        pythonProcess.kill();
        reject(new Error('Analiz zaman aşımına uğradı (5 dakika). Dosya çok büyük olabilir veya Python scripti takılmış olabilir.'));
      }, 300000); // 5 minutes
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        const stderrData = data.toString();
        stderr += stderrData;
        // Log stderr to console for debugging
        console.log('[PythonBridge] stderr:', stderrData.trim());
      });
      
      pythonProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        console.log('[PythonBridge] Process closed with code:', code);
        console.log('[PythonBridge] stdout length:', stdout.length);
        console.log('[PythonBridge] stderr length:', stderr.length);
        
        if (code !== 0) {
          reject(new Error(`Python script failed (code ${code}): ${stderr || 'Unknown error'}`));
          return;
        }
        
        try {
          // Clean stdout - remove any non-JSON content (warnings, etc.)
          // Find the JSON object in stdout (it should start with {)
          const jsonStart = stdout.indexOf('{');
          if (jsonStart === -1) {
            throw new Error('No JSON found in Python output');
          }
          
          // Extract only the JSON part
          const jsonOutput = stdout.substring(jsonStart);
          
          // Try to find the end of JSON (last })
          let jsonEnd = jsonOutput.lastIndexOf('}');
          if (jsonEnd === -1) {
            throw new Error('Invalid JSON format - no closing brace');
          }
          
          // Extract the complete JSON
          const cleanJson = jsonOutput.substring(0, jsonEnd + 1);
          
          console.log('[PythonBridge] Parsing JSON, length:', cleanJson.length);
          const result = JSON.parse(cleanJson);
          
          if (result.error) {
            reject(new Error(result.error));
          } else {
            console.log('[PythonBridge] Analysis successful');
            resolve(result);
          }
        } catch (parseError) {
          console.error('[PythonBridge] Parse error:', parseError);
          console.error('[PythonBridge] stdout:', stdout);
          console.error('[PythonBridge] stderr:', stderr);
          reject(new Error(`Failed to parse Python output: ${parseError.message}\nOutput: ${stdout.substring(0, 500)}\nStderr: ${stderr.substring(0, 500)}`));
        }
      });
      
      pythonProcess.on('error', (error) => {
        clearTimeout(timeout);
        console.error('[PythonBridge] Process error:', error);
        reject(new Error(`Failed to spawn Python process: ${error.message}`));
      });
      
    } catch (error) {
      console.error('[PythonBridge] Setup error:', error);
      reject(error);
    }
  });
}

import { spawn, exec, execSync } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';
import os from 'os';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function checkCommand(command, args = ['--version']) {
  try {
    const { stdout } = await execAsync(`${command} ${args.join(' ')}`);
    return { installed: true, version: stdout.trim() };
  } catch (error) {
    return { installed: false, error: error.message };
  }
}

async function checkNodeJS() {
  log('\n🔍 Node.js kontrol ediliyor...', 'cyan');
  const result = await checkCommand('node', ['--version']);
  if (result.installed) {
    log(`✓ Node.js yüklü: ${result.version}`, 'green');
    return true;
  } else {
    log('✗ Node.js bulunamadı!', 'red');
    log('  Lütfen Node.js 18+ yükleyin: https://nodejs.org/', 'yellow');
    return false;
  }
}

async function findPython311() {
  // First, try to find Python 3.11 specifically
  const homeDir = os.homedir();
  
  if (process.platform === 'win32') {
    // Windows paths for Python 3.11
    const python311Paths = [
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
      'C:\\Python311\\python.exe',
      'C:\\Program Files\\Python311\\python.exe',
      join(homeDir, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'pythonw.exe'),
    ];
    
    for (const path of python311Paths) {
      if (existsSync(path)) {
        // Verify it's actually Python 3.11
        try {
          const version = execSync(`"${path}" --version`, { encoding: 'utf8', timeout: 2000 }).trim();
          if (version.includes('3.11')) {
            return { path, version };
          }
        } catch (e) {
          continue;
        }
      }
    }
  } else {
    // Unix paths
    const python311Commands = ['python3.11', 'python311'];
    for (const cmd of python311Commands) {
      try {
        const version = execSync(`${cmd} --version`, { encoding: 'utf8', timeout: 2000 }).trim();
        if (version.includes('3.11')) {
          return { path: cmd, version };
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  return null;
}

async function checkPython() {
  log('\n🔍 Python kontrol ediliyor...', 'cyan');
  
  // First, try to find Python 3.11 specifically
  const python311 = await findPython311();
  if (python311) {
    log(`✓ Python 3.11 bulundu: ${python311.version}`, 'green');
    log('  ⭐ Python 3.11 kullanılıyor (TensorFlow desteği için ideal)', 'blue');
    return { installed: true, command: python311.path, version: '3.11', preferred: true };
  }
  
  // Fallback to checking standard Python commands
  const pythonCommands = ['python3', 'python'];
  
  for (const cmd of pythonCommands) {
    const result = await checkCommand(cmd, ['--version']);
    if (result.installed) {
      log(`✓ Python yüklü: ${result.version}`, 'green');
      
      // Check Python version
      const versionMatch = result.version.match(/(\d+)\.(\d+)/);
      if (versionMatch) {
        const major = parseInt(versionMatch[1]);
        const minor = parseInt(versionMatch[2]);
        
        if (major === 3 && minor === 11) {
          log('  ⭐ Python 3.11 kullanılıyor (TensorFlow desteği için ideal)', 'blue');
          return { installed: true, command: cmd, version: '3.11', preferred: true };
        } else if (major >= 3 && minor >= 8) {
          log('  ⚠ Python 3.11 önerilir (TensorFlow desteği için)', 'yellow');
          log('    Mevcut sürüm çalışır ancak TensorFlow kullanılamayabilir', 'yellow');
          return { installed: true, command: cmd, version: `${major}.${minor}`, preferred: false };
        } else {
          log('⚠ Python 3.8+ gerekli!', 'yellow');
        }
      }
      return { installed: true, command: cmd, version: 'unknown', preferred: false };
    }
  }
  
  log('✗ Python bulunamadı!', 'red');
  log('', '');
  log('📥 Python 3.11 İndirme Talimatları:', 'bright');
  log('  1. Python 3.11.9 (veya son sürüm) indirin:', 'yellow');
  log('     https://www.python.org/downloads/release/python-3119/', 'cyan');
  log('  2. Kurulum sırasında "Add Python to PATH" seçeneğini işaretleyin', 'yellow');
  log('  3. Kurulumdan sonra terminali kapatıp yeniden açın', 'yellow');
  log('  4. Bu launcher\'ı tekrar çalıştırın', 'yellow');
  log('', '');
  return { installed: false };
}

// Ollama functions removed - no longer needed

async function checkPythonPackages(pythonInfo) {
  log('\n🔍 Python paketleri kontrol ediliyor...', 'cyan');
  
  if (!pythonInfo || !pythonInfo.installed) {
    return { installed: false, pythonInfo: null };
  }
  
  try {
    // Check core packages (TensorFlow is optional)
    const { stdout } = await execAsync(`${pythonInfo.command} -c "import librosa; import numpy; import scipy"`);
    log('✓ Gerekli Python paketleri yüklü', 'green');
    
    // Check if Whisper and Demucs are available (for lyrics extraction)
    let whisperAvailable = false;
    let demucsAvailable = false;
    try {
      await execAsync(`${pythonInfo.command} -c "import whisper"`);
      whisperAvailable = true;
    } catch (e) {
      log('  ⚠ Whisper yüklü değil (söz çıkarma çalışmayacak)', 'yellow');
    }
    
    try {
      await execAsync(`${pythonInfo.command} -c "import demucs"`);
      demucsAvailable = true;
    } catch (e) {
      log('  ⚠ Demucs yüklü değil (söz çıkarma çalışmayacak)', 'yellow');
    }
    
    if (whisperAvailable && demucsAvailable) {
      log('  ✓ Whisper ve Demucs yüklü (söz çıkarma aktif)', 'green');
    } else {
      log('  ⚠ Söz çıkarma için: openai-whisper, demucs, torch, torchaudio gerekli', 'yellow');
      log(`    Yüklemek için: ${pythonInfo.command} -m pip install openai-whisper demucs torch torchaudio`, 'cyan');
    }
    
    // Check if TensorFlow is available (optional)
    try {
      await execAsync(`${pythonInfo.command} -c "import tensorflow"`);
      log('  ✓ TensorFlow da yüklü (CNN model kullanılabilir)', 'blue');
    } catch (tfError) {
      log('  ⚠ TensorFlow yüklü değil (rule-based classification kullanılacak)', 'yellow');
      log('    Not: TensorFlow Python 3.11\'e kadar desteklenir', 'yellow');
    }
    
    return { installed: true, pythonInfo, whisperAvailable, demucsAvailable };
  } catch (error) {
    log('⚠ Bazı Python paketleri eksik!', 'yellow');
    log('  Yüklemek için:', 'yellow');
    log(`  ${pythonInfo.command} -m pip install -r backend/requirements.txt`, 'cyan');
    log('  Not: TensorFlow Python 3.11\'e kadar desteklenir, Python 3.12+ için opsiyoneldir', 'yellow');
    return { installed: false, pythonInfo, whisperAvailable: false, demucsAvailable: false };
  }
}

async function installPythonPackages(pythonInfo) {
  log('\n📦 Python paketleri yükleniyor...', 'cyan');
  const requirementsPath = join(__dirname, 'backend', 'requirements.txt');
  
  if (!existsSync(requirementsPath)) {
    log('✗ requirements.txt bulunamadı!', 'red');
    return false;
  }
  
  return new Promise((resolve, reject) => {
    // Use array format to avoid shell injection vulnerabilities
    // On Windows, we may need shell for some commands
    const pip = spawn(pythonInfo.command, ['-m', 'pip', 'install', '-r', requirementsPath], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: process.platform === 'win32'  // Windows may need shell
    });
    
    pip.on('close', (code) => {
      if (code === 0) {
        log('✓ Python paketleri yüklendi', 'green');
        resolve(true);
      } else {
        log('✗ Python paketleri yüklenemedi', 'red');
        log('  Lütfen manuel olarak yükleyin:', 'yellow');
        log(`  ${pythonInfo.command} -m pip install -r backend/requirements.txt`, 'cyan');
        reject(false);
      }
    });
    
    pip.on('error', (error) => {
      log(`✗ Hata: ${error.message}`, 'red');
      reject(false);
    });
  });
}

async function checkNpmPackages() {
  log('\n🔍 Node.js paketleri kontrol ediliyor...', 'cyan');
  const nodeModulesPath = join(__dirname, 'node_modules');
  
  if (existsSync(nodeModulesPath)) {
    log('✓ Node.js paketleri yüklü', 'green');
    return true;
  } else {
    log('⚠ Node.js paketleri yüklü değil!', 'yellow');
    log('  Yüklemek için: npm install', 'cyan');
    return false;
  }
}

async function installNpmPackages() {
  log('\n📦 Node.js paketleri yükleniyor...', 'cyan');
  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: process.platform === 'win32'  // Windows may need shell
    });
    
    npm.on('close', (code) => {
      if (code === 0) {
        log('✓ Node.js paketleri yüklendi', 'green');
        resolve(true);
      } else {
        log('✗ Node.js paketleri yüklenemedi', 'red');
        reject(false);
      }
    });
    
    npm.on('error', (error) => {
      log(`✗ Hata: ${error.message}`, 'red');
      reject(false);
    });
  });
}

async function buildFrontend() {
  log('\n🔨 Frontend build ediliyor...', 'cyan');
  return new Promise((resolve, reject) => {
    const vite = spawn('npm', ['run', 'build'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    
    vite.on('close', (code) => {
      if (code === 0) {
        log('✓ Frontend build tamamlandı', 'green');
        resolve(true);
      } else {
        log('✗ Frontend build başarısız', 'red');
        reject(false);
      }
    });
    
    vite.on('error', (error) => {
      log(`✗ Hata: ${error.message}`, 'red');
      reject(false);
    });
  });
}

async function startApplication() {
  log('\n🚀 Uygulama başlatılıyor...', 'cyan');
  
  // Build frontend first
  try {
    await buildFrontend();
  } catch (error) {
    log('⚠ Build hatası, dev modunda başlatılıyor...', 'yellow');
  }
  
  const electron = spawn('npm', ['run', 'electron'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: process.platform === 'win32'  // Windows may need shell
  });
  
  electron.on('close', (code) => {
    if (code !== 0) {
      log(`\n⚠ Uygulama kapatıldı (kod: ${code})`, 'yellow');
    }
  });
  
  electron.on('error', (error) => {
    log(`\n✗ Hata: ${error.message}`, 'red');
  });
}

async function main() {
  log('\n' + '='.repeat(50), 'bright');
  log('🎧 BPMer - İhtiyacınız Olan Müzik Analistiniz', 'bright');
  log('='.repeat(50), 'bright');
  
  // Check Node.js
  const nodeInstalled = await checkNodeJS();
  if (!nodeInstalled) {
    log('\n❌ Node.js gerekli! Lütfen yükleyin ve tekrar deneyin.', 'red');
    process.exit(1);
  }
  
  // Check npm packages
  const npmPackagesInstalled = await checkNpmPackages();
  if (!npmPackagesInstalled) {
    log('\n❓ Node.js paketlerini şimdi yüklemek ister misiniz? (y/n)', 'yellow');
    // For automated installation, we'll try to install
    try {
      await installNpmPackages();
    } catch (error) {
      log('Lütfen manuel olarak yükleyin: npm install', 'yellow');
      process.exit(1);
    }
  }
  
  // Check Python
  const pythonInfo = await checkPython();
  let pythonPackagesInstalled = false;
  
  if (!pythonInfo.installed) {
    log('\n❌ Python 3.11 gerekli!', 'red');
    log('  Lütfen Python 3.11 yükleyin ve tekrar deneyin.', 'yellow');
    log('  İndirme: https://www.python.org/downloads/release/python-3119/', 'cyan');
    process.exit(1);
  } else {
    // Warn if not Python 3.11
    if (!pythonInfo.preferred) {
      log('\n⚠ Python 3.11 önerilir!', 'yellow');
      log('  Mevcut sürüm çalışır ancak TensorFlow desteği için Python 3.11 ideal.', 'yellow');
      log('  İndirme: https://www.python.org/downloads/release/python-3119/', 'cyan');
    }
    
    // Check Python packages
    const pythonPackagesResult = await checkPythonPackages(pythonInfo);
    pythonPackagesInstalled = pythonPackagesResult.installed;
    
    if (!pythonPackagesResult.installed && pythonPackagesResult.pythonInfo) {
      log('\n📦 Python paketleri otomatik yükleniyor...', 'cyan');
      log('  Bu işlem birkaç dakika sürebilir (özellikle Whisper/Demucs)...', 'yellow');
      try {
        await installPythonPackages(pythonPackagesResult.pythonInfo);
        pythonPackagesInstalled = true;
        // Re-check after installation
        const recheckResult = await checkPythonPackages(pythonInfo);
        pythonPackagesInstalled = recheckResult.installed;
      } catch (error) {
        log('  Python paketleri yüklenemedi, ancak uygulama çalışabilir', 'yellow');
      }
    }
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'bright');
  log('📋 Özet:', 'bright');
  log('='.repeat(50), 'bright');
  log(`Node.js: ${nodeInstalled ? '✓' : '✗'}`, nodeInstalled ? 'green' : 'red');
  log(`Python: ${pythonInfo.installed ? '✓' : '✗'}`, pythonInfo.installed ? 'green' : 'red');
  log(`Python Paketleri: ${pythonPackagesInstalled ? '✓' : '✗'}`, pythonPackagesInstalled ? 'green' : 'red');
  
  // Start application
  log('\n' + '='.repeat(50), 'bright');
  await startApplication();
}

// Run launcher
main().catch((error) => {
  log(`\n✗ Kritik hata: ${error.message}`, 'red');
  process.exit(1);
});

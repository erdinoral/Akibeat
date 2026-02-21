# BPMer Launcher for PowerShell
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🎧 BPMer - Başlatıcı" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "🔍 Node.js kontrol ediliyor..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Node.js yüklü: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "✗ Node.js bulunamadı!" -ForegroundColor Red
    Write-Host "  Lütfen Node.js 18+ yükleyin: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm packages
Write-Host ""
Write-Host "🔍 Node.js paketleri kontrol ediliyor..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠ Node.js paketleri yüklü değil!" -ForegroundColor Yellow
    Write-Host "  Yükleniyor..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Paket yükleme başarısız!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Node.js paketleri yüklü" -ForegroundColor Green
}

# Check Python
Write-Host ""
Write-Host "🔍 Python kontrol ediliyor..." -ForegroundColor Cyan
$pythonFound = $false
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Python yüklü: $pythonVersion" -ForegroundColor Green
        $pythonFound = $true
    }
} catch {
    try {
        $pythonVersion = python3 --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Python yüklü: $pythonVersion" -ForegroundColor Green
            $pythonFound = $true
        }
    } catch {
        Write-Host "⚠ Python bulunamadı!" -ForegroundColor Yellow
        Write-Host "  Analiz özellikleri çalışmayabilir." -ForegroundColor Yellow
        Write-Host "  Python 3.8+ yükleyin: https://www.python.org/downloads/" -ForegroundColor Yellow
    }
}

# Check Ollama
Write-Host ""
Write-Host "🔍 Ollama kontrol ediliyor..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Ollama çalışıyor" -ForegroundColor Green
} catch {
    Write-Host "⚠ Ollama çalışmıyor!" -ForegroundColor Yellow
    Write-Host "  Prompt üretimi çalışmayabilir." -ForegroundColor Yellow
    Write-Host "  Ollama yükleyin: https://ollama.ai" -ForegroundColor Yellow
}

# Start application
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 Uygulama başlatılıyor..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

node launcher.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Uygulama başlatılamadı!" -ForegroundColor Red
    exit 1
}

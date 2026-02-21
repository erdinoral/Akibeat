@echo off
chcp 65001 >nul
title BPMer - Başlatıcı

echo.
echo ==================================================
echo 🎧 BPMer - Başlatıcı
echo ==================================================
echo.

REM Check Node.js
echo 🔍 Node.js kontrol ediliyor...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js bulunamadı!
    echo   Lütfen Node.js 18+ yükleyin: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js yüklü: %NODE_VERSION%
)

REM Check npm packages
echo.
echo 🔍 Node.js paketleri kontrol ediliyor...
if not exist "node_modules" (
    echo ⚠ Node.js paketleri yüklü değil!
    echo   Yükleniyor...
    call npm install
    if %errorlevel% neq 0 (
        echo ✗ Paket yükleme başarısız!
        pause
        exit /b 1
    )
) else (
    echo ✓ Node.js paketleri yüklü
)

REM Check Python
echo.
echo 🔍 Python kontrol ediliyor...
where python >nul 2>&1
if %errorlevel% neq 0 (
    where python3 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠ Python bulunamadı!
        echo   Analiz özellikleri çalışmayabilir.
        echo   Python 3.8+ yükleyin: https://www.python.org/downloads/
    ) else (
        echo ✓ Python3 bulundu
    )
) else (
    echo ✓ Python bulundu
)

REM Check Ollama
echo.
echo 🔍 Ollama kontrol ediliyor...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ Ollama çalışmıyor!
    echo   Prompt üretimi çalışmayabilir.
    echo   Ollama yükleyin: https://ollama.ai
) else (
    echo ✓ Ollama çalışıyor
)

REM Start application
echo.
echo ==================================================
echo 🚀 Uygulama başlatılıyor...
echo ==================================================
echo.

node launcher.js

if %errorlevel% neq 0 (
    echo.
    echo ✗ Uygulama başlatılamadı!
    pause
    exit /b 1
)

pause

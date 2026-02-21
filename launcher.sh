#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BRIGHT='\033[1m'
NC='\033[0m' # No Color

echo ""
echo "=================================================="
echo -e "${BRIGHT}🎧 BPMer - Başlatıcı${NC}"
echo "=================================================="
echo ""

# Check Node.js
echo -e "${CYAN}🔍 Node.js kontrol ediliyor...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js yüklü: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js bulunamadı!${NC}"
    echo -e "${YELLOW}  Lütfen Node.js 18+ yükleyin: https://nodejs.org/${NC}"
    exit 1
fi

# Check npm packages
echo ""
echo -e "${CYAN}🔍 Node.js paketleri kontrol ediliyor...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Node.js paketleri yüklü değil!${NC}"
    echo -e "${CYAN}  Yükleniyor...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Paket yükleme başarısız!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Node.js paketleri yüklü${NC}"
fi

# Check Python
echo ""
echo -e "${CYAN}🔍 Python kontrol ediliyor...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python yüklü: $PYTHON_VERSION${NC}"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo -e "${GREEN}✓ Python yüklü: $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Python bulunamadı!${NC}"
    echo -e "${YELLOW}  Analiz özellikleri çalışmayabilir.${NC}"
    echo -e "${YELLOW}  Python 3.8+ yükleyin: https://www.python.org/downloads/${NC}"
fi

# Check Ollama
echo ""
echo -e "${CYAN}🔍 Ollama kontrol ediliyor...${NC}"
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama çalışıyor${NC}"
else
    echo -e "${YELLOW}⚠ Ollama çalışmıyor!${NC}"
    echo -e "${YELLOW}  Prompt üretimi çalışmayabilir.${NC}"
    echo -e "${YELLOW}  Ollama yükleyin: https://ollama.ai${NC}"
fi

# Start application
echo ""
echo "=================================================="
echo -e "${CYAN}🚀 Uygulama başlatılıyor...${NC}"
echo "=================================================="
echo ""

node launcher.js

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}✗ Uygulama başlatılamadı!${NC}"
    exit 1
fi

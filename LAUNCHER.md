# Başlatıcı Kullanım Kılavuzu

BPMer başlatıcısı, uygulamayı çalıştırmadan önce gerekli tüm bağımlılıkları kontrol eder ve eksik olanları tespit eder.

## Kullanım

### Windows

**PowerShell:**
```powershell
.\launcher.ps1
```

**Command Prompt:**
```cmd
launcher.bat
```

### macOS / Linux

```bash
./launcher.sh
```

### Node.js (Tüm Platformlar)

```bash
npm run launch
# veya
node launcher.js
```

## Kontroller

Başlatıcı şunları kontrol eder:

### ✅ Node.js
- Node.js 18+ kurulu mu?
- Yoksa yükleme talimatları gösterilir

### ✅ npm Paketleri
- `node_modules` klasörü var mı?
- Yoksa otomatik olarak `npm install` çalıştırılır

### ✅ Python
- Python 3.8+ kurulu mu?
- Yoksa uyarı gösterilir (analiz özellikleri çalışmayabilir)

### ✅ Python Paketleri
- Gerekli Python paketleri (librosa, numpy, vb.) yüklü mü?
- Yoksa yükleme komutu gösterilir

### ✅ Ollama
- Ollama servisi çalışıyor mu? (localhost:11434)
- Yüklü modeller var mı?
- Yoksa uyarı gösterilir (prompt üretimi çalışmayabilir)

## Özellikler

- 🎯 **Otomatik Kontrol**: Tüm bağımlılıklar otomatik kontrol edilir
- 📦 **Otomatik Yükleme**: npm paketleri otomatik yüklenir
- ⚠️ **Uyarılar**: Eksik bağımlılıklar için açıklayıcı uyarılar
- 🚀 **Otomatik Başlatma**: Kontroller tamamlandıktan sonra uygulama başlatılır

## Sorun Giderme

### Node.js Bulunamadı
- Node.js 18+ yükleyin: https://nodejs.org/
- Kurulum sonrası terminali yeniden başlatın

### Python Bulunamadı
- Python 3.8+ yükleyin: https://www.python.org/downloads/
- PATH'e eklendiğinden emin olun

### Ollama Çalışmıyor
- Ollama'yı yükleyin: https://ollama.ai
- Ollama servisini başlatın
- Model yükleyin: `ollama pull gemma2:4b`

### npm Paketleri Yüklenemiyor
- İnternet bağlantınızı kontrol edin
- `npm cache clean --force` çalıştırın
- Manuel olarak `npm install` deneyin

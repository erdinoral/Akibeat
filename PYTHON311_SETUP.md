# Python 3.11 Kurulum Kılavuzu

BPMer uygulaması Python 3.11 kullanmanızı önerir. Python 3.11, TensorFlow desteği ve tüm paketlerin uyumluluğu için idealdir.

## Windows Kurulumu

### 1. Python 3.11 İndirme

1. Python 3.11.9 (veya son sürüm) indirin:
   - **Direkt Link**: https://www.python.org/downloads/release/python-3119/
   - **Ana Sayfa**: https://www.python.org/downloads/

2. İndirme seçenekleri:
   - **Windows installer (64-bit)**: Çoğu kullanıcı için önerilir
   - **Windows installer (32-bit)**: Eski sistemler için

### 2. Kurulum Adımları

1. İndirilen `.exe` dosyasını çalıştırın
2. **ÖNEMLİ**: Kurulum sırasında **"Add Python to PATH"** seçeneğini mutlaka işaretleyin
3. "Install Now" veya "Customize installation" seçin
4. Kurulum tamamlanana kadar bekleyin

### 3. Kurulum Doğrulama

Kurulumdan sonra:

1. **Terminali kapatıp yeniden açın** (PATH güncellemesi için gerekli)
2. Yeni terminalde şu komutu çalıştırın:
   ```bash
   python --version
   ```
3. Şunu görmelisiniz: `Python 3.11.x`

### 4. Paket Yükleme

Python 3.11 kurulduktan sonra, BPMer launcher'ı otomatik olarak tüm gerekli paketleri yükleyecektir:

```bash
npm run launch
```

Veya manuel olarak:

```bash
python -m pip install -r backend/requirements.txt
```

## macOS Kurulumu

### Homebrew ile (Önerilen)

```bash
brew install python@3.11
```

### Manuel Kurulum

1. https://www.python.org/downloads/release/python-3119/ adresinden macOS installer'ı indirin
2. `.pkg` dosyasını çalıştırın ve kurulum sihirbazını takip edin

## Linux Kurulumu

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-pip
```

### Fedora

```bash
sudo dnf install python3.11 python3.11-pip
```

### Arch Linux

```bash
sudo pacman -S python311
```

## Sorun Giderme

### Python 3.11 Bulunamıyor

**Sorun**: Launcher Python 3.11'i bulamıyor

**Çözüm**:
1. Python'un PATH'e eklendiğinden emin olun
2. Terminali yeniden başlatın
3. `python --version` komutu ile doğrulayın
4. Windows'ta: `C:\Users\<KullanıcıAdı>\AppData\Local\Programs\Python\Python311\python.exe` yolunu kontrol edin

### Eski Python Sürümü Kullanılıyor

**Sorun**: Sistem hala eski Python sürümünü kullanıyor

**Çözüm**:
1. PATH değişkenini kontrol edin (Python 3.11 öncelikli olmalı)
2. Windows'ta: Sistem Ayarları > Ortam Değişkenleri > PATH
3. Python 3.11 yolunu en üste taşıyın

### Paket Yükleme Hataları

**Sorun**: Paketler yüklenemiyor

**Çözüm**:
1. pip'i güncelleyin: `python -m pip install --upgrade pip`
2. Python 3.11'in doğru kullanıldığından emin olun: `python -m pip --version`
3. Virtual environment kullanın (önerilir):
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

## Python 3.11 Avantajları

- ✅ **TensorFlow Desteği**: Python 3.11 TensorFlow'un tam desteklediği son sürümdür
- ✅ **Hız**: Python 3.11, önceki sürümlerden %10-60 daha hızlıdır
- ✅ **Paket Uyumluluğu**: Tüm paketler (Whisper, Demucs, TensorFlow) Python 3.11 ile uyumludur
- ✅ **Hata Düzeltmeleri**: Daha az bug ve daha iyi hata mesajları

## Notlar

- Python 3.12+ TensorFlow'u desteklemez (CNN modeli kullanılamaz)
- Python 3.11, TensorFlow ve tüm paketler için en uyumlu sürümdür
- Launcher otomatik olarak Python 3.11'i öncelikli olarak arar

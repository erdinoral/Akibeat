# 🎵 Akibeat: Profesyonel Müzik Analiz ve Mastering Asistanı

Akibeat, Akiyom markası altında geliştirilen, müzisyenlerin ve prodüktörlerin parçalarını teknik ve sanatsal açıdan derinlemesine incelemesini sağlayan gelişmiş bir analiz platformudur.

## ✨ Öne Çıkan Özellikler

### 🧠 Gelişmiş Tür Analizi
CNN modelleri ve sinyal işleme kütüphaneleri (Librosa) kullanarak parçanın türünü (Rock, Phonk, EDM vb.) yüksek doğrulukla tahmin eder.

### 🎚️ Mastering Assistant
Parçanın LUFS, True Peak ve Crest Factor değerlerini analiz ederek profesyonel standartlara (Spotify, Apple Music vb.) uygunluk raporu sunar.

### 📊 Spektral Görselleştirme
20 kanallı dinamik equalizer ve Spectral Centroid verileriyle sesin karakterini görselleştirir.

### 📧 Anonim Geri Bildirim
Geliştiriciye doğrudan mesaj göndermenizi sağlayan, e-posta gerektirmeyen entegre iletişim sistemi.

## 🛠️ Teknik Altyapı

- **Frontend:** React / Next.js
- **Backend:** Python (Librosa, NumPy, TensorFlow)
- **İletişim:** Formspree API Entegrasyonu

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Python 3.11+
- Electron 28+

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/erdinoral/bpmer.git
cd bpmer
```

2. **Node.js bağımlılıklarını yükleyin:**
```bash
npm install
```

3. **Python bağımlılıklarını yükleyin:**
```bash
pip install librosa numpy scipy tensorflow openai-whisper
```

4. **Ortam değişkenlerini ayarlayın:**
`.env` dosyası oluşturun:
```env
VITE_FORMSPREE_ENDPOINT_ID=xlgwpnlr
```

5. **Uygulamayı başlatın:**
```bash
npm run launch
```

## 📝 Kullanım

1. Ses dosyanızı (MP3, WAV, FLAC, M4A) sürükleyip bırakın veya dosya seçiciyi kullanın
2. "Analiz Et" butonuna tıklayın
3. Analiz sonuçlarını inceleyin:
   - BPM, Key, Energy, Loudness
   - Genre classification ve olasılıklar
   - Mastering önerileri
   - Spektral görselleştirme
4. İsteğe bağlı olarak prompt üretin

## 🔒 Gizlilik

Akibeat tamamen offline çalışır. Tüm analiz işlemleri yerel olarak gerçekleştirilir; hiçbir veri dışarıya gönderilmez.

## 📄 Lisans

MIT License

## 👨‍💻 Geliştirici

Akiyom - Akibeat

---

© 2026 Akiyom - Akibeat. Tüm hakları saklıdır.

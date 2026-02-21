import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function LegalModal({ type, onClose }) {
  const content = {
    privacy: {
      title: '🔒 Gizlilik Politikası',
      sections: [
        {
          heading: '1. Veri Toplanması ve İşlenmesi',
          items: [
            {
              subheading: 'Ses Dosyaları:',
              text: 'Uygulamaya yüklediğiniz ses dosyaları hiçbir şekilde uzak bir sunucuya (cloud) gönderilmez. Tüm analiz işlemleri (BPM, Key, Mastering vb.) tamamen cihazınızın işlemcisi ve belleği kullanılarak yerel olarak gerçekleştirilir.'
            },
            {
              subheading: 'Kişisel Veriler:',
              text: 'Akibeat; isminiz, e-posta adresiniz veya konumunuz gibi kişisel verileri talep etmez, toplamaz ve saklamaz.'
            },
            {
              subheading: 'Analiz Sonuçları:',
              text: 'Üretilen promptlar ve mastering raporları tamamen sizin cihazınızda oluşturulur. Uygulama kapatıldığında, kaydedilmemiş veriler geçici bellekten (RAM) silinir.'
            }
          ]
        },
        {
          heading: '2. Üçüncü Taraf Erişimi',
          items: [
            {
              subheading: 'API ve Bulut Servisleri:',
              text: 'Uygulamamız hiçbir harici yapay zeka API\'si veya bulut tabanlı analiz servisi kullanmamaktadır. Bu sayede verileriniz üçüncü taraflarla asla paylaşılmaz.'
            },
            {
              subheading: 'Microsoft Store:',
              text: 'Uygulama içi satın alımlar ve indirme istatistikleri Microsoft Store altyapısı üzerinden yönetilir. Bu süreçte sağlanan ödeme bilgileri Microsoft\'un kendi gizlilik politikasına tabidir; Akibeat bu bilgilere erişemez.'
            }
          ]
        },
        {
          heading: '3. Veri Güvenliği',
          items: [
            {
              text: 'Analiz edilen dosyaların güvenliği, kullanıcının kendi cihaz güvenliği ile sınırlıdır. Uygulama, dosyalarınızın üzerine yazmaz veya orijinal dosyalarınızı değiştirmez.'
            }
          ]
        }
      ]
    },
    terms: {
      title: '⚖️ Kullanım Şartları ve Sorumluluk Reddi',
      sections: [
        {
          heading: '1. Kullanım Şartları',
          items: [
            {
              text: 'Akibeat tarafından sunulan analizler ve "Smart Tips" (Akıllı Tavsiyeler), dijital sinyal işleme (DSP) algoritmalarına dayanan teknik önerilerdir. Bu öneriler sanatsal bir rehberlik amacı taşır.'
            }
          ]
        },
        {
          heading: '2. Sorumluluk Reddi (Disclaimer)',
          items: [
            {
              subheading: 'Deneysel Özellikler:',
              text: '"Prompt Üretimi" modülü deneysel bir algoritmadır. Üretilen metinlerin (prompt) nihai doğruluğu veya kullanılabilirliği garanti edilmez. En iyi sonuç için kullanıcının metin üzerinde düzenleme yapması önerilir.'
            },
            {
              subheading: 'Mastering Kararları:',
              text: 'Uygulama tarafından verilen mastering tavsiyeleri bir "asistan" niteliğindedir. Nihai ses kalitesi ve prodüksiyon kararlarından tamamen kullanıcı sorumludur.'
            },
            {
              subheading: 'Donanım Hasarı:',
              text: 'Uygulama standart ses işleme kütüphanelerini kullanır; ancak yanlış kullanım veya aşırı ses seviyelerinden kaynaklanabilecek donanım (hoparlör, kulaklık vb.) hasarlarından Akibeat sorumlu tutulamaz.'
            }
          ]
        },
        {
          heading: '3. Fikri Mülkiyet',
          items: [
            {
              text: 'Uygulama üzerinden analiz edilen ses dosyalarının tüm mülkiyet hakları kullanıcıya aittir. Akibeat, analiz edilen içerikler üzerinde hiçbir hak iddia etmez.'
            }
          ]
        }
      ]
    },
    about: {
      title: '📧 İletişim & Hakkında',
      sections: [
        {
          heading: 'Akibeat Hakkında',
          items: [
            {
              text: 'Akibeat, tamamen offline çalışan, yerel AI analiz teknolojisi kullanan bir müzik analiz ve mastering asistanı uygulamasıdır. Tüm analiz işlemleri cihazınızda gerçekleştirilir; hiçbir veri dışarıya gönderilmez.'
            }
          ]
        },
        {
          heading: 'Özellikler',
          items: [
            {
              text: '• BPM, Key, Energy, Loudness analizi'
            },
            {
              text: '• Genre classification (32+ tür desteği)'
            },
            {
              text: '• Mastering Assistant (LUFS, True Peak, Frequency Balance)'
            },
            {
              text: '• Dinamik Prompt Generator'
            },
            {
              text: '• Lyrics extraction (Whisper)'
            }
          ]
        },
        {
          heading: 'Teknoloji',
          items: [
            {
              text: '• Electron 28+'
            },
            {
              text: '• React 18+'
            },
            {
              text: '• Python 3.8+ (Librosa, NumPy, SciPy)'
            },
            {
              text: '• Tamamen offline çalışma'
            }
          ]
        },
        {
          heading: 'İletişim',
          items: [
            {
              text: '💬 Sorularınız, önerileriniz veya geri bildirimleriniz için sayfanın altındaki "Görüş ve Öneri" linkine tıklayarak doğrudan bize ulaşabilirsiniz. E-posta adresi girmenize gerek yok; mesajınız anında Akiyom geliştiricisine iletilecektir.'
            }
          ]
        }
      ]
    }
  };

  const currentContent = content[type];

  if (!currentContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0a0a0a] border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/20 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {currentContent.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-purple-500/20"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-6">
              {currentContent.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-3">
                  <h3 className="text-lg font-semibold text-purple-400">
                    {section.heading}
                  </h3>
                  <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-1">
                        {item.subheading && (
                          <h4 className="text-purple-300 font-medium">
                            {item.subheading}
                          </h4>
                        )}
                        <p className="text-gray-300">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-purple-500/20 flex justify-end">
            <motion.button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Kapat
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LegalModal;

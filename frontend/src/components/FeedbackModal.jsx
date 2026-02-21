import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FeedbackModal({ onClose }) {
  const [subject, setSubject] = useState('feature');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const subjectOptions = {
    'bug': 'Hata Bildirimi',
    'feature': 'Özellik Önerisi',
    'thanks': 'Teşekkür',
    'other': 'Diğer'
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('Lütfen bir mesaj girin.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Formspree endpoint from .env
      const formspreeId = import.meta.env.VITE_FORMSPREE_ENDPOINT_ID || 'xlgwpnlr';
      const endpoint = `https://formspree.io/f/${formspreeId}`;
      
      // Subject'i Türkçe'ye çevir
      const subjectText = subjectOptions[subject] || 'Geri Bildirim';
      
      // Payload oluştur
      const payload = {
        email: 'anonymous@akiyom.tech',  // Formspree için teknik alan
        _subject: 'Akibeat - Yeni Kullanıcı Geri Bildirimi',
        message: `Konu: ${subjectText}\n\nMesaj:\n${message}\n\n---\nAkibeat Geri Bildirim Formu\nTarih: ${new Date().toLocaleString('tr-TR')}`
      };

      // Formspree'ye gönder
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // 2 saniye sonra modal'ı kapat
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Gönderim başarısız oldu');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSubmitting(false);
    }
  };

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
          className="bg-[#0a0a0a] border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/20 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              💬 Görüş ve Önerileriniz
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
              {/* Açıklama */}
              <p className="text-gray-300 text-sm leading-relaxed">
                Akibeat'i geliştirmemize yardımcı olun! Karşılaştığınız hataları veya eklenmesini istediğiniz özellikleri bize bildirebilirsiniz.
              </p>

              {/* E-posta Notu */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-xs text-purple-300 leading-relaxed">
                  💡 E-posta girmenize gerek yok, mesajınız doğrudan Akiyom geliştiricisine iletilecektir.
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Konu Seçimi */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Konu Seçimi
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    disabled={isSubmitting || submitSuccess}
                  >
                    <option value="bug">Hata Bildirimi</option>
                    <option value="feature">Özellik Önerisi</option>
                    <option value="thanks">Teşekkür</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                {/* Mesaj Kutusu */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Lütfen görüş ve önerilerinizi detaylı bir şekilde yazın..."
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-purple-500/30 rounded-lg text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    rows={8}
                    disabled={isSubmitting || submitSuccess}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-purple-500/20 flex flex-col gap-3">
            {/* Başarı Mesajı */}
            {submitSuccess && (
              <motion.div
                className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-green-400 font-semibold text-sm">
                  ✅ Başarıyla iletildi!
                </p>
              </motion.div>
            )}

            {/* Butonlar */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting || submitSuccess}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: (isSubmitting || submitSuccess) ? 1 : 1.02 }}
                whileTap={{ scale: (isSubmitting || submitSuccess) ? 1 : 0.98 }}
              >
                {isSubmitting ? 'Gönderiliyor...' : submitSuccess ? 'Gönderildi!' : '📧 Gönder'}
              </motion.button>
              
              <motion.a
                href="https://github.com/erdinoral/bpmer/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#1a1a1a] border border-purple-500/30 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🐙</span>
                <span>GitHub Issues</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FeedbackModal;

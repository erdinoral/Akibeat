import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LegalModal from './LegalModal';
import FeedbackModal from './FeedbackModal';
import SupportSection from './SupportSection';

function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const openModal = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const openFeedback = () => {
    setShowFeedback(true);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
  };

  const openSupport = () => {
    setShowSupport(true);
  };

  const closeSupport = () => {
    setShowSupport(false);
  };

  return (
    <>
      <footer className="w-full mt-12 py-6 border-t border-purple-500/10">
        <div className="flex items-center justify-center gap-6 text-[0.75rem] text-gray-500">
          <button
            onClick={() => openModal('privacy')}
            className="hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Gizlilik Politikası
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => openModal('terms')}
            className="hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Kullanım Şartları
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => openModal('about')}
            className="hover:text-white transition-colors duration-200 cursor-pointer"
          >
            İletişim & Hakkında
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={openFeedback}
            className="hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Görüş ve Öneri
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={openSupport}
            className="hover:text-white transition-colors duration-200 cursor-pointer"
          >
            💜 Destek
          </button>
        </div>
        <div className="text-center mt-4 text-[0.7rem] text-gray-600">
          © 2026 Akiyom - Akibeat
        </div>
      </footer>

      {/* Legal Modals */}
      {activeModal && (
        <LegalModal type={activeModal} onClose={closeModal} />
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal onClose={closeFeedback} />
      )}

      {/* Support Section Modal */}
      {showSupport && (
        <SupportSection onClose={closeSupport} />
      )}
    </>
  );
}

export default Footer;

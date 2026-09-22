import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';

interface AiFabButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AiFabButton: React.FC<AiFabButtonProps> = ({ onClick, isOpen }) => {
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    // Auto-hide speech bubble after 8 seconds, but keep character avatar
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  if (isOpen) return null;

  return (
    <div className="ai-character-container">
      {showBubble && (
        <div className="ai-character-bubble">
          <span>¡Hola! Soy Nova Bot 🤖</span>
          <br />
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>¿Tienes dudas del negocio?</span>
          <button
            className="ai-bubble-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(false);
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <button className="ai-character-fab" onClick={onClick} title="Hablar con Nova Bot (Asistente)">
        <div className="character-avatar-inner">
          <Bot size={28} className="character-icon" />
          <div className="character-status-online" />
        </div>
        <div className="character-badge-sparkle">
          <Sparkles size={12} />
        </div>
      </button>
    </div>
  );
};

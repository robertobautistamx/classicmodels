import React from 'react';
import { Bot } from 'lucide-react';

interface AiFabButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AiFabButton: React.FC<AiFabButtonProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button className="ai-fab" onClick={onClick} title="Abrir Asistente Conversacional de IA">
      <Bot size={26} />
    </button>
  );
};

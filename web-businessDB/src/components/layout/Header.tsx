import React from 'react';
import { Sparkles, Database } from 'lucide-react';

interface HeaderProps {
  title: string;
  onOpenAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenAi }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        <button
          onClick={onOpenAi}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--accent-light)',
            color: '#818cf8',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.85rem',
            transition: 'var(--transition)',
          }}
        >
          <Sparkles size={16} />
          <span>Asistente IA</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
          }}
        >
          <Database size={14} />
          <span>classicmodels</span>
        </div>
      </div>
    </header>
  );
};

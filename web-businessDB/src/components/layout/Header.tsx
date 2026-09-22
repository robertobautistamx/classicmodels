import React from 'react';
import { Sparkles, Database, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  title: string;
  onOpenAi: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenAi,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        {/* LIGHT / DARK MODE TOGGLE */}
        <button
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        >
          {theme === 'dark' ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: '#6366f1' }} />}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>

        <button
          onClick={onOpenAi}
          className="header-ai-btn"
          title="Abrir Nova Bot Asistente"
        >
          <Sparkles size={15} />
          <span>Nova Bot 🤖</span>
        </button>

        <div className="db-badge">
          <Database size={13} />
          <span>classicmodels</span>
        </div>
      </div>
    </header>
  );
};

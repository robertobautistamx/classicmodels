import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ShieldCheck } from 'lucide-react';
import type { AiChatMessage } from '../../types';
import { processAiQuery } from '../../api/aiEngine';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Hola. Soy tu Asistente de IA para la base de datos classicmodels. Puedo responder preguntas sobre tus ventas, clientes, pedidos e inventario. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    '¿Cuáles productos tienen bajo stock?',
    'Muestrame las ventas e ingresos',
    'Top clientes por limite de credito',
    'Distribución de pedidos por estado',
    'Resumen de empleados por oficina',
  ];

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await processAiQuery(textToSend);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Ocurrió un error al procesar la consulta. Intenta nuevamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ai-drawer-overlay" onClick={onClose} />
      <div className="ai-drawer">
        <div className="ai-drawer-header">
          <div className="ai-header-title">
            <Bot size={20} style={{ color: '#818cf8' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Asistente Conversacional IA</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Modulo Seguro READ-ONLY
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ai-chat-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
              <div>{msg.text}</div>

              {msg.sender === 'assistant' && msg.source && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem' }}>
                  {msg.source === 'ollama' ? (
                    <span style={{ color: '#a5b4fc', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                      ✨ Modelo: Gemma 3 (Ollama Local)
                    </span>
                  ) : (
                    <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                      ⚡ Respuesta offline (Ollama no conectado)
                    </span>
                  )}
                </div>
              )}

              {/* Data Table Rendering */}
              {msg.dataType === 'table' && msg.data && msg.data.length > 0 && (
                <div
                  style={{
                    marginTop: '10px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.78rem',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textIndent: '0' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', color: 'var(--text-secondary)' }}>
                        {Object.keys(msg.data[0]).map((key) => (
                          <th key={key} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.data.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderTop: '1px solid var(--border-color)' }}>
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} style={{ padding: '6px 8px' }}>
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Micro Chart Rendering */}
              {msg.dataType === 'chart' && msg.data && msg.data.length > 0 && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {msg.chartTitle && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                      {msg.chartTitle}
                    </div>
                  )}
                  <div style={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={msg.data}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                        />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="chat-time">{msg.timestamp}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble assistant" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Consultando la base de datos...
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Sugerencias rápidas:</div>
          <div className="suggestion-chips">
            {suggestions.map((s, idx) => (
              <span key={idx} className="chip" onClick={() => handleSend(s)}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="ai-chat-input-area">
          <input
            type="text"
            className="ai-input"
            placeholder="Pregunta sobre clientes, pedidos, ventas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="btn-send" onClick={() => handleSend()} disabled={loading}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

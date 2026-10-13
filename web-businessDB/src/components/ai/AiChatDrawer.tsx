import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ShieldCheck, Sparkles, MessageSquare, Download, Layers, Plus, Minus } from 'lucide-react';
import type { AiChatMessage } from '../../types';
import { processAiQuery } from '../../api/aiEngine';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const downloadJSON = (data: any, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

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
      text: '¡Hola! Soy Nova Bot 🤖, tu asistente inteligente para Nova Store. Puedo consultar en tiempo real tus ventas, clientes, pedidos e inventario. Ahora puedes elegir cuántas iteraciones analíticas deseas generar por cada pregunta. ¿Qué te gustaría saber hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [iterationsCount, setIterationsCount] = useState<number>(1);
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    '¿Cuáles productos tienen bajo stock?',
    'Muestra las ventas e ingresos',
    'Top clientes por límite de crédito',
    'Distribución de pedidos por estado',
    'Resumen de empleados por oficina',
  ];

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const currentIterationsSetting = iterationsCount;

    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
      iterationsCount: currentIterationsSetting,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await processAiQuery(textToSend, currentIterationsSetting);
      setMessages((prev) => [...prev, response]);
      if (response.iterations && response.iterations.length > 0) {
        setActiveTabs((prev) => ({ ...prev, [response.id]: 0 }));
      }
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
            <div className="drawer-avatar-icon">
              <Bot size={22} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Nova Bot 🤖
                <span className="character-online-badge">EN LÍNEA</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ShieldCheck size={12} /> Lectura Segura de BD (classicmodels)
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} title="Cerrar chat">
            <X size={18} />
          </button>
        </div>

        <div className="ai-chat-body">
          {messages.map((msg) => {
            const hasIterations = Boolean(msg.iterations && msg.iterations.length > 1);
            const activeIdx = activeTabs[msg.id] ?? 0;
            const currentIteration = (msg.iterations && msg.iterations[activeIdx]) || null;

            const textToDisplay = currentIteration ? currentIteration.text : msg.text;
            const dataToDisplay = currentIteration ? currentIteration.data : msg.data;
            const dataTypeToDisplay = currentIteration ? currentIteration.dataType : msg.dataType;
            const chartTitleToDisplay = currentIteration ? currentIteration.chartTitle : msg.chartTitle;
            const sourceToDisplay = currentIteration ? currentIteration.source : msg.source;

            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <div className="chat-avatar-mini">
                    <Bot size={14} style={{ color: '#818cf8' }} />
                  </div>
                )}
                <div className={`chat-bubble ${msg.sender}`}>
                  {/* User iteration badge */}
                  {msg.sender === 'user' && msg.iterationsCount && msg.iterationsCount > 1 && (
                    <div className="user-iteration-badge">
                      <Layers size={11} /> {msg.iterationsCount} iteraciones solicitadas
                    </div>
                  )}

                  {/* Assistant iteration tabs switcher */}
                  {msg.sender === 'assistant' && hasIterations && msg.iterations && (
                    <div className="iteration-tabs-bar">
                      <div className="iteration-tabs-header">
                        <div className="iteration-tabs-title">
                          <Layers size={12} style={{ color: '#818cf8' }} />
                          <span>{msg.iterations.length} iteraciones analíticas:</span>
                        </div>
                        <span className="iteration-active-indicator">
                          Enfoque {activeIdx + 1} de {msg.iterations.length}
                        </span>
                      </div>
                      <div className="iteration-tabs-scroll">
                        {msg.iterations.map((iter, idx) => {
                          const isSelected = activeIdx === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`iteration-tab-pill ${isSelected ? 'active' : ''}`}
                              onClick={() => setActiveTabs((prev) => ({ ...prev, [msg.id]: idx }))}
                              title={`Ver ${iter.title}`}
                            >
                              <span className="tab-pill-badge">{idx + 1}</span>
                              <span className="tab-pill-text">{iter.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Main Response Text */}
                  <div className="chat-bubble-content">{textToDisplay}</div>

                  {/* Model source badge */}
                  {msg.sender === 'assistant' && sourceToDisplay && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem' }}>
                      {sourceToDisplay === 'ollama' ? (
                        <span style={{ color: '#a5b4fc', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                          <Sparkles size={10} /> Modelo: Gemma 3 (Ollama Local)
                        </span>
                      ) : (
                        <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                          ⚡ Motor BD Nova
                        </span>
                      )}
                      {hasIterations && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', opacity: 0.85 }}>
                          • Iteración {activeIdx + 1}/{msg.iterations?.length}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Data Table Rendering */}
                  {dataTypeToDisplay === 'table' && dataToDisplay && dataToDisplay.length > 0 && (
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
                          <tr style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                            {Object.keys(dataToDisplay[0]).map((key) => (
                              <th key={key} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataToDisplay.map((row: any, rIdx: number) => (
                            <tr key={rIdx} style={{ borderTop: '1px solid var(--border-color)' }}>
                              {Object.values(row).map((val: any, cIdx: number) => (
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
                  {dataTypeToDisplay === 'chart' && dataToDisplay && dataToDisplay.length > 0 && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {chartTitleToDisplay && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                          {chartTitleToDisplay}
                        </div>
                      )}
                      <div style={{ width: '100%', height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dataToDisplay}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-primary)' }}
                            />
                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Bottom info & Download */}
                  <div style={{ display: 'flex', justifyContent: msg.sender === 'assistant' ? 'space-between' : 'flex-end', alignItems: 'center', marginTop: '10px', gap: '8px' }}>
                    {msg.sender === 'assistant' && (
                      <button
                        className="btn-chat-download"
                        onClick={() => {
                          const active = (msg.iterations && msg.iterations[activeIdx]) || msg;
                          downloadJSON(
                            {
                              id: msg.id,
                              timestamp: msg.timestamp,
                              sender: msg.sender,
                              activeIteration: active.title || `Iteración ${activeIdx + 1}`,
                              activeIterationIndex: activeIdx + 1,
                              totalIterations: msg.iterations?.length || 1,
                              text: textToDisplay,
                              source: sourceToDisplay || 'sistema',
                              dataType: dataTypeToDisplay || 'texto',
                              data: dataToDisplay || null,
                              chartTitle: chartTitleToDisplay || null,
                              allIterations: msg.iterations || null,
                            },
                            `nova_bot_respuesta_${msg.id}_it${activeIdx + 1}.json`
                          );
                        }}
                        title={`Descargar esta iteración (#${activeIdx + 1}) en JSON`}
                      >
                        <Download size={11} /> JSON {hasIterations ? `(It. ${activeIdx + 1})` : ''}
                      </button>
                    )}
                    <div className="chat-time" style={{ marginTop: 0 }}>{msg.timestamp}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-bubble-wrapper assistant">
              <div className="chat-avatar-mini">
                <Bot size={14} style={{ color: '#818cf8' }} />
              </div>
              <div className="chat-bubble assistant" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ai-pulse-dot" />
                  <span>
                    {iterationsCount > 1
                      ? `Generando ${iterationsCount} iteraciones y perspectivas sobre classicmodels...`
                      : 'Consultando la base de datos classicmodels...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* SUGGESTION CHIPS CONTAINER */}
        <div className="suggestion-section">
          <div className="suggestion-label">
            <MessageSquare size={12} /> Preguntas sugeridas:
          </div>
          <div className="suggestion-chips">
            {suggestions.map((s, idx) => (
              <button key={idx} className="chip-btn" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ITERATIONS CONTROLLER BAR */}
        <div className="iterations-controller-bar">
          <div className="iterations-title">
            <Layers size={13} style={{ color: '#818cf8' }} />
            <span>Iteraciones:</span>
            <span className="iterations-hint">
              {iterationsCount === 1 ? '1 enfoque' : `${iterationsCount} enfoques en pestañas`}
            </span>
          </div>
          <div className="iterations-actions">
            <div className="iterations-stepper">
              <button
                type="button"
                className="btn-stepper"
                onClick={() => setIterationsCount((prev) => Math.max(1, prev - 1))}
                disabled={iterationsCount <= 1 || loading}
                title="Disminuir iteraciones"
              >
                <Minus size={12} />
              </button>
              <span className="stepper-value">{iterationsCount}</span>
              <button
                type="button"
                className="btn-stepper"
                onClick={() => setIterationsCount((prev) => Math.min(5, prev + 1))}
                disabled={iterationsCount >= 5 || loading}
                title="Aumentar iteraciones"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="iterations-quick-pills">
              {[1, 2, 3, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  className={`btn-pill-iter ${iterationsCount === cnt ? 'active' : ''}`}
                  onClick={() => setIterationsCount(cnt)}
                  disabled={loading}
                  title={`Seleccionar ${cnt} ${cnt === 1 ? 'iteración' : 'iteraciones'}`}
                >
                  {cnt}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="ai-chat-input-area">
          <input
            type="text"
            className="ai-input"
            placeholder={`Pregunta sobre el negocio (${iterationsCount} ${iterationsCount === 1 ? 'iteración' : 'iteraciones'})...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="btn-send" onClick={() => handleSend()} disabled={loading} title="Enviar pregunta">
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

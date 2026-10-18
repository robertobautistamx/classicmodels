import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Database,
  Sparkles,
  Layers,
  BarChart3,
  ListOrdered,
  FileCode,
  Info,
} from 'lucide-react';
import {
  aiLogger,
  run10RunsBenchmark,
  type AiAttemptLog,
  type BenchmarkReport,
} from '../../services/aiLogger';
import { processAiQuery } from '../../api/aiEngine';

interface AiLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiLogsModal: React.FC<AiLogsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'benchmark'>('logs');
  const [logs, setLogs] = useState<AiAttemptLog[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState<{ current: number; total: number; caseName: string } | null>(null);
  const [expandedIterations, setExpandedIterations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      const storedLogs = aiLogger.getLogs();
      setLogs(storedLogs);
      if (storedLogs.length > 0) {
        setSelectedAttemptId(storedLogs[storedLogs.length - 1].id);
      }
      setBenchmarkReport(aiLogger.getSavedBenchmarkReport());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedAttempt = logs.find((l) => l.id === selectedAttemptId) || (logs.length > 0 ? logs[logs.length - 1] : null);

  const handleClearLogs = () => {
    if (confirm('¿Deseas vaciar todos los logs de intentos almacenados?')) {
      aiLogger.clearLogs();
      setLogs([]);
      setSelectedAttemptId(null);
    }
  };

  const handleRunBenchmark = async () => {
    setIsRunningBenchmark(true);
    setBenchmarkProgress({ current: 0, total: 10, caseName: 'Iniciando benchmark...' });

    try {
      const report = await run10RunsBenchmark(
        (prompt, iters) => processAiQuery(prompt, iters),
        (current, total, caseName) => {
          setBenchmarkProgress({ current, total, caseName });
        }
      );
      setBenchmarkReport(report);
      setLogs(aiLogger.getLogs()); // Refresh logs with the new 10 attempts
    } catch (e) {
      console.error('Error al ejecutar benchmark:', e);
    } finally {
      setIsRunningBenchmark(false);
      setBenchmarkProgress(null);
    }
  };

  const toggleIterationExpand = (idx: number) => {
    setExpandedIterations((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="ai-logs-modal-overlay">
      <div className="ai-logs-modal-container">
        {/* MODAL HEADER */}
        <div className="ai-logs-modal-header">
          <div className="ai-logs-modal-title">
            <div className="logs-badge-icon">🫙</div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Auditoría & Observabilidad de la IA
                <span className="logs-count-chip">{logs.length} intentos guardados</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Trazabilidad del pipeline, inspección de iteraciones de Gemma 3 y benchmark de 10 tiradas
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} title="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* TAB CONTROLS */}
        <div className="ai-logs-tabs-bar">
          <button
            type="button"
            className={`ai-logs-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <ListOrdered size={15} />
            <span>Visor de Intentos & Pipeline ({logs.length})</span>
          </button>
          <button
            type="button"
            className={`ai-logs-tab ${activeTab === 'benchmark' ? 'active' : ''}`}
            onClick={() => setActiveTab('benchmark')}
          >
            <BarChart3 size={15} />
            <span>Benchmark de 10 Tiradas (Promedios)</span>
          </button>
        </div>

        {/* TAB CONTENT: LOGS */}
        {activeTab === 'logs' && (
          <div className="ai-logs-tab-content">
            {logs.length === 0 ? (
              <div className="ai-logs-empty">
                <Info size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600 }}>No hay logs almacenados aún</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Haz una pregunta en el Chat o ejecuta el Benchmark de 10 Tiradas para registrar el ciclo de vida completo.
                </div>
              </div>
            ) : (
              <div className="ai-logs-layout">
                {/* SIDEBAR: LIST OF ATTEMPTS */}
                <div className="ai-logs-sidebar">
                  <div className="ai-logs-sidebar-header">
                    <span>Historial de Intentos</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn-icon-subtle"
                        onClick={() => aiLogger.downloadLogsJSON()}
                        title="Descargar todos los logs en JSON"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className="btn-icon-subtle danger"
                        onClick={handleClearLogs}
                        title="Vaciar logs"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="ai-logs-list">
                    {logs.map((att, idx) => {
                      const isSelected = selectedAttempt?.id === att.id;
                      return (
                        <div
                          key={att.id}
                          className={`ai-log-item ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedAttemptId(att.id)}
                        >
                          <div className="ai-log-item-top">
                            <span className="ai-log-item-num">#{logs.length - idx}</span>
                            <span className="ai-log-item-time">{new Date(att.timestamp).toLocaleTimeString()}</span>
                            <span className={`ai-log-status-pill ${att.status}`}>{att.status}</span>
                          </div>
                          <div className="ai-log-item-prompt" title={att.userPrompt}>
                            "{att.userPrompt}"
                          </div>
                          <div className="ai-log-item-meta">
                            <span><Clock size={11} /> {att.totalDurationMs} ms</span>
                            <span><Layers size={11} /> {att.requestedIterations} iters</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MAIN: ATTEMPT DETAILS */}
                {selectedAttempt && (
                  <div className="ai-logs-detail-view">
                    {/* ATTEMPT SUMMARY HEADER */}
                    <div className="ai-detail-card-header">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ID: <code style={{ color: '#818cf8' }}>{selectedAttempt.id}</code> • {new Date(selectedAttempt.timestamp).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px' }}>
                            "{selectedAttempt.userPrompt}"
                          </div>
                        </div>
                        <div className="ai-stat-badge">
                          <Clock size={13} /> {selectedAttempt.totalDurationMs} ms total
                        </div>
                      </div>
                    </div>

                    {/* PIPELINE TRACE */}
                    <div className="ai-detail-section">
                      <div className="ai-section-title">
                        <Database size={15} style={{ color: '#818cf8' }} />
                        <span>Trazabilidad del Proceso (Pipeline Steps)</span>
                      </div>
                      <div className="pipeline-steps-timeline">
                        {selectedAttempt.steps.map((step) => (
                          <div key={step.stepNumber} className={`pipeline-step-item status-${step.status}`}>
                            <div className="step-marker">
                              {step.status === 'success' && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                              {step.status === 'warning' && <AlertTriangle size={13} style={{ color: '#f59e0b' }} />}
                              {step.status === 'info' && <Cpu size={13} style={{ color: '#818cf8' }} />}
                              {step.status === 'error' && <X size={13} style={{ color: '#ef4444' }} />}
                            </div>
                            <div className="step-content">
                              <div className="step-header">
                                <span className="step-name">
                                  Paso {step.stepNumber}: {step.name}
                                </span>
                                <span className="step-time">{step.timestamp}</span>
                              </div>
                              <div className="step-details-box">
                                {typeof step.details === 'string' ? (
                                  step.details
                                ) : (
                                  <pre>{JSON.stringify(step.details, null, 2)}</pre>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ITERATIONS OBSERVATION */}
                    <div className="ai-detail-section">
                      <div className="ai-section-title">
                        <Layers size={15} style={{ color: '#818cf8' }} />
                        <span>Observación en cada Iteración dentro del Modelo ({selectedAttempt.iterations.length})</span>
                      </div>
                      <div className="iterations-inspection-list">
                        {selectedAttempt.iterations.map((iter) => {
                          const isExpanded = expandedIterations[iter.iterationNumber] ?? false;
                          const t = iter.telemetry;
                          return (
                            <div key={iter.iterationNumber} className="iteration-inspect-card">
                              <div
                                className="iteration-inspect-head"
                                onClick={() => toggleIterationExpand(iter.iterationNumber)}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="iter-num-badge">#{iter.iterationNumber}</span>
                                  <span style={{ fontWeight: 600 }}>{iter.title}</span>
                                  <span className={`source-pill ${iter.source}`}>{iter.source.toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <Clock size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {iter.latencyMs} ms
                                  </span>
                                  <button type="button" className="btn-expand-icon">
                                    {isExpanded ? '−' : '+'}
                                  </button>
                                </div>
                              </div>

                              <div className="iteration-inspect-body">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                  <strong>Enfoque analítico:</strong> {iter.focus}
                                </div>

                                {/* TELEMETRY METRICS GRID */}
                                {t && (
                                  <div className="telemetry-metrics-grid">
                                    <div className="metric-chip">
                                      <span className="metric-label">Modelo:</span>
                                      <span className="metric-val">{t.model}</span>
                                    </div>
                                    <div className="metric-chip">
                                      <span className="metric-label">Tokens Prompt:</span>
                                      <span className="metric-val">{t.promptEvalCount ?? 'N/D'}</span>
                                    </div>
                                    <div className="metric-chip">
                                      <span className="metric-label">Tokens Generados:</span>
                                      <span className="metric-val">{t.evalCount ?? 'N/D'}</span>
                                    </div>
                                    <div className="metric-chip">
                                      <span className="metric-label">Velocidad Inferencia:</span>
                                      <span className="metric-val">{t.tokensPerSecond ? `${t.tokensPerSecond} tok/s` : 'N/D'}</span>
                                    </div>
                                    <div className="metric-chip">
                                      <span className="metric-label">Carga en RAM:</span>
                                      <span className="metric-val">{t.loadDurationMs ? `${t.loadDurationMs} ms` : '0 ms'}</span>
                                    </div>
                                    <div className="metric-chip">
                                      <span className="metric-label">Endpoint:</span>
                                      <span className="metric-val">{t.endpointUsed || 'Local'}</span>
                                    </div>
                                  </div>
                                )}

                                {/* COLLAPSIBLE PROMPT / RESPONSE */}
                                {isExpanded && (
                                  <div className="iteration-code-previews">
                                    {iter.promptSent && (
                                      <div>
                                        <div className="preview-label">
                                          <FileCode size={12} /> Payload Completo Inyectado al Modelo:
                                        </div>
                                        <div className="code-view-box">{iter.promptSent}</div>
                                      </div>
                                    )}
                                    {iter.responsePreview && (
                                      <div style={{ marginTop: '8px' }}>
                                        <div className="preview-label">
                                          <Sparkles size={12} /> Respuesta de la Iteración:
                                        </div>
                                        <div className="code-view-box">{iter.responsePreview}</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: BENCHMARK */}
        {activeTab === 'benchmark' && (
          <div className="ai-logs-tab-content">
            <div className="benchmark-header-actions">
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Prueba de Rendimiento & Promedios (10 Tiradas Estandarizadas)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Evalúa las 10 necesidades de negocio principales en classicmodels para calcular métricas promedio de inferencia.
                </div>
              </div>
              <button
                type="button"
                className="btn-benchmark-run"
                onClick={handleRunBenchmark}
                disabled={isRunningBenchmark}
              >
                <Play size={15} />
                {isRunningBenchmark ? 'Ejecutando 10 Tiradas...' : 'Iniciar 10 Tiradas Ahora'}
              </button>
            </div>

            {/* PROGRESS BAR */}
            {isRunningBenchmark && benchmarkProgress && (
              <div className="benchmark-progress-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span>
                    Ejecutando Tirada #{benchmarkProgress.current} de {benchmarkProgress.total}: <strong>{benchmarkProgress.caseName}</strong>
                  </span>
                  <span>{Math.round((benchmarkProgress.current / benchmarkProgress.total) * 100)}%</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(benchmarkProgress.current / benchmarkProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* BENCHMARK RESULTS */}
            {benchmarkReport ? (
              <div className="benchmark-results-view">
                {/* STAT CARDS */}
                <div className="benchmark-stat-cards">
                  <div className="bench-card">
                    <div className="bench-card-label">Latencia Promedio</div>
                    <div className="bench-card-value">{benchmarkReport.averageLatencyMs} ms</div>
                    <div className="bench-card-hint">Tiempo total por tirada</div>
                  </div>
                  <div className="bench-card">
                    <div className="bench-card-label">Tokens Input Promedio</div>
                    <div className="bench-card-value">{benchmarkReport.averageTokensInput}</div>
                    <div className="bench-card-hint">Contexto BD inyectado</div>
                  </div>
                  <div className="bench-card">
                    <div className="bench-card-label">Tokens Output Promedio</div>
                    <div className="bench-card-value">{benchmarkReport.averageTokensOutput}</div>
                    <div className="bench-card-hint">Tokens generados por respuesta</div>
                  </div>
                  <div className="bench-card">
                    <div className="bench-card-label">Throughput Promedio</div>
                    <div className="bench-card-value">{benchmarkReport.averageTokensPerSecond} tok/s</div>
                    <div className="bench-card-hint">Velocidad de generación</div>
                  </div>
                  <div className="bench-card">
                    <div className="bench-card-label">Disponibilidad Ollama</div>
                    <div className="bench-card-value">{benchmarkReport.ollamaSuccessRatePercent}%</div>
                    <div className="bench-card-hint">Resto cubierto por Motor BD</div>
                  </div>
                </div>

                {/* RUNS TABLE */}
                <div className="benchmark-table-wrapper">
                  <table className="benchmark-table">
                    <thead>
                      <tr>
                        <th>Tirada</th>
                        <th>Área / Necesidad del Negocio</th>
                        <th>Prompt Evaluado</th>
                        <th>Latencia</th>
                        <th>Tokens In/Out</th>
                        <th>Velocidad</th>
                        <th>Fuente</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkReport.runs.map((run) => (
                        <tr key={run.runIndex}>
                          <td><strong>#{run.runIndex}</strong></td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{run.needCategory}</div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>"{run.prompt}"</td>
                          <td><code>{run.latencyMs} ms</code></td>
                          <td>{run.estimatedTokensInput} / {run.estimatedTokensOutput}</td>
                          <td>{run.tokensPerSecond} tok/s</td>
                          <td>
                            <span className={`source-pill ${run.source}`}>{run.source.toUpperCase()}</span>
                          </td>
                          <td>
                            <span style={{ color: run.success ? '#10b981' : '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
                              {run.statusDescription}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Reporte generado: {benchmarkReport.timestamp} • Duración total del benchmark: {benchmarkReport.totalDurationSeconds} s
                </div>
              </div>
            ) : (
              !isRunningBenchmark && (
                <div className="ai-logs-empty" style={{ margin: '40px 0' }}>
                  <BarChart3 size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <div style={{ fontWeight: 600 }}>No hay benchmark generado recientemente</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Presiona el botón superior "Iniciar 10 Tiradas Ahora" para realizar las 10 consultas secuenciales sobre ClassicModels y promediar los resultados.
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

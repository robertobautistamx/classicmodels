import type { AiChatMessage } from '../types';

export interface OllamaTelemetry {
  model: string;
  totalDurationMs?: number;
  loadDurationMs?: number;
  promptEvalCount?: number;
  promptEvalDurationMs?: number;
  evalCount?: number;
  evalDurationMs?: number;
  tokensPerSecond?: number;
  endpointUsed?: string;
  latencyMs: number;
}

export interface PipelineStepLog {
  stepNumber: number;
  name: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
  details: string | Record<string, any>;
}

export interface IterationTelemetryLog {
  iterationNumber: number;
  title: string;
  focus: string;
  source: 'ollama' | 'fallback';
  latencyMs: number;
  promptSent?: string;
  responsePreview?: string;
  telemetry?: OllamaTelemetry;
}

export interface AiAttemptLog {
  id: string;
  timestamp: string;
  userPrompt: string;
  requestedIterations: number;
  steps: PipelineStepLog[];
  iterations: IterationTelemetryLog[];
  totalDurationMs: number;
  status: 'completed' | 'error' | 'in_progress';
  finalResultSummary?: string;
}

export interface BenchmarkRun {
  runIndex: number;
  needCategory: string;
  prompt: string;
  iterationsRequested: number;
  latencyMs: number;
  source: 'ollama' | 'fallback';
  estimatedTokensInput: number;
  estimatedTokensOutput: number;
  tokensPerSecond: number;
  success: boolean;
  statusDescription: string;
}

export interface BenchmarkReport {
  timestamp: string;
  runsCount: number;
  averageLatencyMs: number;
  averageTokensInput: number;
  averageTokensOutput: number;
  averageTokensPerSecond: number;
  ollamaSuccessRatePercent: number;
  totalDurationSeconds: number;
  runs: BenchmarkRun[];
}

const STORAGE_KEY = 'nova_bot_ai_execution_logs_v1';
const BENCHMARK_STORAGE_KEY = 'nova_bot_benchmark_report_v1';

class AiLoggerService {
  private logs: AiAttemptLog[] = [];
  private currentAttempt: AiAttemptLog | null = null;
  private startTime: number = 0;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  private saveToStorage() {
    try {
      // Keep last 50 attempts to avoid quota limits
      const trimmed = this.logs.slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('No se pudo guardar logs en localStorage:', e);
    }
  }

  /**
   * Inicia el registro de un nuevo intento de consulta
   */
  startAttempt(userPrompt: string, requestedIterations: number): string {
    const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.startTime = performance.now();
    this.currentAttempt = {
      id,
      timestamp: new Date().toISOString(),
      userPrompt,
      requestedIterations,
      steps: [],
      iterations: [],
      totalDurationMs: 0,
      status: 'in_progress',
    };

    this.addStep('Recepción de Consulta', 'info', {
      prompt: userPrompt,
      iteracionesSolicitadas: requestedIterations,
    });

    return id;
  }

  /**
   * Añade un paso detallado en el ciclo del pipeline
   */
  addStep(name: string, status: 'info' | 'success' | 'warning' | 'error', details: string | Record<string, any>) {
    if (!this.currentAttempt) return;

    const step: PipelineStepLog = {
      stepNumber: this.currentAttempt.steps.length + 1,
      name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status,
      details,
    };

    this.currentAttempt.steps.push(step);
  }

  /**
   * Registra la telemetría y resultado de una iteración específica del modelo
   */
  recordIterationTelemetry(iterationLog: IterationTelemetryLog) {
    if (!this.currentAttempt) return;
    this.currentAttempt.iterations.push(iterationLog);
  }

  /**
   * Finaliza el intento actual y lo persiste
   */
  finishAttempt(status: 'completed' | 'error' = 'completed', summary?: string): AiAttemptLog | null {
    if (!this.currentAttempt) return null;

    this.currentAttempt.totalDurationMs = Math.round(performance.now() - this.startTime);
    this.currentAttempt.status = status;
    if (summary) {
      this.currentAttempt.finalResultSummary = summary;
    }

    this.addStep('Respuesta Renderizada en Chat', status === 'completed' ? 'success' : 'error', {
      duracionTotalMs: this.currentAttempt.totalDurationMs,
      iteracionesCompletadas: this.currentAttempt.iterations.length,
    });

    this.logs.push(this.currentAttempt);
    this.saveToStorage();

    const finished = this.currentAttempt;
    this.currentAttempt = null;
    return finished;
  }

  /**
   * Obtiene todos los logs almacenados
   */
  getLogs(): AiAttemptLog[] {
    return [...this.logs];
  }

  /**
   * Obtiene un intento específico por ID
   */
  getAttemptById(id: string): AiAttemptLog | undefined {
    return this.logs.find((l) => l.id === id);
  }

  /**
   * Limpia el almacén de logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Exporta todos los logs a un archivo JSON descargable
   */
  downloadLogsJSON(filename: string = 'nova_bot_execution_logs.json') {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Guarda y obtiene el último reporte de benchmark
   */
  saveBenchmarkReport(report: BenchmarkReport) {
    try {
      localStorage.setItem(BENCHMARK_STORAGE_KEY, JSON.stringify(report));
    } catch {}
  }

  getSavedBenchmarkReport(): BenchmarkReport | null {
    try {
      const saved = localStorage.getItem(BENCHMARK_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}

export const aiLogger = new AiLoggerService();

/**
 * 10 Casos de prueba representativos para medir necesidades del negocio en classicmodels
 */
export const BENCHMARK_TEST_CASES = [
  {
    category: 'Inventario & Almacén',
    need: 'Detección de stock crítico para compras',
    prompt: '¿Cuáles productos tienen bajo stock?',
  },
  {
    category: 'Finanzas & Facturación',
    need: 'Auditoría de volumen de ingresos globales',
    prompt: 'Muestra las ventas e ingresos',
  },
  {
    category: 'Comercial & Clientes',
    need: 'Identificación de cuentas VIP y riesgo crediticio',
    prompt: 'Top clientes por límite de crédito',
  },
  {
    category: 'Logística & Operaciones',
    need: 'Control de cuellos de botella en despachos',
    prompt: 'Distribución de pedidos por estado',
  },
  {
    category: 'Recursos Humanos',
    need: 'Cobertura de personal en sedes internacionales',
    prompt: 'Resumen de empleados por oficina',
  },
  {
    category: 'Operaciones Críticas',
    need: 'Detección de pedidos retrasados o cancelados',
    prompt: 'Muestra los pedidos en proceso y cancelados',
  },
  {
    category: 'Estrategia Comercial',
    need: 'Catálogo de alta gama con mayor MSRP',
    prompt: '¿Cuáles son los productos más caros del catálogo?',
  },
  {
    category: 'Expansión Global',
    need: 'Distribución geográfica de la cartera de clientes',
    prompt: 'Distribución de clientes por país',
  },
  {
    category: 'Tesorería & Cobranza',
    need: 'Monitoreo de flujo de caja reciente',
    prompt: 'Últimos pagos registrados en el sistema',
  },
  {
    category: 'Dirección General',
    need: 'Diagnóstico holístico del estado del negocio',
    prompt: 'Resumen general del estado del negocio',
  },
];

/**
 * Ejecutor del Benchmark de 10 tiradas con cálculo de promedios estadísticos
 */
export async function run10RunsBenchmark(
  processQueryFn: (prompt: string, iterations: number) => Promise<AiChatMessage>,
  onProgress?: (current: number, total: number, currentCase: string) => void
): Promise<BenchmarkReport> {
  const runs: BenchmarkRun[] = [];
  const startBenchmarkTime = performance.now();

  for (let i = 0; i < BENCHMARK_TEST_CASES.length; i++) {
    const testCase = BENCHMARK_TEST_CASES[i];
    onProgress?.(i + 1, BENCHMARK_TEST_CASES.length, testCase.need);

    const runStartTime = performance.now();
    let success = true;
    let source: 'ollama' | 'fallback' = 'fallback';
    let outputText = '';

    try {
      const response = await processQueryFn(testCase.prompt, 1);
      const activeIteration = response.iterations?.[0];
      outputText = activeIteration?.text || response.text || '';
      source = activeIteration?.source || response.source || 'fallback';
    } catch {
      success = false;
      outputText = 'Error en ejecución';
    }

    const latencyMs = Math.round(performance.now() - runStartTime);
    const estimatedTokensInput = Math.round((testCase.prompt.length + 300) / 4); // Estimación prompt + contexto
    const estimatedTokensOutput = Math.max(1, Math.round(outputText.length / 4));
    const tokensPerSecond = latencyMs > 0 ? Number(((estimatedTokensOutput / (latencyMs / 1000))).toFixed(1)) : 0;

    runs.push({
      runIndex: i + 1,
      needCategory: testCase.category,
      prompt: testCase.prompt,
      iterationsRequested: 1,
      latencyMs,
      source,
      estimatedTokensInput,
      estimatedTokensOutput,
      tokensPerSecond,
      success,
      statusDescription: success ? `Completado (${source.toUpperCase()})` : 'Fallido',
    });
  }

  const totalDurationSeconds = Number(((performance.now() - startBenchmarkTime) / 1000).toFixed(2));
  const avgLatency = Math.round(runs.reduce((acc, r) => acc + r.latencyMs, 0) / runs.length);
  const avgTokensIn = Math.round(runs.reduce((acc, r) => acc + r.estimatedTokensInput, 0) / runs.length);
  const avgTokensOut = Math.round(runs.reduce((acc, r) => acc + r.estimatedTokensOutput, 0) / runs.length);
  const avgTps = Number((runs.reduce((acc, r) => acc + r.tokensPerSecond, 0) / runs.length).toFixed(1));
  const ollamaRuns = runs.filter((r) => r.source === 'ollama').length;
  const ollamaRate = Math.round((ollamaRuns / runs.length) * 100);

  const report: BenchmarkReport = {
    timestamp: new Date().toLocaleString(),
    runsCount: runs.length,
    averageLatencyMs: avgLatency,
    averageTokensInput: avgTokensIn,
    averageTokensOutput: avgTokensOut,
    averageTokensPerSecond: avgTps,
    ollamaSuccessRatePercent: ollamaRate,
    totalDurationSeconds,
    runs,
  };

  aiLogger.saveBenchmarkReport(report);
  return report;
}

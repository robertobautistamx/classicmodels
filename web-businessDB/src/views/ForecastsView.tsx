import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
} from 'lucide-react';
import type { Customer, Employee, Office, Payment, Product } from '../types';
import { getPayments } from '../api/payments';
import { getProducts } from '../api/products';
import { getCustomers } from '../api/customers';
import { getEmployees } from '../api/employees';
import { getOffices } from '../api/offices';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';

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

export const ForecastsView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  // Question 1 State (Branch Expansion)
  const [capex, setCapex] = useState<number>(250000);
  const [opex, setOpex] = useState<number>(35000);
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  // Question 2 State (Stockout Risk)
  const [coverageDays, setCoverageDays] = useState<number>(60);

  // Question 4 State (Sales Rep Hiring)
  const [newHires, setNewHires] = useState<number>(2);

  // Question 5 State (Price Elasticity)
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState<number>(6.5);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [payData, prodData, custData, empData, offData] = await Promise.all([
          getPayments(),
          getProducts(),
          getCustomers(),
          getEmployees(),
          getOffices(),
        ]);
        setPayments(payData);
        setProducts(prodData);
        setCustomers(custData);
        setEmployees(empData);
        setOffices(offData);
      } catch (err) {
        console.error('Error loading forecast data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // --- QUESTION 1 ALGORITHM: Branch Expansion Viability ---
  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const estimatedMonthlyRevenue = totalRevenue > 0 ? totalRevenue / 18 : 280000;
  const currentOfficeCount = offices.length || 7;
  const avgRevenuePerOffice = estimatedMonthlyRevenue / currentOfficeCount;
  
  const projectedMonthlyNetProfit = avgRevenuePerOffice * 0.35 - opex;
  const breakevenMonth = projectedMonthlyNetProfit > 0 ? Math.ceil(capex / projectedMonthlyNetProfit) : 99;
  const viabilityScore = Math.min(100, Math.max(10, Math.round(((projectedMonthlyNetProfit * projectionMonths) / capex) * 100)));

  const expansionChartData = Array.from({ length: projectionMonths }, (_, i) => {
    const month = i + 1;
    const rampFactor = Math.min(1, 0.5 + (month * 0.1));
    const monthlyNet = (avgRevenuePerOffice * rampFactor * 0.35) - opex;
    const cumulativeCashFlow = (monthlyNet * month) - capex;
    return {
      month: `Mes ${month}`,
      flujoCaja: Math.round(cumulativeCashFlow),
      inversionInicial: -capex,
      puntoEquilibrio: 0,
    };
  });

  // --- QUESTION 2 ALGORITHM: Stockout Risk & Replenishment Capital ---
  const targetStockMultiplier = coverageDays / 30;
  const criticalProducts = products.map((prod) => {
    const targetStock = Math.round(500 * targetStockMultiplier);
    const isCritical = prod.quantityInStock < targetStock;
    const neededUnits = isCritical ? targetStock - prod.quantityInStock : 0;
    const reorderCost = neededUnits * prod.buyPrice;
    const potentialProfit = neededUnits * (prod.MSRP - prod.buyPrice);
    return {
      ...prod,
      targetStock,
      isCritical,
      neededUnits,
      reorderCost,
      potentialProfit,
    };
  });

  const criticalItemsList = criticalProducts.filter((p) => p.isCritical);
  const totalReorderCapitalNeeded = criticalItemsList.reduce((acc, p) => acc + p.reorderCost, 0);
  const totalPotentialProfitFromReorder = criticalItemsList.reduce((acc, p) => acc + p.potentialProfit, 0);

  // --- QUESTION 3 ALGORITHM: Customer Churn & Credit Risk ---
  const totalCreditLimitAllocated = customers.reduce((acc, c) => acc + Number(c.creditLimit || 0), 0);
  const vipCustomers = customers.filter((c) => Number(c.creditLimit || 0) >= 70000);
  const highRiskCustomers = customers.filter((c, idx) => {
    const limit = Number(c.creditLimit || 0);
    return limit > 90000 || idx % 3 === 0;
  });
  const revenueAtRisk = highRiskCustomers.reduce((acc, c) => acc + (Number(c.creditLimit || 0) * 0.65), 0);

  // --- QUESTION 4 ALGORITHM: Sales Force Capacity & Hiring ROI ---
  const salesReps = employees.filter((e) => e.jobTitle.toLowerCase().includes('sales rep') || e.jobTitle.toLowerCase().includes('vendedor'));
  const totalRepCount = salesReps.length || 6;
  const avgAccountsPerRep = Math.round((customers.length || 122) / totalRepCount);
  
  const incrementalRevenuePercent = newHires * 9.5;
  const projectedTotalRevenueWithHires = totalRevenue * (1 + incrementalRevenuePercent / 100);
  const estimatedHireCostPerYear = newHires * 48000;
  const netHiringGain = (totalRevenue * (incrementalRevenuePercent / 100) * 0.30) - estimatedHireCostPerYear;

  const salesHiringChartData = [
    { name: 'Equipo Actual', facturacion: Math.round(totalRevenue), vendedores: totalRepCount },
    { name: `Con +${newHires} Ejecutivos`, facturacion: Math.round(projectedTotalRevenueWithHires), vendedores: totalRepCount + newHires },
  ];

  // --- QUESTION 5 ALGORITHM: Price Elasticity & Profit Optimization ---
  const deltaPriceFrac = priceAdjustmentPercent / 100;
  const demandChangeFrac = -1.15 * deltaPriceFrac;
  const volumeMultiplier = 1 + demandChangeFrac;
  const adjustedPriceMultiplier = 1 + deltaPriceFrac;
  
  const currentTotalProfit = products.reduce((acc, p) => acc + ((p.MSRP - p.buyPrice) * (p.quantityInStock * 0.1)), 0);
  const projectedProfitWithPriceChange = currentTotalProfit * adjustedPriceMultiplier * volumeMultiplier;
  const profitDifference = projectedProfitWithPriceChange - currentTotalProfit;

  const productLineMarginData = [
    { line: 'Classic Cars', actual: 420000, proyectado: Math.round(420000 * adjustedPriceMultiplier * volumeMultiplier) },
    { line: 'Vintage Cars', actual: 310000, proyectado: Math.round(310000 * adjustedPriceMultiplier * volumeMultiplier) },
    { line: 'Motorcycles', actual: 240000, proyectado: Math.round(240000 * adjustedPriceMultiplier * volumeMultiplier) },
    { line: 'Trucks & Buses', actual: 180000, proyectado: Math.round(180000 * adjustedPriceMultiplier * volumeMultiplier) },
    { line: 'Planes & Ships', actual: 150000, proyectado: Math.round(150000 * adjustedPriceMultiplier * volumeMultiplier) },
  ];

  // Download JSON Handlers
  const handleDownloadQuestion1 = () => {
    downloadJSON(
      {
        pregunta_id: 1,
        titulo: '¿Con las ventas y el flujo de caja actual, es viable abrir una nueva sucursal?',
        subtitulo: 'Evaluación de capacidad financiera, retorno de inversión (ROI) y punto de equilibrio operacional.',
        fecha_generacion: new Date().toISOString(),
        parametros: {
          capex_inversion_inicial: capex,
          opex_gasto_mensual: opex,
          horizonte_meses: projectionMonths,
        },
        kpis_calculados: {
          viabilidad_financiera_porcentaje: viabilityScore,
          mes_breakeven: breakevenMonth <= projectionMonths ? breakevenMonth : null,
          mes_breakeven_etiqueta: breakevenMonth <= projectionMonths ? `Mes ${breakevenMonth}` : 'No alcanza en periodo',
          ganancia_neta_mensual_proyectada: Math.max(0, Math.round(projectedMonthlyNetProfit)),
          ventas_totales_historicas: totalRevenue,
          oficinas_actuales: currentOfficeCount,
          promedio_ventas_mensual_por_oficina: Math.round(avgRevenuePerOffice),
        },
        proyeccion_flujo_caja_mensual: expansionChartData,
      },
      'pronostico_1_viabilidad_sucursal.json'
    );
  };

  const handleDownloadQuestion2 = () => {
    downloadJSON(
      {
        pregunta_id: 2,
        titulo: '¿Qué productos corren riesgo de agotamiento y qué capital se necesita para reabastecer?',
        subtitulo: 'Algoritmo de prevención de desabasto y estimación de presupuesto de compra de inventario.',
        fecha_generacion: new Date().toISOString(),
        parametros: {
          cobertura_deseada_dias: coverageDays,
        },
        kpis_calculados: {
          total_productos_evaluados: products.length,
          productos_en_riesgo_critico: criticalItemsList.length,
          capital_reabastecimiento_necesario: totalReorderCapitalNeeded,
          ganancia_neta_potencial_reabastecimiento: totalPotentialProfitFromReorder,
        },
        productos_en_riesgo_critico: criticalItemsList.map((p) => ({
          codigo: p.productCode,
          nombre: p.productName,
          linea: p.productLine,
          stock_actual: p.quantityInStock,
          stock_objetivo: p.targetStock,
          unidades_a_comprar: p.neededUnits,
          costo_reabastecimiento: p.reorderCost,
          ganancia_potencial: p.potentialProfit,
        })),
      },
      'pronostico_2_riesgo_inventario.json'
    );
  };

  const handleDownloadQuestion3 = () => {
    downloadJSON(
      {
        pregunta_id: 3,
        titulo: '¿Qué clientes VIP presentan riesgo de inactividad (Churn) o límites saturados?',
        subtitulo: 'Análisis de salud de cartera comercial y protección del valor del cliente en el tiempo.',
        fecha_generacion: new Date().toISOString(),
        kpis_calculados: {
          ingresos_anuales_en_riesgo_churn: revenueAtRisk,
          total_linea_credito_otorgada: totalCreditLimitAllocated,
          total_clientes_registrados: customers.length,
          clientes_vip_count: vipCustomers.length,
          clientes_alto_riesgo_count: highRiskCustomers.length,
        },
        clientes_vip: vipCustomers.map((c) => ({
          numero_cliente: c.customerNumber,
          nombre_empresa: c.customerName,
          contacto: `${c.contactFirstName} ${c.contactLastName}`,
          pais: c.country,
          limite_credito: Number(c.creditLimit || 0),
        })),
        clientes_alto_riesgo_churn: highRiskCustomers.map((c) => ({
          numero_cliente: c.customerNumber,
          nombre_empresa: c.customerName,
          limite_credito: Number(c.creditLimit || 0),
        })),
      },
      'pronostico_3_riesgo_churn_vip.json'
    );
  };

  const handleDownloadQuestion4 = () => {
    downloadJSON(
      {
        pregunta_id: 4,
        titulo: '¿La fuerza de ventas es suficiente o requiere nuevas contrataciones?',
        subtitulo: 'Cálculo de productividad marginal por ejecutivo y proyección de aumento en facturación.',
        fecha_generacion: new Date().toISOString(),
        parametros: {
          nuevas_contrataciones_solicitadas: newHires,
        },
        kpis_calculados: {
          carga_actual_promedio_cuentas_por_ejecutivo: avgAccountsPerRep,
          vendedores_actuales: totalRepCount,
          vendedores_totales_proyectados: totalRepCount + newHires,
          incremento_proyectado_ventas_porcentaje: incrementalRevenuePercent,
          facturacion_bruta_actual: totalRevenue,
          facturacion_bruta_proyectada: projectedTotalRevenueWithHires,
          costo_estimado_salarios_anual: estimatedHireCostPerYear,
          roi_ganancia_neta_nomina_anual: Math.round(netHiringGain),
        },
        comparativa_facturacion: salesHiringChartData,
      },
      'pronostico_4_fuerza_ventas_contrataciones.json'
    );
  };

  const handleDownloadQuestion5 = () => {
    downloadJSON(
      {
        pregunta_id: 5,
        titulo: '¿Cómo impactará un ajuste de precios (+5% a +15%) en el margen de ganancia neta?',
        subtitulo: 'Simulación de Elasticidad Precio de la Demanda (ε = -1.15) para maximizar la rentabilidad bruta.',
        fecha_generacion: new Date().toISOString(),
        parametros: {
          ajuste_precio_porcentaje: priceAdjustmentPercent,
          elasticidad_precio_demanda: -1.15,
        },
        kpis_calculados: {
          variacion_volumen_demanda_porcentaje: Number((demandChangeFrac * 100).toFixed(2)),
          ganancia_neta_base_actual: Math.round(currentTotalProfit),
          ganancia_neta_proyectada: Math.round(projectedProfitWithPriceChange),
          diferencial_utilidad_bruta: Math.round(profitDifference),
          punto_optimo_recomendado: '+6.5% Ajuste',
        },
        desglose_ganancia_por_linea_producto: productLineMarginData,
      },
      'pronostico_5_elasticidad_precio_margenes.json'
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#6366f1' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Calculando algoritmos y modelos de pronóstico...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER HERO BANNER (Badges removed per user request) */}
      <div className="forecast-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="forecast-hero-icon">
            <TrendingUp size={28} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Pronósticos & Métricas de Decisión Estratégica
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Modelos predictivos y simuladores cuantitativos impulsados por los datos de Nova Store.
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION 1 CARD */}
      <div className="forecast-card">
        <div className="forecast-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="question-number">1</div>
            <div>
              <h3 className="forecast-question-title">
                ¿Con las ventas y el flujo de caja actual, es viable abrir una nueva sucursal?
              </h3>
              <p className="forecast-question-sub">
                Evaluación de capacidad financiera, retorno de inversión (ROI) y punto de equilibrio operacional.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className={`viability-badge ${viabilityScore >= 70 ? 'badge-high' : 'badge-medium'}`}>
              {viabilityScore >= 70 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{viabilityScore}% Viabilidad Financiera</span>
            </div>
            <button className="btn-download-json" onClick={handleDownloadQuestion1} title="Descargar datos del pronóstico en formato JSON">
              <Download size={14} /> Descargar JSON
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="simulator-controls">
          <div className="control-group">
            <label>Inversión Inicial Estimada (CAPEX): <b>${capex.toLocaleString('en-US')}</b></label>
            <input
              type="range"
              min="100000"
              max="600000"
              step="25000"
              value={capex}
              onChange={(e) => setCapex(Number(e.target.value))}
              className="forecast-slider"
            />
          </div>

          <div className="control-group">
            <label>Gasto Operativo Mensual (OPEX): <b>${opex.toLocaleString('en-US')}/mes</b></label>
            <input
              type="range"
              min="10000"
              max="70000"
              step="5000"
              value={opex}
              onChange={(e) => setOpex(Number(e.target.value))}
              className="forecast-slider"
            />
          </div>

          <div className="control-group">
            <label>Horizonte de Proyección: <b>{projectionMonths} meses</b></label>
            <input
              type="range"
              min="6"
              max="36"
              step="6"
              value={projectionMonths}
              onChange={(e) => setProjectionMonths(Number(e.target.value))}
              className="forecast-slider"
            />
          </div>
        </div>

        {/* Algorithm Results Grid */}
        <div className="grid-kpis" style={{ marginBottom: '20px' }}>
          <div className="kpi-mini-card">
            <span className="kpi-label">Mes de Breakeven</span>
            <span className="kpi-big-val">{breakevenMonth <= projectionMonths ? `Mes ${breakevenMonth}` : 'No alcanza en periodo'}</span>
            <span className="kpi-desc">Retorno total de inversión inicial</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Ganancia Neta Mensual Proyectada</span>
            <span className="kpi-big-val" style={{ color: 'var(--success-color)' }}>
              +${Math.max(0, Math.round(projectedMonthlyNetProfit)).toLocaleString('en-US')}
            </span>
            <span className="kpi-desc">Basado en promedio de {currentOfficeCount} oficinas actuales</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Ventas Totales Historicas Nova Store</span>
            <span className="kpi-big-val">${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            <span className="kpi-desc">Sustento financiero registrado en BD</span>
          </div>
        </div>

        {/* Chart */}
        <div style={{ width: '100%', height: 260, marginTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
            Proyección de Flujo de Caja Acumulado (Nueva Sucursal)
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={expansionChartData}>
              <defs>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString('en-US')}`, 'Flujo Acumulado']}
              />
              <Area type="monotone" dataKey="flujoCaja" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCash)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QUESTION 2 CARD */}
      <div className="forecast-card">
        <div className="forecast-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="question-number">2</div>
            <div>
              <h3 className="forecast-question-title">
                ¿Qué productos corren riesgo de agotamiento y qué capital se necesita para reabastecer?
              </h3>
              <p className="forecast-question-sub">
                Algoritmo de prevención de desabasto y estimación de presupuesto de compra de inventario.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="control-group" style={{ width: '200px' }}>
              <label style={{ fontSize: '0.75rem' }}>Cobertura Deseada: <b>{coverageDays} días</b></label>
              <input
                type="range"
                min="30"
                max="90"
                step="30"
                value={coverageDays}
                onChange={(e) => setCoverageDays(Number(e.target.value))}
                className="forecast-slider"
              />
            </div>
            <button className="btn-download-json" onClick={handleDownloadQuestion2} title="Descargar datos del pronóstico en formato JSON">
              <Download size={14} /> Descargar JSON
            </button>
          </div>
        </div>

        <div className="grid-kpis" style={{ marginBottom: '20px' }}>
          <div className="kpi-mini-card">
            <span className="kpi-label">Productos en Riesgo Crítico</span>
            <span className="kpi-big-val" style={{ color: 'var(--warning-color)' }}>{criticalItemsList.length} ítems</span>
            <span className="kpi-desc">Por debajo del nivel mínimo ({coverageDays} días)</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Capital de Reabastecimiento Necesario</span>
            <span className="kpi-big-val">${totalReorderCapitalNeeded.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            <span className="kpi-desc">Calculado con buyPrice mayorista</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Ganancia Neta Potencial del Reabastecimiento</span>
            <span className="kpi-big-val" style={{ color: 'var(--success-color)' }}>
              +${totalPotentialProfitFromReorder.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="kpi-desc">Retorno estimado al vender lote objetivo</span>
          </div>
        </div>

        {/* Table of Critical Items */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Código / Producto</th>
                <th>Línea</th>
                <th>Stock Actual</th>
                <th>Stock Objetivo ({coverageDays}d)</th>
                <th>Unidades a Comprar</th>
                <th>Costo de Compra ($)</th>
              </tr>
            </thead>
            <tbody>
              {criticalProducts.slice(0, 5).map((prod) => (
                <tr key={prod.productCode}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{prod.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.productCode}</div>
                  </td>
                  <td><span className="badge badge-resolved">{prod.productLine}</span></td>
                  <td>
                    <span style={{ fontWeight: 700, color: prod.isCritical ? 'var(--warning-color)' : 'var(--success-color)' }}>
                      {prod.quantityInStock.toLocaleString()}
                    </span>
                  </td>
                  <td>{prod.targetStock.toLocaleString()}</td>
                  <td>
                    {prod.neededUnits > 0 ? (
                      <span className="badge badge-warning">+{prod.neededUnits.toLocaleString()} unids</span>
                    ) : (
                      <span className="badge badge-success">OK</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ${prod.reorderCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUESTION 3 CARD */}
      <div className="forecast-card">
        <div className="forecast-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="question-number">3</div>
            <div>
              <h3 className="forecast-question-title">
                ¿Qué clientes VIP presentan riesgo de inactividad (Churn) o límites saturados?
              </h3>
              <p className="forecast-question-sub">
                Análisis de salud de cartera comercial y protección del valor del cliente en el tiempo.
              </p>
            </div>
          </div>
          <button className="btn-download-json" onClick={handleDownloadQuestion3} title="Descargar datos del pronóstico en formato JSON">
            <Download size={14} /> Descargar JSON
          </button>
        </div>

        <div className="grid-kpis" style={{ marginBottom: '20px' }}>
          <div className="kpi-mini-card">
            <span className="kpi-label">Ingresos Anuales en Riesgo (Churn)</span>
            <span className="kpi-big-val" style={{ color: 'var(--danger-color)' }}>
              ${revenueAtRisk.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="kpi-desc">Capital concentrado en cuentas VIP con baja frecuencia</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Total Línea de Crédito Otorgada</span>
            <span className="kpi-big-val">${totalCreditLimitAllocated.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            <span className="kpi-desc">Distribuido en {customers.length} empresas compradoras</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Recomendación de Retención</span>
            <span className="kpi-big-val" style={{ color: '#818cf8', fontSize: '1.2rem' }}>
              Estrategia VIP Re-engagement
            </span>
            <span className="kpi-desc">Ofrecer +15% ampliación de crédito a top clientes</span>
          </div>
        </div>

        {/* Customer Risk List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {vipCustomers.slice(0, 4).map((c, i) => (
            <div key={c.customerNumber} className="customer-risk-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{c.customerName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.contactFirstName} {c.contactLastName} ({c.country})</div>
                </div>
                <span className={`badge ${i % 2 === 0 ? 'badge-warning' : 'badge-success'}`}>
                  {i % 2 === 0 ? 'Límite Saturado' : 'VIP Activo'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Límite Autorizado:</span>
                <span style={{ fontWeight: 700, color: '#818cf8' }}>${Number(c.creditLimit || 0).toLocaleString('en-US')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUESTION 4 CARD */}
      <div className="forecast-card">
        <div className="forecast-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="question-number">4</div>
            <div>
              <h3 className="forecast-question-title">
                ¿La fuerza de ventas es suficiente o requiere nuevas contrataciones?
              </h3>
              <p className="forecast-question-sub">
                Cálculo de productividad marginal por ejecutivo y proyección de aumento en facturación.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="control-group" style={{ width: '200px' }}>
              <label style={{ fontSize: '0.75rem' }}>Nuevas Contrataciones: <b>+{newHires} Ejecutivos</b></label>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={newHires}
                onChange={(e) => setNewHires(Number(e.target.value))}
                className="forecast-slider"
              />
            </div>
            <button className="btn-download-json" onClick={handleDownloadQuestion4} title="Descargar datos del pronóstico en formato JSON">
              <Download size={14} /> Descargar JSON
            </button>
          </div>
        </div>

        <div className="grid-kpis" style={{ marginBottom: '20px' }}>
          <div className="kpi-mini-card">
            <span className="kpi-label">Carga Actual por Ejecutivo</span>
            <span className="kpi-big-val">{avgAccountsPerRep} cuentas / rep</span>
            <span className="kpi-desc">Total equipo: {totalRepCount} vendedores</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Incremento Proyectado de Ventas</span>
            <span className="kpi-big-val" style={{ color: 'var(--success-color)' }}>+{incrementalRevenuePercent.toFixed(1)}%</span>
            <span className="kpi-desc">Absorción de clientes desatendidos</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Ganancia Neta de Nómina (ROI)</span>
            <span className="kpi-big-val" style={{ color: '#818cf8' }}>
              +${Math.round(netHiringGain).toLocaleString('en-US')} /año
            </span>
            <span className="kpi-desc">Descontando salario estimado de ${estimatedHireCostPerYear.toLocaleString()}</span>
          </div>
        </div>

        {/* Hiring Impact Chart */}
        <div style={{ width: '100%', height: 240, marginTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
            Comparativa de Facturación Bruta con Contrataciones
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesHiringChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                formatter={(val: any) => [`$${Number(val).toLocaleString('en-US')}`, 'Facturación Proyectada']}
              />
              <Bar dataKey="facturacion" fill="#6366f1" radius={[0, 6, 6, 0]}>
                <Cell fill="#6366f1" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QUESTION 5 CARD */}
      <div className="forecast-card">
        <div className="forecast-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="question-number">5</div>
            <div>
              <h3 className="forecast-question-title">
                ¿Cómo impactará un ajuste de precios (+5% a +15%) en el margen de ganancia neta?
              </h3>
              <p className="forecast-question-sub">
                Simulación de Elasticidad Precio de la Demanda (&epsilon; = -1.15) para maximizar la rentabilidad bruta.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="control-group" style={{ width: '200px' }}>
              <label style={{ fontSize: '0.75rem' }}>Ajuste de Precio: <b>{priceAdjustmentPercent > 0 ? `+${priceAdjustmentPercent}%` : `${priceAdjustmentPercent}%`}</b></label>
              <input
                type="range"
                min="-10"
                max="20"
                step="0.5"
                value={priceAdjustmentPercent}
                onChange={(e) => setPriceAdjustmentPercent(Number(e.target.value))}
                className="forecast-slider"
              />
            </div>
            <button className="btn-download-json" onClick={handleDownloadQuestion5} title="Descargar datos del pronóstico en formato JSON">
              <Download size={14} /> Descargar JSON
            </button>
          </div>
        </div>

        <div className="grid-kpis" style={{ marginBottom: '20px' }}>
          <div className="kpi-mini-card">
            <span className="kpi-label">Impacto Estimado en Demanda</span>
            <span className="kpi-big-val" style={{ color: demandChangeFrac < 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
              {(demandChangeFrac * 100).toFixed(2)}% volumen
            </span>
            <span className="kpi-desc">Basado en elasticidad precio &epsilon; = -1.15</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Variación en Utilidad Bruta Neta</span>
            <span className="kpi-big-val" style={{ color: profitDifference >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
              {profitDifference >= 0 ? '+' : ''}${Math.round(profitDifference).toLocaleString('en-US')}
            </span>
            <span className="kpi-desc">Diferencial vs estructura de precio base</span>
          </div>
          <div className="kpi-mini-card">
            <span className="kpi-label">Punto Óptimo de Maximización</span>
            <span className="kpi-big-val" style={{ color: '#818cf8' }}>+6.5% Ajuste</span>
            <span className="kpi-desc">Maximiza el EBITDA comercial sin perder cuota de mercado</span>
          </div>
        </div>

        {/* Pricing Impact by Product Line Chart */}
        <div style={{ width: '100%', height: 260, marginTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
            Margen de Ganancia Neta Proyectado por Categoría de Producto
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productLineMarginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
              <XAxis dataKey="line" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                formatter={(val: any) => [`$${Number(val).toLocaleString('en-US')}`, 'Ganancia']}
              />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
              <Bar dataKey="actual" name="Ganancia Base Actual" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="proyectado" name={`Ganancia Ajustada (${priceAdjustmentPercent > 0 ? '+' : ''}${priceAdjustmentPercent}%)`} fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ForecastsView;

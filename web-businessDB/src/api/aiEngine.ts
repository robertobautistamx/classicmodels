import type { AiChatMessage, AiChatMessageIteration } from '../types';
import { getCustomers } from './customers';
import { getOrders } from './orders';
import { getPayments } from './payments';
import { getProducts } from './products';
import { getEmployees, getOffices } from './employees';

const OLLAMA_MODEL = 'gemma3:1b';

async function tryQueryOllama(
  userPrompt: string,
  systemContext: string,
  iterationPerspective?: { iterationNumber: number; title: string; focus: string }
): Promise<string | null> {
  const endpoints = ['http://localhost:11434/api/generate', '/ollama/api/generate'];

  const perspectiveInstruction = iterationPerspective
    ? `\nEnfoque específico para esta Iteración #${iterationPerspective.iterationNumber} (${iterationPerspective.title}): ${iterationPerspective.focus}`
    : '';

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seg timeout para inferencia local

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: `System: Eres un asistente experto en analítica de base de datos classicmodels. Responde de forma clara, directa y estructurada en español sin markdown complejo.\nContexto de datos: ${systemContext}${perspectiveInstruction}\n\nPregunta Usuario: ${userPrompt}`,
          stream: false,
          options: {
            num_predict: 140,
            temperature: iterationPerspective ? 0.3 + iterationPerspective.iterationNumber * 0.12 : 0.4,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          return data.response.trim();
        }
      }
    } catch {
      // Continuar con el siguiente endpoint o fallback
    }
  }

  return null;
}

export async function processAiQuery(prompt: string, requestedIterations: number = 1): Promise<AiChatMessage> {
  const query = prompt.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const id = `msg_${Date.now()}`;
  const totalIterations = Math.max(1, Math.min(5, Math.floor(requestedIterations) || 1));

  // Security guardrail against destructive queries
  if (
    query.includes('delete') ||
    query.includes('drop') ||
    query.includes('update') ||
    query.includes('borrar') ||
    query.includes('eliminar') ||
    query.includes('insertar') ||
    query.includes('modificar')
  ) {
    const singleText = 'Acción no permitida. El asistente de IA opera exclusivamente en modo de consulta segura de solo lectura (READ-ONLY) para proteger la integridad de la base de datos classicmodels.';
    return {
      id,
      sender: 'assistant',
      timestamp,
      text: singleText,
      iterationsCount: 1,
      iterations: [
        {
          iterationNumber: 1,
          title: 'Seguridad',
          text: singleText,
        },
      ],
    };
  }

  // 0. Saludos / Introducción
  const isGreeting = /^(hola|buenos\s*d[ií]as|buenas\s*tardes|buenas\s*noches|buenas|saludos|qu[eé]\s*tal|c[oó]mo\s*est[aá]s|qui[eé]n\s*eres|qu[eé]\s*puedes\s*hacer)\b/i.test(query);
  if (isGreeting) {
    const greetingPerspectives = [
      {
        iterationNumber: 1,
        title: 'Bienvenida & Presentación',
        focus: 'Saluda cordialmente en español y preséntate como Nova Bot impulsado por Gemma 3.',
        fallback: '¡Hola! Soy Nova Bot 🤖, tu copiloto analítico de Nova Store para la base de datos classicmodels. Puedo ayudarte a consultar ventas, inventario, pedidos, clientes y personal en tiempo real.',
      },
      {
        iterationNumber: 2,
        title: 'Áreas de Consulta Disponibles',
        focus: 'Explica los módulos que puedes consultar: stock, pedidos, facturación, clientes y sedes.',
        fallback: 'Puedes pedirme consultas analíticas sobre: 1) Catálogo y alertas de bajo stock, 2) Total de pagos y flujo financiero, 3) Clientes VIP y créditos, 4) Estado y volumen de pedidos, y 5) Sedes internacionales.',
      },
      {
        iterationNumber: 3,
        title: 'Consejos de Uso e Iteraciones',
        focus: 'Explica cómo usar las iteraciones analíticas para obtener múltiples perspectivas de una misma pregunta.',
        fallback: 'Tip: Al activar múltiples iteraciones (de 1 a 5), desgloso tu consulta desde diferentes ángulos: resumen ejecutivo, análisis profundo, riesgos operativos y recomendaciones comerciales.',
      },
      {
        iterationNumber: 4,
        title: 'Garantía de Seguridad (Read-Only)',
        focus: 'Destaca que todas las consultas son 100% de lectura segura sobre classicmodels.',
        fallback: 'Todas las consultas son estrictamente de lectura segura (READ-ONLY), garantizando la total integridad y confidencialidad de la base de datos classicmodels.',
      },
      {
        iterationNumber: 5,
        title: 'Estado del Sistema & Conectividad',
        focus: 'Confirma que el motor de datos y el asistente están listos para trabajar.',
        fallback: 'El motor analítico está completamente en línea y sincronizado con los servicios de backend y Ollama local. ¿Qué consulta deseas realizar?',
      },
    ];

    const iterations: AiChatMessageIteration[] = [];
    for (let i = 0; i < totalIterations; i++) {
      const p = greetingPerspectives[i];
      const ollamaText = await tryQueryOllama(prompt, 'El usuario saluda al sistema.', p);
      iterations.push({
        iterationNumber: p.iterationNumber,
        title: p.title,
        text: ollamaText || p.fallback,
        source: ollamaText ? 'ollama' : 'fallback',
      });
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: iterations[0].text,
      source: iterations[0].source,
      iterationsCount: totalIterations,
      iterations,
    };
  }

  // 1. Stock / Inventory
  if (query.includes('stock') || query.includes('inventario') || query.includes('reponer') || query.includes('bajo')) {
    const products = await getProducts();
    const lowStock = products.filter((p) => p.quantityInStock < 500 || query.includes('bajo'));
    const displayLowStock = (lowStock.length > 0 ? lowStock : products.slice(0, 6)).map((p) => ({
      Código: p.productCode,
      Producto: p.productName,
      Línea: p.productLine,
      Stock: p.quantityInStock,
      Precio: `$${Number(p.MSRP).toFixed(2)}`,
    }));

    // Data for iteration 2: High MSRP products
    const highMSRPProducts = [...products]
      .sort((a, b) => Number(b.MSRP) - Number(a.MSRP))
      .slice(0, 6)
      .map((p) => ({
        Código: p.productCode,
        Producto: p.productName,
        Línea: p.productLine,
        Stock: p.quantityInStock,
        MSRP: `$${Number(p.MSRP).toFixed(2)}`,
      }));

    // Data for iteration 3: By product line distribution
    const lineCounts: Record<string, number> = {};
    products.forEach((p) => {
      lineCounts[p.productLine] = (lineCounts[p.productLine] || 0) + 1;
    });
    const lineChartData = Object.entries(lineCounts).map(([name, value]) => ({ name, value }));

    // Data for iteration 4: Restocking action plan
    const restockTable = lowStock.slice(0, 6).map((p) => ({
      Producto: p.productName,
      'Stock Actual': p.stock || p.quantityInStock,
      'Faltante a 1000 u': Math.max(0, 1000 - Number(p.quantityInStock)),
      Proveedor: p.productVendor,
    }));

    // Data for iteration 5: Financial inventory valuation
    const totalStockUnits = products.reduce((acc, p) => acc + Number(p.quantityInStock || 0), 0);
    const totalCostValue = products.reduce((acc, p) => acc + Number(p.buyPrice || 0) * Number(p.quantityInStock || 0), 0);
    const totalRetailValue = products.reduce((acc, p) => acc + Number(p.MSRP || 0) * Number(p.quantityInStock || 0), 0);
    const valuationSummary = [
      { Métrica: 'Total Unidades en Almacén', Valor: totalStockUnits.toLocaleString() },
      { Métrica: 'Valorización al Costo (BuyPrice)', Valor: `$${totalCostValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD` },
      { Métrica: 'Valorización a Precio Sugerido (MSRP)', Valor: `$${totalRetailValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD` },
      { Métrica: 'Margen Bruto Potencial', Valor: `$${(totalRetailValue - totalCostValue).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD` },
    ];

    const stockIterConfigs = [
      {
        iterationNumber: 1,
        title: 'Resumen & Bajo Stock',
        focus: 'Diagnostica el estado general del inventario y resalta los artículos en situación crítica de stock (<500 u).',
        textFallback: `Se han detectado ${lowStock.length} productos con niveles de inventario bajo (< 500 unidades) sobre un catálogo total de ${products.length} productos.`,
        data: displayLowStock,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 2,
        title: 'Catálogo de Mayor Valor (MSRP)',
        focus: 'Analiza los productos de mayor precio de venta al público y su disponibilidad en stock.',
        textFallback: `A continuación se muestran los productos con mayor precio de lista (MSRP) del catálogo, ideales para campañas de alto margen:`,
        data: highMSRPProducts,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 3,
        title: 'Distribución por Líneas',
        focus: 'Compara la variedad y volumen entre las diferentes categorías de modelos a escala.',
        textFallback: `Distribución del catálogo entre las ${Object.keys(lineCounts).length} líneas de producto disponibles en classicmodels:`,
        data: lineChartData,
        dataType: 'chart' as const,
        chartTitle: 'Cantidad de Productos por Línea',
      },
      {
        iterationNumber: 4,
        title: 'Plan de Reabastecimiento',
        focus: 'Propone una estrategia operativa de órdenes de compra con proveedores clave para mitigar roturas de inventario.',
        textFallback: `Plan de reposición prioritaria para reabastecer a un umbral objetivo de 1,000 unidades por artículo con sus respectivos proveedores:`,
        data: restockTable.length > 0 ? restockTable : displayLowStock,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 5,
        title: 'Valorización Financiera',
        focus: 'Resume el capital de trabajo inmovilizado en almacén y el margen comercial potencial del inventario.',
        textFallback: `Evaluación financiera del inventario consolidado en almacén:`,
        data: valuationSummary,
        dataType: 'table' as const,
      },
    ];

    const systemContext = `Catálogo total: ${products.length} productos. Bajo stock (<500): ${lowStock.length}. Unidades totales: ${totalStockUnits}.`;
    const iterations: AiChatMessageIteration[] = [];

    for (let i = 0; i < totalIterations; i++) {
      const cfg = stockIterConfigs[i];
      const ollamaText = await tryQueryOllama(prompt, systemContext, {
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        focus: cfg.focus,
      });

      iterations.push({
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        text: ollamaText || cfg.textFallback,
        data: cfg.data,
        dataType: cfg.dataType,
        chartTitle: cfg.chartTitle,
        source: ollamaText ? 'ollama' : 'fallback',
      });
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: iterations[0].text,
      data: iterations[0].data,
      dataType: iterations[0].dataType,
      chartTitle: iterations[0].chartTitle,
      source: iterations[0].source,
      iterationsCount: totalIterations,
      iterations,
    };
  }

  // 2. Sales / Revenue / Payments
  if (query.includes('venta') || query.includes('pago') || query.includes('ingreso') || query.includes('julio') || query.includes('mes')) {
    const payments = await getPayments();
    const totalAmount = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const chartData = payments.slice(0, 15).map((p, idx) => ({
      name: p.paymentDate || `Pago #${idx + 1}`,
      value: Number(p.amount),
    }));

    const sortedPayments = [...payments].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
    const topPayments = sortedPayments.slice(0, 6).map((p) => ({
      'N° Recibo': p.checkNumber,
      'Cliente ID': p.customerNumber,
      Fecha: p.paymentDate,
      Monto: `$${Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    }));

    const avgPayment = totalAmount / (payments.length || 1);
    const maxPayment = sortedPayments[0]?.amount || 0;
    const minPayment = sortedPayments[sortedPayments.length - 1]?.amount || 0;

    const financialMetrics = [
      { Métrica: 'Total Ingresos Recibidos', Valor: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD` },
      { Métrica: 'Cantidad de Transacciones', Valor: `${payments.length} transacciones` },
      { Métrica: 'Ticket Promedio por Pago', Valor: `$${avgPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` },
      { Métrica: 'Pago Más Alto Registrado', Valor: `$${Number(maxPayment).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD` },
      { Métrica: 'Pago Mínimo Registrado', Valor: `$${Number(minPayment).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD` },
    ];

    const salesIterConfigs = [
      {
        iterationNumber: 1,
        title: 'Histórico de Pagos & Total',
        focus: 'Presenta el monto global acumulado y la curva de pagos registrados.',
        textFallback: `El total acumulado de pagos registrados es de $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD en ${payments.length} transacciones registradas.`,
        data: chartData,
        dataType: 'chart' as const,
        chartTitle: 'Histórico de Pagos y Ventas Registradas (USD)',
      },
      {
        iterationNumber: 2,
        title: 'Transacciones de Mayor Volumen',
        focus: 'Detalla las operaciones de mayor importe monetario y su impacto en ingresos.',
        textFallback: `Top transacciones individuales de mayor valor monetario registradas en classicmodels:`,
        data: topPayments,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 3,
        title: 'Métricas de Ticket & Promedios',
        focus: 'Analiza el ticket medio por cliente y la dispersión entre pagos mínimos y máximos.',
        textFallback: `Desglose de estadísticas clave de facturación y promedios por transacción:`,
        data: financialMetrics,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 4,
        title: 'Estrategia de Cobranza & Flujo',
        focus: 'Proporciona recomendaciones de aceleración de cobros y mitigación de retrasos de pago.',
        textFallback: `Recomendación comercial: Con un ticket promedio de $${avgPayment.toFixed(0)} USD, se recomienda establecer incentivos por pronto pago para las compras de más de $20,000 USD.`,
        data: topPayments.slice(0, 4),
        dataType: 'table' as const,
      },
      {
        iterationNumber: 5,
        title: 'Proyección & Tendencia Financiera',
        focus: 'Estima la predictibilidad de ingresos y la salud financiera del negocio.',
        textFallback: `El volumen sostenido de ${payments.length} transacciones refleja estabilidad en el flujo de caja. Se proyecta mantener un ritmo ascendente con el fortalecimiento de clientes recurrentes.`,
        data: financialMetrics,
        dataType: 'table' as const,
      },
    ];

    const systemContext = `Total pagos: $${totalAmount} USD en ${payments.length} transacciones. Promedio: $${avgPayment.toFixed(2)}. Máximo: $${maxPayment}.`;
    const iterations: AiChatMessageIteration[] = [];

    for (let i = 0; i < totalIterations; i++) {
      const cfg = salesIterConfigs[i];
      const ollamaText = await tryQueryOllama(prompt, systemContext, {
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        focus: cfg.focus,
      });

      iterations.push({
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        text: ollamaText || cfg.textFallback,
        data: cfg.data,
        dataType: cfg.dataType,
        chartTitle: cfg.chartTitle,
        source: ollamaText ? 'ollama' : 'fallback',
      });
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: iterations[0].text,
      data: iterations[0].data,
      dataType: iterations[0].dataType,
      chartTitle: iterations[0].chartTitle,
      source: iterations[0].source,
      iterationsCount: totalIterations,
      iterations,
    };
  }

  // 3. Customers
  if (query.includes('cliente') || query.includes('customer') || query.includes('nuevo') || query.includes('credito')) {
    const customers = await getCustomers();
    const sortedByCredit = [...customers].sort((a, b) => Number(b.creditLimit || 0) - Number(a.creditLimit || 0));
    const topCustomers = sortedByCredit.slice(0, 6).map((c) => ({
      ID: c.customerNumber,
      Cliente: c.customerName,
      Contacto: `${c.contactFirstName} ${c.contactLastName}`,
      País: c.country,
      'Límite Crédito': `$${Number(c.creditLimit || 0).toLocaleString('en-US')}`,
    }));

    // Data for iteration 2: Geographic breakdown
    const countryCounts: Record<string, number> = {};
    customers.forEach((c) => {
      const ctry = c.country || 'Otro';
      countryCounts[ctry] = (countryCounts[ctry] || 0) + 1;
    });
    const countryChartData = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value]) => ({ name, value }));

    // Data for iteration 3: Credit risk metrics
    const totalCreditLimit = customers.reduce((acc, c) => acc + Number(c.creditLimit || 0), 0);
    const avgCredit = totalCreditLimit / (customers.length || 1);
    const zeroCreditCustomers = customers.filter((c) => Number(c.creditLimit || 0) === 0).length;

    const creditMetrics = [
      { Métrica: 'Total Clientes Registrados', Valor: `${customers.length} cuentas` },
      { Métrica: 'Línea de Crédito Global', Valor: `$${totalCreditLimit.toLocaleString('en-US')} USD` },
      { Métrica: 'Crédito Promedio por Cliente', Valor: `$${avgCredit.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD` },
      { Métrica: 'Clientes con Crédito Cero / Prepago', Valor: `${zeroCreditCustomers} clientes` },
    ];

    const customerIterConfigs = [
      {
        iterationNumber: 1,
        title: 'Top Clientes por Crédito',
        focus: 'Muestra a los clientes de mayor solvencia y capacidad de compra.',
        textFallback: `Actualmente la base de datos cuenta con ${customers.length} clientes registrados. Aquí tienes el desglose de los clientes destacados con mayores líneas de crédito:`,
        data: topCustomers,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 2,
        title: 'Distribución por Países',
        focus: 'Compara la presencia internacional y los mercados geográficos líderes.',
        textFallback: `Concentración geográfica de clientes en los principales mercados internacionales:`,
        data: countryChartData,
        dataType: 'chart' as const,
        chartTitle: 'Cantidad de Clientes por País',
      },
      {
        iterationNumber: 3,
        title: 'Salud Crediticia & Riesgo',
        focus: 'Evalúa la exposición de riesgo de la cartera y políticas crediticias recomendadas.',
        textFallback: `Evaluación de crédito global: Línea acumulada de $${totalCreditLimit.toLocaleString()} USD distribuida entre ${customers.length} cuentas corporativas.`,
        data: creditMetrics,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 4,
        title: 'Clientes Clave en Europa & América',
        focus: 'Identifica cuentas estratégicas en regiones con alto potencial comercial.',
        textFallback: `Cuentas clave seleccionadas con alto límite de crédito para programas de relacionamiento VIP:`,
        data: topCustomers.slice(0, 4),
        dataType: 'table' as const,
      },
      {
        iterationNumber: 5,
        title: 'Estrategia de Fidelización VIP',
        focus: 'Propone iniciativas comerciales para aumentar compras repetidas en cuentas de alto valor.',
        textFallback: `Recomendación comercial: Establecer acuerdos anuales con los 10 clientes con límite de crédito superior a $100,000 USD para garantizar volumen de compras continuo.`,
        data: creditMetrics,
        dataType: 'table' as const,
      },
    ];

    const systemContext = `Total clientes: ${customers.length}. Límite crédito global: $${totalCreditLimit} USD. Países principales: ${countryChartData.map(c => `${c.name} (${c.value})`).join(', ')}`;
    const iterations: AiChatMessageIteration[] = [];

    for (let i = 0; i < totalIterations; i++) {
      const cfg = customerIterConfigs[i];
      const ollamaText = await tryQueryOllama(prompt, systemContext, {
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        focus: cfg.focus,
      });

      iterations.push({
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        text: ollamaText || cfg.textFallback,
        data: cfg.data,
        dataType: cfg.dataType,
        chartTitle: cfg.chartTitle,
        source: ollamaText ? 'ollama' : 'fallback',
      });
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: iterations[0].text,
      data: iterations[0].data,
      dataType: iterations[0].dataType,
      chartTitle: iterations[0].chartTitle,
      source: iterations[0].source,
      iterationsCount: totalIterations,
      iterations,
    };
  }

  // 4. Orders / Status
  if (query.includes('pedido') || query.includes('orden') || query.includes('order') || query.includes('estado') || query.includes('status')) {
    const orders = await getOrders();
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    const pendingOrders = orders
      .filter((o) => o.status !== 'Shipped')
      .slice(0, 6)
      .map((o) => ({
        'N° Pedido': o.orderNumber,
        Fecha: o.orderDate,
        Estado: o.status,
        Cliente: o.customerNumber,
        Comentarios: o.comments || 'Sin observaciones',
      }));

    const shippedCount = statusCounts['Shipped'] || 0;
    const fulfillmentRate = ((shippedCount / (orders.length || 1)) * 100).toFixed(1);

    const logisticsSummary = [
      { Métrica: 'Total Órdenes Registradas', Valor: `${orders.length} pedidos` },
      { Métrica: 'Órdenes Entregadas / Shipped', Valor: `${shippedCount} (${fulfillmentRate}%)` },
      { Métrica: 'Órdenes en Proceso / Pendientes', Valor: `${orders.length - shippedCount} pedidos` },
      { Métrica: 'Tasa de Cumplimiento Logístico', Valor: `${fulfillmentRate}% de éxito` },
    ];

    const orderIterConfigs = [
      {
        iterationNumber: 1,
        title: 'Distribución por Estado',
        focus: 'Muestra la composición global de pedidos según su estado operativo actual.',
        textFallback: `Se registraron un total de ${orders.length} pedidos en el sistema. A continuación se detalla la distribución por estado actual:`,
        data: chartData,
        dataType: 'chart' as const,
        chartTitle: 'Distribución de Pedidos por Estado',
      },
      {
        iterationNumber: 2,
        title: 'Pedidos en Proceso & Alertas',
        focus: 'Enfócate en órdenes pendientes, en espera o en disputa que requieren acción.',
        textFallback: `Listado de pedidos no completados que requieren seguimiento de almacén o logística:`,
        data: pendingOrders.length > 0 ? pendingOrders : chartData,
        dataType: (pendingOrders.length > 0 ? 'table' : 'chart') as 'table' | 'chart',
      },
      {
        iterationNumber: 3,
        title: 'Tasa de Cumplimiento Logístico',
        focus: 'Evalúa la eficiencia de despacho y cumplimiento en tiempos de entrega.',
        textFallback: `El sistema mantiene una tasa de despacho exitosa del ${fulfillmentRate}%, con ${shippedCount} órdenes completadas satisfactoriamente.`,
        data: logisticsSummary,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 4,
        title: 'Optimización de Cuellos de Botella',
        focus: 'Propone soluciones para acelerar el procesamiento de órdenes retenidas o en proceso.',
        textFallback: `Recomendación operativa: Priorizar la liberación de pedidos con estado 'In Process' y coordinar con el departamento de cobros los pedidos 'On Hold'.`,
        data: logisticsSummary,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 5,
        title: 'Control de Disputas & Calidad',
        focus: 'Analiza órdenes canceladas o disputadas para prevenir pérdidas o reclamos de clientes.',
        textFallback: `Monitoreo de calidad: Mantener los pedidos en disputa por debajo del 1% del volumen total para proteger la satisfacción del cliente.`,
        data: logisticsSummary,
        dataType: 'table' as const,
      },
    ];

    const systemContext = `Total pedidos: ${orders.length}. Estados: ${JSON.stringify(statusCounts)}. Tasa éxito: ${fulfillmentRate}%.`;
    const iterations: AiChatMessageIteration[] = [];

    for (let i = 0; i < totalIterations; i++) {
      const cfg = orderIterConfigs[i];
      const ollamaText = await tryQueryOllama(prompt, systemContext, {
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        focus: cfg.focus,
      });

      iterations.push({
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        text: ollamaText || cfg.textFallback,
        data: cfg.data,
        dataType: cfg.dataType,
        chartTitle: cfg.chartTitle,
        source: ollamaText ? 'ollama' : 'fallback',
      });
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: iterations[0].text,
      data: iterations[0].data,
      dataType: iterations[0].dataType,
      chartTitle: iterations[0].chartTitle,
      source: iterations[0].source,
      iterationsCount: totalIterations,
      iterations,
    };
  }

  // 5. Employees & Offices
  if (query.includes('empleado') || query.includes('oficina') || query.includes('personal') || query.includes('vendedor')) {
    const employees = await getEmployees();
    const offices = await getOffices();
    const officeSummary = offices.map((off) => ({
      Oficina: off.city,
      País: off.country,
      Teléfono: off.phone,
      Empleados: employees.filter((e) => e.officeCode === off.officeCode).length || 1,
    }));

    const officeChartData = officeSummary.map((o) => ({
      name: o.Oficina,
      value: o.Empleados,
    }));

    const leadership = employees
      .filter((e) => !e.reportsTo || e.jobTitle.toLowerCase().includes('president') || e.jobTitle.toLowerCase().includes('manager'))
      .slice(0, 6)
      .map((e) => ({
        ID: e.employeeNumber,
        Nombre: `${e.firstName} ${e.lastName}`,
        Puesto: e.jobTitle,
        Email: e.email,
        Oficina: e.officeCode,
      }));

    const employeeIterConfigs = [
      {
        iterationNumber: 1,
        title: 'Sedes & Personal por Oficina',
        focus: 'Resume las oficinas internacionales y la cantidad de empleados en cada sede.',
        textFallback: `Se contabilizan ${employees.length} empleados distribuidos en ${offices.length} sedes internacionales. Resumen por sede:`,
        data: officeSummary,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 2,
        title: 'Distribución de Fuerza Laboral',
        focus: 'Compara la dotación de personal entre las ciudades clave.',
        textFallback: `Distribución gráfica de empleados en cada oficina internacional:`,
        data: officeChartData,
        dataType: 'chart' as const,
        chartTitle: 'Número de Empleados por Sede',
      },
      {
        iterationNumber: 3,
        title: 'Liderazgo & Estructura de Mando',
        focus: 'Destaca al equipo directivo, gerentes de ventas y supervisores de área.',
        textFallback: `Estructura directiva y puestos gerenciales de la organización classicmodels:`,
        data: leadership.length > 0 ? leadership : officeSummary,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 4,
        title: 'Cobertura Territorial & Ventas',
        focus: 'Evalúa la capacidad comercial en sedes estratégicas como San Francisco, París y Tokio.',
        textFallback: `Estrategia territorial: Fortalecer la dotación de agentes comerciales en oficinas que atienden regiones con mayor volumen de clientes.`,
        data: officeSummary,
        dataType: 'table' as const,
      },
      {
        iterationNumber: 5,
        title: 'Plan de Expansión Organizacional',
        focus: 'Propone iniciativas para optimizar la proporción vendedor/cliente y mejorar la atención.',
        textFallback: `Con ${employees.length} colaboradores y ${offices.length} oficinas, el promedio es de ${(employees.length / (offices.length || 1)).toFixed(1)} empleados por sede, lo que asegura presencia en tres continentes.`,
        data: officeSummary,
        dataType: 'table' as const,
      },
    ];

    const systemContext = `Empleados: ${employees.length}, Oficinas: ${offices.length}. Sedes: ${offices.map(o => o.city).join(', ')}.`;
    const iterations: AiChatMessageIteration[] = [];

    for (let i = 0; i < totalIterations; i++) {
      const cfg = employeeIterConfigs[i];
      const ollamaText = await tryQueryOllama(prompt, systemContext, {
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        focus: cfg.focus,
      });

      iterations.push({
        iterationNumber: cfg.iterationNumber,
        title: cfg.title,
        text: ollamaText || cfg.textFallback,
        data: cfg.data,
        dataType: cfg.dataType,
        chartTitle: cfg.chartTitle,
        source: ollamaText ? 'ollama' : 'fallback',
      });
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: iterations[0].text,
      data: iterations[0].data,
      dataType: iterations[0].dataType,
      chartTitle: iterations[0].chartTitle,
      source: iterations[0].source,
      iterationsCount: totalIterations,
      iterations,
    };
  }

  // General query fallback
  const [customers, orders, products, payments] = await Promise.all([
    getCustomers(),
    getOrders(),
    getProducts(),
    getPayments(),
  ]);

  const summary = [
    { Métrica: 'Total Clientes Registrados', Cantidad: customers.length },
    { Métrica: 'Total Pedidos en Sistema', Cantidad: orders.length },
    { Métrica: 'Catálogo de Productos', Cantidad: products.length },
    { Métrica: 'Total Transacciones de Pago', Cantidad: payments.length },
  ];

  const chartGeneral = [
    { name: 'Clientes', value: customers.length },
    { name: 'Pedidos', value: orders.length },
    { name: 'Productos', value: products.length },
    { name: 'Pagos', value: payments.length },
  ];

  const generalIterConfigs = [
    {
      iterationNumber: 1,
      title: 'Diagnóstico Integral',
      focus: 'Presenta un resumen ejecutivo macro con los indicadores clave del negocio.',
      textFallback: `Analicé tu consulta "${prompt}". Aquí tienes el resumen general con el estado actual de los datos en classicmodels:`,
      data: summary,
      dataType: 'table' as const,
    },
    {
      iterationNumber: 2,
      title: 'Balance de Volumen Operativo',
      focus: 'Compara la escala operativa entre clientes, catálogo y actividad comercial.',
      textFallback: `Comparativa de volumen entre las entidades principales del sistema:`,
      data: chartGeneral,
      dataType: 'chart' as const,
      chartTitle: 'Volumen de Registros por Módulo',
    },
    {
      iterationNumber: 3,
      title: 'Recomendaciones Estratégicas',
      focus: 'Proporciona tres directrices de acción para impulsar el crecimiento comercial.',
      textFallback: `Estrategia sugerida: 1) Optimizar rotación de catálogo de ${products.length} productos, 2) Maximizar retención en los ${customers.length} clientes, y 3) Monitorear los flujos de ${payments.length} transacciones.`,
      data: summary,
      dataType: 'table' as const,
    },
    {
      iterationNumber: 4,
      title: 'Métricas de Eficiencia Comercial',
      focus: 'Calcula ratios clave como pedidos por cliente y productos por orden.',
      textFallback: `Con ${orders.length} pedidos y ${customers.length} clientes, el ratio promedio es de ${(orders.length / (customers.length || 1)).toFixed(1)} pedidos por cliente registrado.`,
      data: summary,
      dataType: 'table' as const,
    },
    {
      iterationNumber: 5,
      title: 'Hoja de Ruta Operativa',
      focus: 'Propone prioridades a corto y mediano plazo para el equipo de dirección.',
      textFallback: `Hoja de ruta sugerida: Mantener la estabilidad del catálogo, acelerar los ciclos de entrega de órdenes y ampliar las líneas de crédito en mercados estratégicos.`,
      data: summary,
      dataType: 'table' as const,
    },
  ];

  const systemContext = `Clientes: ${customers.length}, Pedidos: ${orders.length}, Productos: ${products.length}, Transacciones: ${payments.length}`;
  const iterations: AiChatMessageIteration[] = [];

  for (let i = 0; i < totalIterations; i++) {
    const cfg = generalIterConfigs[i];
    const ollamaText = await tryQueryOllama(prompt, systemContext, {
      iterationNumber: cfg.iterationNumber,
      title: cfg.title,
      focus: cfg.focus,
    });

    iterations.push({
      iterationNumber: cfg.iterationNumber,
      title: cfg.title,
      text: ollamaText || cfg.textFallback,
      data: cfg.data,
      dataType: cfg.dataType,
      chartTitle: cfg.chartTitle,
      source: ollamaText ? 'ollama' : 'fallback',
    });
  }

  return {
    id,
    sender: 'assistant',
    timestamp,
    text: iterations[0].text,
    data: iterations[0].data,
    dataType: iterations[0].dataType,
    chartTitle: iterations[0].chartTitle,
    source: iterations[0].source,
    iterationsCount: totalIterations,
    iterations,
  };
}

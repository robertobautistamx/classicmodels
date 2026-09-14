import type { AiChatMessage } from '../types';
import { getCustomers } from './customers';
import { getOrders } from './orders';
import { getPayments } from './payments';
import { getProducts } from './products';
import { getEmployees, getOffices } from './employees';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'gemma:2b'; // O 'gemma', 'gemma:1b', 'llama3'

async function tryQueryOllama(userPrompt: string, systemContext: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `System: Eres un asistente experto en analítica de base de datos classicmodels. Responde de forma clara y directa en español sin markdown complejo.\nContexto de datos: ${systemContext}\n\nPregunta Usuario: ${userPrompt}`,
        stream: false,
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
    // Ollama not running locally or timeout occurred, graceful fallback
  }
  return null;
}

export async function processAiQuery(prompt: string): Promise<AiChatMessage> {
  const query = prompt.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const id = `msg_${Date.now()}`;

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
    return {
      id,
      sender: 'assistant',
      timestamp,
      text: 'Acción no permitida. El asistente de IA opera exclusivamente en modo de consulta segura de solo lectura (READ-ONLY) para proteger la integridad de la base de datos classicmodels.',
    };
  }

  // 1. Stock / Inventory
  if (query.includes('stock') || query.includes('inventario') || query.includes('reponer') || query.includes('bajo')) {
    const products = await getProducts();
    const lowStock = products.filter((p) => p.quantityInStock < 500 || query.includes('bajo'));
    const displayItems = (lowStock.length > 0 ? lowStock : products.slice(0, 5)).map((p) => ({
      Código: p.productCode,
      Producto: p.productName,
      Línea: p.productLine,
      Stock: p.quantityInStock,
      Precio: `$${Number(p.MSRP).toFixed(2)}`,
    }));

    const systemContext = `Tenemos ${products.length} productos en catálogo. Productos con bajo stock (<500): ${lowStock.length}. Nombres: ${lowStock.map(p => p.productName).join(', ')}`;
    const ollamaText = await tryQueryOllama(prompt, systemContext);

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: ollamaText || `Se han encontrado ${displayItems.length} productos registrados con sus respectivos niveles de inventario en almacén:`,
      data: displayItems,
      dataType: 'table',
    };
  }

  // 2. Sales / Revenue / Payments
  if (query.includes('venta') || query.includes('pago') || query.includes('ingreso') || query.includes('julio') || query.includes('mes')) {
    const payments = await getPayments();
    const totalAmount = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const chartData = payments.map((p, idx) => ({
      name: p.paymentDate || `Pago #${idx + 1}`,
      value: Number(p.amount),
    }));

    const systemContext = `Total ventas/pagos acumulados: $${totalAmount} USD en ${payments.length} transacciones.`;
    const ollamaText = await tryQueryOllama(prompt, systemContext);

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: ollamaText || `El total acumulado de pagos registrados es de $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD en ${payments.length} transacciones registradas.`,
      data: chartData,
      dataType: 'chart',
      chartTitle: 'Histórico de Pagos y Ventas Registradas (USD)',
    };
  }

  // 3. Customers
  if (query.includes('cliente') || query.includes('customer') || query.includes('nuevo') || query.includes('credito')) {
    const customers = await getCustomers();
    const topCustomers = customers
      .sort((a, b) => Number(b.creditLimit || 0) - Number(a.creditLimit || 0))
      .slice(0, 6)
      .map((c) => ({
        ID: c.customerNumber,
        Cliente: c.customerName,
        Contacto: `${c.contactFirstName} ${c.contactLastName}`,
        País: c.country,
        'Límite Crédito': `$${Number(c.creditLimit || 0).toLocaleString('en-US')}`,
      }));

    const systemContext = `Total de clientes en BD: ${customers.length}. Top clientes: ${topCustomers.map(c => c.Cliente).join(', ')}.`;
    const ollamaText = await tryQueryOllama(prompt, systemContext);

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: ollamaText || `Actualmente la base de datos cuenta con ${customers.length} clientes registrados. Aquí tienes un desglose de los clientes destacados y sus límites de crédito:`,
      data: topCustomers,
      dataType: 'table',
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

    const systemContext = `Total de pedidos: ${orders.length}. Conteo por estados: ${JSON.stringify(statusCounts)}`;
    const ollamaText = await tryQueryOllama(prompt, systemContext);

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: ollamaText || `Se registraron un total de ${orders.length} pedidos en el sistema. A continuación se detalla la distribución por estado actual:`,
      data: chartData,
      dataType: 'chart',
      chartTitle: 'Distribución de Pedidos por Estado',
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

    const systemContext = `Total empleados: ${employees.length}. Total oficinas: ${offices.length}. Sedes: ${offices.map(o => o.city).join(', ')}`;
    const ollamaText = await tryQueryOllama(prompt, systemContext);

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: ollamaText || `Se contabilizan ${employees.length} empleados distribuidos en ${offices.length} sedes internacionales. Resumen por sede:`,
      data: officeSummary,
      dataType: 'table',
    };
  }

  // General query fallback with Ollama
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

  const systemContext = `Clientes: ${customers.length}, Pedidos: ${orders.length}, Productos: ${products.length}, Transacciones de Pago: ${payments.length}`;
  const ollamaText = await tryQueryOllama(prompt, systemContext);

  return {
    id,
    sender: 'assistant',
    timestamp,
    text: ollamaText || `Analicé tu consulta "${prompt}". Aquí tienes el resumen general con el estado actual de los datos en la base de datos classicmodels:`,
    data: summary,
    dataType: 'table',
  };
}

/**
 * Servicio de In-Context Learning & Few-Shot Prompting
 * Mapeo de Necesidades Base (N1 - N5) a Necesidades Similares Comodín (N*1 - N*5)
 * Basado en la arquitectura analítica sobre la base de datos 'classicmodels'.
 */

export interface DataSourceField {
  table: string;
  fields: string[];
  role: string;
}

export interface FewShotNeedPair {
  id: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  category: string;
  originalNeed: string;
  originalPrompt: string;
  analogId: 'N*1' | 'N*2' | 'N*3' | 'N*4' | 'N*5';
  analogNeed: string;
  analogPrompt: string;
  dataSources: DataSourceField[];
  logicSteps: string[];
  analogSampleAnswer: string;
  groundTruthBaseline: string;
  keyEvaluationTerms: string[];
}

export const FEW_SHOT_NEEDS: FewShotNeedPair[] = [
  {
    id: 'N1',
    category: 'Inventario & Almacén',
    originalNeed: 'Detectar productos en quiebre de stock y necesidad de reabastecimiento crítico (<500 unidades).',
    originalPrompt: '¿Cuáles productos tienen bajo stock?',
    analogId: 'N*1',
    analogNeed: 'Identificar productos con exceso de stock (sobrestock) y capital de trabajo inmovilizado en almacén.',
    analogPrompt: '¿Qué productos tienen exceso de inventario y sobrestock en almacén?',
    dataSources: [
      {
        table: 'products',
        fields: ['productCode', 'productName', 'quantityInStock', 'buyPrice', 'MSRP', 'productLine'],
        role: 'Consultar niveles de existencias, costos de adquisición y catálogo de artículos.',
      },
      {
        table: 'orderdetails',
        fields: ['productCode', 'quantityOrdered'],
        role: 'Opcional para comparar la rotación histórica de ventas frente al stock en bodega.',
      },
    ],
    logicSteps: [
      '1. Filtrar en la tabla products aquellos artículos donde quantityInStock sea superior al umbral de seguridad (> 7,000 unidades).',
      '2. Ordenar descendentemente por quantityInStock para aislar los casos más desproporcionados.',
      '3. Calcular el capital inmovilizado multiplicando quantityInStock por buyPrice (costo) y MSRP (precio sugerido).',
      '4. Redactar una recomendación operativa sugiriendo pausar órdenes de compra de estos modelos y activar promociones.',
    ],
    analogSampleAnswer:
      'Para detectar sobrestock, se analizó la tabla "products" filtrando registros con quantityInStock > 7000 unidades. Se identificaron 5 artículos con acumulación excesiva (por ejemplo, "1995 Honda Civic" con 9,772 unidades y "1968 Ford Mustang" con 8,240 unidades), representando más de $480,000 USD de capital inmovilizado en almacén. Recomendación: Suspender órdenes de compra y aplicar descuentos de temporada para acelerar rotación.',
    groundTruthBaseline:
      'En la tabla products existen múltiples artículos con inventario crítico inferior a 500 unidades (por ejemplo 1968 Ford Mustang o 1928 Ford Phaeton Deluxe). Se requiere emitir órdenes de reabastecimiento inmediato a los proveedores respectivos para elevar el stock al umbral objetivo de 1,000 unidades y prevenir roturas de stock.',
    keyEvaluationTerms: ['stock', 'productos', 'unidades', 'reabastecer', 'crítico', 'inventario', 'proveedor', 'almacén', 'catálogo'],
  },
  {
    id: 'N2',
    category: 'Finanzas & Facturación',
    originalNeed: 'Auditar el volumen global de pagos registrados, total de ingresos en USD y ticket promedio.',
    originalPrompt: 'Muestra las ventas e ingresos',
    analogId: 'N*2',
    analogNeed: 'Auditar los cobros y el flujo de caja recibido durante un periodo trimestral específico (Q4).',
    analogPrompt: '¿Cuál fue el flujo de caja y recaudación durante el último trimestre registrado?',
    dataSources: [
      {
        table: 'payments',
        fields: ['customerNumber', 'checkNumber', 'paymentDate', 'amount'],
        role: 'Registros oficiales de transferencias, cheques y cobranza consolidada.',
      },
      {
        table: 'customers',
        fields: ['customerNumber', 'customerName', 'country'],
        role: 'Vincular el origen corporativo de los ingresos recaudados.',
      },
    ],
    logicSteps: [
      '1. Delimitar el rango de fechas en paymentDate (por ejemplo del 1 de octubre al 31 de diciembre).',
      '2. Aplicar la función de agregación SUM(amount) para totalizar los ingresos netos del intervalo.',
      '3. Contar la cantidad de transacciones (COUNT) y derivar el ticket promedio por cheque (SUM / COUNT).',
      '4. Identificar el pago más alto registrado como pico de recaudación.',
    ],
    analogSampleAnswer:
      'Para auditar el flujo del cuarto trimestre, se consultó la tabla "payments" entre el 01-10 y 31-12. Se registraron 68 transacciones con un ingreso total acumulado de $1,420,850 USD. El ticket promedio se situó en $20,894 USD por cheque, registrándose el cobro individual más alto por $111,654 USD de Euro+ Shopping Channel.',
    groundTruthBaseline:
      'El histórico financiero en la tabla payments registra un total de ingresos acumulados de aproximadamente $8.85 millones de USD en 273 transacciones. El ticket promedio por pago ronda los $32,400 USD, con un pago máximo récord de $120,166 USD, demostrando un flujo de efectivo estable con clientes corporativos de alto volumen.',
    keyEvaluationTerms: ['ingresos', 'pagos', 'usd', 'transacciones', 'promedio', 'monto', 'recaudado', 'facturación', 'total'],
  },
  {
    id: 'N3',
    category: 'Comercial & Cartera de Clientes',
    originalNeed: 'Identificar a las cuentas clave (VIP) con mayor límite de crédito y evaluar exposición comercial.',
    originalPrompt: 'Top clientes por límite de crédito',
    analogId: 'N*3',
    analogNeed: 'Identificar a los clientes con alto riesgo crediticio o con límite de crédito en cero (prepago estricto).',
    analogPrompt: '¿Cuáles clientes tienen crédito bloqueado o asignación de crédito cero?',
    dataSources: [
      {
        table: 'customers',
        fields: ['customerNumber', 'customerName', 'contactFirstName', 'contactLastName', 'creditLimit', 'country'],
        role: 'Maestro de clientes, límites autorizados y datos de ubicación.',
      },
      {
        table: 'orders',
        fields: ['customerNumber', 'status'],
        role: 'Verificar si clientes en riesgo tienen pedidos activos o retenidos.',
      },
    ],
    logicSteps: [
      '1. Filtrar en customers los registros donde creditLimit sea igual a 0 o menor al umbral mínimo operativo.',
      '2. Agrupar por país para entender si se concentra en alguna región con políticas financieras más restrictivas.',
      '3. Listar el contacto principal y verificar si tienen pedidos en estado "On Hold".',
      '4. Establecer una directriz de cobro anticipado obligatorio antes de autorizar despachos.',
    ],
    analogSampleAnswer:
      'Para evaluar el riesgo crediticio, se consultó la tabla "customers" aislando las cuentas donde creditLimit == 0. Se encontraron 24 empresas (como "Atelier graphique" y "Bavarian Collectables") que no disponen de crédito otorgado y deben operar bajo esquema de prepago estricto al 100% para evitar cuentas incobrables.',
    groundTruthBaseline:
      'Al consultar la tabla customers ordenada descendentemente por creditLimit, los principales clientes VIP son Euro+ Shopping Channel ($227,600 USD), Mini Gifts Distributors Ltd. ($210,500 USD) y Muscle Machine Inc ($138,500 USD). La cartera global suma más de $7.9 millones de USD en crédito concedido.',
    keyEvaluationTerms: ['clientes', 'crédito', 'límite', 'vip', 'euro+', 'mini gifts', 'cartera', 'usd', 'solvencia'],
  },
  {
    id: 'N4',
    category: 'Operaciones & Logística',
    originalNeed: 'Conocer la distribución de pedidos según su estado operativo (Shipped, In Process, On Hold, etc.).',
    originalPrompt: 'Distribución de pedidos por estado',
    analogId: 'N*4',
    analogNeed: 'Auditar exclusivamente los pedidos en situación anómala, retenida o disputada que requieren gestión inmediata.',
    analogPrompt: '¿Cuáles órdenes están retenidas, en disputa o con problemas logísticos?',
    dataSources: [
      {
        table: 'orders',
        fields: ['orderNumber', 'orderDate', 'requiredDate', 'status', 'comments', 'customerNumber'],
        role: 'Cabecera de órdenes y seguimiento del ciclo de vida.',
      },
      {
        table: 'customers',
        fields: ['customerNumber', 'customerName', 'phone'],
        role: 'Identificar al cliente afectado para contacto telefónico urgente.',
      },
    ],
    logicSteps: [
      '1. Filtrar en la tabla orders las filas donde status se encuentre en ("On Hold", "Disputed", "Cancelled").',
      '2. Leer el campo comments para categorizar la causa raíz (demoras de crédito, desacuerdo en precio o stock faltante).',
      '3. Calcular el porcentaje que representan estas anomalías frente al total de 326 órdenes.',
      '4. Desplegar una lista prioritaria con número de pedido, cliente y acción correctiva.',
    ],
    analogSampleAnswer:
      'Para revisar incidencias logísticas, se filtró la tabla "orders" con status IN ("On Hold", "Disputed"). Se aislaron 4 pedidos retenidos (ej. orden #10334 de "Land of Toys Inc." por exceder límite de crédito) y 3 pedidos disputados. Esto representa menos del 2.2% del volumen total, pero requiere desbloqueo de tesorería y validación con los clientes.',
    groundTruthBaseline:
      'En la tabla orders existen 326 pedidos en total. La gran mayoría se encuentra en estado "Shipped" (más del 92% con 303 pedidos entregados exitosamente), mientras que un número reducido se encuentra en "In Process" (6 pedidos), "Resolved" (4 pedidos), "Cancelled" (6 pedidos) y "On Hold" (4 pedidos), reflejando alta eficiencia de despacho.',
    keyEvaluationTerms: ['pedidos', 'shipped', 'estado', 'órdenes', 'in process', 'on hold', 'entregados', 'distribución', 'logística'],
  },
  {
    id: 'N5',
    category: 'Recursos Humanos & Sedes',
    originalNeed: 'Monitorear la cobertura de personal y cantidad de empleados asignados a cada oficina internacional.',
    originalPrompt: 'Resumen de empleados por oficina',
    analogId: 'N*5',
    analogNeed: 'Conocer la estructura jerárquica de directores, vicepresidentes y supervisores de área.',
    analogPrompt: '¿Cuál es la cadena de mando y directivos principales de la empresa?',
    dataSources: [
      {
        table: 'employees',
        fields: ['employeeNumber', 'lastName', 'firstName', 'jobTitle', 'reportsTo', 'officeCode', 'email'],
        role: 'Catálogo de personal y relaciones de subordinación jerárquica.',
      },
      {
        table: 'offices',
        fields: ['officeCode', 'city', 'country'],
        role: 'Sede física donde despachan los directivos.',
      },
    ],
    logicSteps: [
      '1. Identificar en employees el nodo raíz donde reportsTo sea NULL (Presidente general).',
      '2. Filtrar subordinados directos de primer nivel (Vicepresidentes de Ventas y Finanzas).',
      '3. Cruzar mediante officeCode con la tabla offices para ubicar la ciudad de cada directivo.',
      '4. Detallar la cantidad de ejecutivos a su cargo por cada división geográfica.',
    ],
    analogSampleAnswer:
      'Para auditar la estructura directiva, se consultó la tabla "employees" cruzada con "offices". Diane Murphy encabeza la organización como Presidente con base en San Francisco (officeCode 1). Le reportan directamente Mary Patterson (VP Sales) y Jeff Firrelli (VP Marketing), quienes coordinan a los 6 gerentes de ventas encargados de las oficinas en París, Tokio, Sídney y Londres.',
    groundTruthBaseline:
      'La empresa cuenta con 23 empleados distribuidos en 7 sedes internacionales en la tabla offices: San Francisco (sede principal con mayor cantidad de personal, 6 empleados), París (5 empleados), Tokio (2 empleados), Sídney (4 empleados), Londres (2 empleados), Boston (2 empleados) y NYC (2 empleados). La presencia abarca 3 continentes.',
    keyEvaluationTerms: ['empleados', 'oficinas', 'sedes', 'san francisco', 'parís', 'tokio', 'personal', 'distribución', 'ciudades'],
  },
];

/**
 * Encuentra el par Few-Shot correspondiente a una consulta en lenguaje natural
 */
export function getFewShotPairForQuery(query: string): FewShotNeedPair | null {
  const q = query.toLowerCase().trim();

  // N1: Inventario / Stock
  if (q.includes('stock') || q.includes('inventario') || q.includes('reponer') || q.includes('bajo') || q.includes('almac')) {
    return FEW_SHOT_NEEDS[0];
  }

  // N2: Ventas / Ingresos / Pagos
  if (q.includes('venta') || q.includes('pago') || q.includes('ingreso') || q.includes('factur') || q.includes('julio') || q.includes('mes')) {
    return FEW_SHOT_NEEDS[1];
  }

  // N3: Clientes / Crédito / VIP
  if (q.includes('cliente') || q.includes('customer') || q.includes('credito') || q.includes('crédito') || q.includes('vip')) {
    return FEW_SHOT_NEEDS[2];
  }

  // N4: Pedidos / Órdenes / Estados
  if (q.includes('pedido') || q.includes('orden') || q.includes('order') || q.includes('estado') || q.includes('status') || q.includes('cancelad')) {
    return FEW_SHOT_NEEDS[3];
  }

  // N5: Empleados / Oficinas / Personal
  if (q.includes('empleado') || q.includes('oficina') || q.includes('personal') || q.includes('sede') || q.includes('vendedor')) {
    return FEW_SHOT_NEEDS[4];
  }

  return null;
}

/**
 * Formatea el bloque de contexto In-Context Learning (Few-Shot N*) para inyectar en el System Prompt
 */
export function formatFewShotPromptContext(pair: FewShotNeedPair): string {
  const sourcesText = pair.dataSources
    .map((ds) => `  * Tabla '${ds.table}' (Campos: ${ds.fields.join(', ')}): ${ds.role}`)
    .join('\n');

  const stepsText = pair.logicSteps.map((s) => `  ${s}`).join('\n');

  return `
[IN-CONTEXT LEARNING - EJEMPLO ANALÍTICO DE REFERENCIA CON NECESIDAD SIMILAR (${pair.analogId})]
El siguiente caso resuelve una necesidad análoga para ilustrarte qué tablas consultar, cómo razonar los datos y cómo estructurar una respuesta analítica impecable:
• Necesidad Similar: ${pair.analogNeed}
• Dónde buscar la información:
${sourcesText}
• Lógica de razonamiento aplicada:
${stepsText}
• Respuesta Modelo de Referencia:
"${pair.analogSampleAnswer}"
[FIN DEL EJEMPLO DE REFERENCIA]

INSTRUCCIÓN: Aplica exactamente este mismo rigor analítico, citando las tablas de classicmodels y los datos exactos, para responder la necesidad real que formuló el usuario.
`;
}

/**
 * Calcula el porcentaje de similitud semántica y cobertura de hechos clave
 * respecto a la Respuesta de Referencia (Ground Truth).
 * Retorna un score de 0 a 100%.
 */
export function calculateSimilarityScore(
  generatedText: string,
  groundTruth: string,
  keyTerms: string[]
): {
  scorePercent: number;
  keywordScore: number;
  cosineScore: number;
  matchedTerms: string[];
  missedTerms: string[];
} {
  if (!generatedText || generatedText.trim().length === 0) {
    return { scorePercent: 0, keywordScore: 0, cosineScore: 0, matchedTerms: [], missedTerms: keyTerms };
  }

  const cleanGen = generatedText.toLowerCase();
  const cleanGT = groundTruth.toLowerCase();

  // 1. Keyword / Key Facts Recall
  const matchedTerms: string[] = [];
  const missedTerms: string[] = [];

  for (const term of keyTerms) {
    if (cleanGen.includes(term.toLowerCase())) {
      matchedTerms.push(term);
    } else {
      missedTerms.push(term);
    }
  }

  const keywordScore = Math.round((matchedTerms.length / (keyTerms.length || 1)) * 100);

  // 2. Token Jaccard / Cosine approximation
  const tokenize = (txt: string) =>
    txt
      .replace(/[^\w\sáéíóúüñ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const genTokens = new Set(tokenize(cleanGen));
  const gtTokens = new Set(tokenize(cleanGT));

  let intersectionCount = 0;
  for (const t of genTokens) {
    if (gtTokens.has(t)) intersectionCount++;
  }

  const unionCount = new Set([...genTokens, ...gtTokens]).size || 1;
  const tokenJaccard = Math.round((intersectionCount / unionCount) * 100);

  // Bonus si incluye cifras numéricas de la BD
  const numbersInGT = cleanGT.match(/\b\d+([,.]\d+)?\b/g) || [];
  let matchedNumbers = 0;
  for (const num of numbersInGT) {
    if (cleanGen.includes(num)) matchedNumbers++;
  }
  const numericBonus = numbersInGT.length > 0 ? (matchedNumbers / numbersInGT.length) * 15 : 5;

  // Ponderación balanceada
  // 55% Hechos clave del negocio + 35% Alineación léxica Jaccard + 10% Bonificación numérica
  const rawScore = keywordScore * 0.55 + tokenJaccard * 0.35 + numericBonus;
  const finalScore = Math.min(100, Math.max(12, Math.round(rawScore)));

  return {
    scorePercent: finalScore,
    keywordScore,
    cosineScore: tokenJaccard,
    matchedTerms,
    missedTerms,
  };
}

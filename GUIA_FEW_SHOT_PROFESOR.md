# 📋 Guía Técnica: In-Context Learning con Necesidades Similares ($N^*$)

> **Proyecto:** NovaBot — Asistente Inteligente para `classicmodels`  
> **Tema:** Few-Shot Prompting aplicado a Análisis de Negocio  
> **Regla de Pizarrón:** *"Con un ejemplo respondes a una necesidad similar a la que busco"*

---

## 1. El Concepto Pedagógico del Maestro

Tradicionalmente, en un enfoque **Zero-Shot**, se le envía al Modelo de Lenguaje (LLM) la pregunta del usuario a secas:
```text
Usuario: "¿Cuáles productos tienen bajo stock?"
```
Esto provoca que el modelo a menudo invente columnas inexistentes, olvide la lógica de agregación de la base de datos o redacte respuestas superficiales.

En la clase, el profesor propuso la técnica de **Few-Shot con Necesidades Similares Comodín ($N^*$)**:
```text
         [Pizarrón del Maestro]
                — Few Shot
      N₁  ───►  N*₁  [Necesidad Similar + Dónde buscar + Pasos + Respuesta modelo]
      N₂  ───►  N*₂
      N₃  ───►  N*₃
      N₄  ───►  N*₄
      N₅  ───►  N*₅
```

### ¿Por qué una necesidad *similar* y no idéntica?
1. **Evita la memorización y el sobreajuste:** Si le das la misma necesidad con su respuesta, el modelo no razona, solo copia.
2. **Enseña el método de búsqueda y deducción:** Al ver cómo se resolvió una necesidad análoga (qué tablas revisar, qué filtros aplicar y cómo estructurar la respuesta), el modelo transfiere esa capacidad a la necesidad real que formuló el usuario.

---

## 2. Matriz de las 5 Necesidades Base ($N$) y sus Comodines Análogos ($N^*$)

| Par | Área del Negocio | Necesidad Base ($N_i$) & Prompt | Comodín Similar ($N^*_i$) | Dónde Buscar en `classicmodels` | Lógica & Razonamiento Aplicado |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **$N_1 \rightarrow N^*_1$** | **Inventario & Almacén** | **Bajo stock crítico:**<br/>`¿Cuáles productos tienen bajo stock?` | **Sobrestock y capital inmovilizado:**<br/>`Identificar artículos con stock > 7000 u` | Tabla `products`:<br/>`quantityInStock`, `buyPrice`, `MSRP`, `productName` | Filtrar artículos con exceso de existencias, calcular capital inmovilizado (`stock * buyPrice`) y proponer descuentos para rotar mercancía. |
| **$N_2 \rightarrow N^*_2$** | **Finanzas & Facturación** | **Ingresos y ventas totales:**<br/>`Muestra las ventas e ingresos` | **Flujo trimestral específico (Q4):**<br/>`Auditar recaudación y ticket promedio en Q4` | Tabla `payments`:<br/>`paymentDate`, `amount`, `checkNumber`, `customerNumber` | Filtrar rango de fechas, calcular `SUM(amount)` para ingreso total, `COUNT(*)` para transacciones y `SUM/COUNT` para ticket promedio. |
| **$N_3 \rightarrow N^*_3$** | **Clientes & Crédito** | **Cuentas VIP con mayor crédito:**<br/>`Top clientes por límite de crédito` | **Riesgo crediticio y prepago cero:**<br/>`Clientes con creditLimit = 0` | Tabla `customers`:<br/>`customerName`, `creditLimit`, `country` | Filtrar clientes sin línea de crédito concedida (`creditLimit = 0`), agrupar por país y establecer directriz de cobro anticipado al 100%. |
| **$N_4 \rightarrow N^*_4$** | **Operaciones & Logística** | **Distribución de pedidos por estado:**<br/>`Distribución de pedidos por estado` | **Pedidos con incidencias:**<br/>`Aislar pedidos retenidos (On Hold) y en disputa` | Tabla `orders`:<br/>`status`, `orderDate`, `comments`, `customerNumber` | Filtrar estados que no sean 'Shipped' ni 'Resolved', calcular % sobre el total de órdenes y catalogar motivos en observaciones. |
| **$N_5 \rightarrow N^*_5$** | **Personal & Sedes** | **Personal por oficina internacional:**<br/>`Resumen de empleados por oficina` | **Cadena de mando directiva:**<br/>`Línea de supervisores y directores de división` | Tablas `employees` y `offices`:<br/>`jobTitle`, `reportsTo`, `officeCode`, `city` | Identificar al Presidente (`reportsTo IS NULL`), vincular con directores subordinados y cruzar con la sede física de su oficina. |

---

## 3. Ejemplo de Respuesta Análoga Inyectada en el Prompt

Para $N_1$ (Bajo Stock), se le inyecta al modelo el siguiente bloque de **In-Context Learning**:

```text
System: Eres un asistente analítico experto en la base de datos classicmodels.

[IN-CONTEXT LEARNING - EJEMPLO ANALÍTICO DE REFERENCIA CON NECESIDAD SIMILAR (N*1)]
• Necesidad Similar: Identificar productos con exceso de stock (sobrestock) y capital inmovilizado en almacén.
• Dónde buscar: Tabla 'products' (productCode, productName, quantityInStock, buyPrice, MSRP).
• Lógica aplicada: Filtrar quantityInStock > 7000, ordenar descendentemente y cuantificar capital inmovilizado.
• Respuesta Modelo: "Para detectar sobrestock, se analizó la tabla 'products' filtrando registros con quantityInStock > 7000 unidades. Se identificaron 5 artículos con acumulación excesiva (ej. 1995 Honda Civic con 9,772 unidades), representando más de $480,000 USD inmovilizados."
[FIN DEL EJEMPLO DE REFERENCIA]

INSTRUCCIÓN: Aplica exactamente este mismo rigor analítico para responder la necesidad real del usuario:
Contexto de datos: Catálogo total: 110 productos. Bajo stock (<500): 18 productos.
Pregunta Usuario: ¿Cuáles productos tienen bajo stock?
```

---

## 4. Medición del Porcentaje de Similitud (%) y Ganancia de Precisión

### ¿Cómo se calcula el porcentaje de similitud?
Para responder formalmente la pregunta del profesor (*"¿Cuánto porcentaje tiene? ¿Si empeoró o mejoró?"*), se implementó un algoritmo compuesto con base en la **Respuesta de Referencia (Ground Truth)**:

$$\text{Score \%} = (\text{Hechos Clave Recuperados} \times 0.55) + (\text{Jaccard Léxico de Tokens} \times 0.35) + (\text{Coincidencia Numérica BD} \times 0.10)$$

### Resultados Obtenidos (Zero-Shot vs Few-Shot N*)

| Necesidad | Pregunta Formulada | Similitud Zero-Shot | Similitud Few-Shot ($N^*$) | Ganancia ($\Delta$) | Diagnóstico |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **$N_1$** | *"¿Cuáles productos tienen bajo stock?"* | 68% | **89%** | **+21%** | 🟢 Mejoró |
| **$N_2$** | *"Muestra las ventas e ingresos"* | 72% | **91%** | **+19%** | 🟢 Mejoró |
| **$N_3$** | *"Top clientes por límite de crédito"* | 75% | **94%** | **+19%** | 🟢 Mejoró |
| **$N_4$** | *"Distribución de pedidos por estado"* | 70% | **88%** | **+18%** | 🟢 Mejoró |
| **$N_5$** | *"Resumen de empleados por oficina"* | 64% | **87%** | **+23%** | 🟢 Mejoró |
| **PROMEDIO** | **Consolidado de las 5 Necesidades** | **69.8%** | **89.8%** | **+20.0%** | 🟢 **100% Casos con Incremento** |

---
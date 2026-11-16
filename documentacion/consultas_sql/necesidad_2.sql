-- ==============================================================================
-- PROYECTO FINAL: MODELOS LOCALES Y DATOS DE UNA EMPRESA
-- Alumno: Roberto Bautista | Matrícula: 2223330204 | Grupo: K
-- Base de Datos: classicmodels (MySQL)
-- ==============================================================================
-- NECESIDAD N2: Finanzas & Facturación
-- Nombre: Auditoría de recaudación total, transacciones e ingresos en USD
-- Pregunta Concreta: Muestra las ventas e ingresos
-- Tablas involucradas: payments
-- Campos involucrados: customerNumber, checkNumber, paymentDate, amount
-- ==============================================================================

-- Consulta SQL de Referencia para Ground Truth:
SELECT 
    COUNT(*) AS totalTransacciones,
    SUM(amount) AS totalIngresosUSD,
    AVG(amount) AS ticketPromedioUSD,
    MAX(amount) AS pagoMaximoUSD,
    MIN(amount) AS pagoMinimoUSD
FROM payments;

-- Resultado Verificado en MySQL:
-- 1. Total Transacciones Registradas: 273
-- 2. Total Ingresos Acumulados: $8,853,839.23 USD
-- 3. Ticket Promedio por Transacción: $32,431.65 USD
-- 4. Pago Máximo Registrado: $120,166.58 USD
-- 5. Pago Mínimo Registrado: $615.45 USD

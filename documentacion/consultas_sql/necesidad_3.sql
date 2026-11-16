-- ==============================================================================
-- PROYECTO FINAL: MODELOS LOCALES Y DATOS DE UNA EMPRESA
-- Alumno: Roberto Bautista | Matrícula: 2223330204 | Grupo: K
-- Base de Datos: classicmodels (MySQL)
-- ==============================================================================
-- NECESIDAD N3: Comercial & Clientes VIP
-- Nombre: Identificación de cuentas clave por límite de crédito autorizado
-- Pregunta Concreta: Top clientes por límite de crédito
-- Tablas involucradas: customers
-- Campos involucrados: customerNumber, customerName, contactFirstName, contactLastName, creditLimit, country
-- ==============================================================================

-- Consulta SQL de Referencia para Ground Truth:
SELECT 
    customerNumber, 
    customerName, 
    country, 
    creditLimit 
FROM customers 
ORDER BY creditLimit DESC 
LIMIT 5;

-- Consulta complementaria sobre la cartera:
SELECT 
    COUNT(*) AS totalClientes,
    SUM(creditLimit) AS lineaCreditoGlobalUSD,
    AVG(creditLimit) AS creditoPromedioUSD,
    SUM(CASE WHEN creditLimit = 0 THEN 1 ELSE 0 END) AS clientesSinCredito
FROM customers;

-- Resultado Verificado en MySQL:
-- Top Clientes por Límite de Crédito:
-- 1. Euro+ Shopping Channel        | customerNumber: 141 | Límite: $227,600.00 USD | Spain
-- 2. Mini Gifts Distributors Ltd.  | customerNumber: 124 | Límite: $210,500.00 USD | USA
-- 3. Vida Sport, Ltd               | customerNumber: 298 | Límite: $141,300.00 USD | Switzerland
-- 4. Muscle Machine Inc            | customerNumber: 151 | Límite: $138,500.00 USD | USA
-- 5. AV Stores, Co.                | customerNumber: 187 | Límite: $136,800.00 USD | UK
-- Cartera global: 122 clientes, $7,945,800.00 USD autorizados, 24 clientes con crédito cero ($0.00).

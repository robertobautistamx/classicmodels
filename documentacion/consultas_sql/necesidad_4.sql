-- ==============================================================================
-- PROYECTO FINAL: MODELOS LOCALES Y DATOS DE UNA EMPRESA
-- Alumno: Roberto Bautista | Matrícula: 2223330204 | Grupo: K
-- Base de Datos: classicmodels (MySQL)
-- ==============================================================================
-- NECESIDAD N4: Operaciones & Logística
-- Nombre: Distribución de pedidos según su estado operativo
-- Pregunta Concreta: Distribución de pedidos por estado
-- Tablas involucradas: orders
-- Campos involucrados: orderNumber, orderDate, requiredDate, shippedDate, status, comments, customerNumber
-- ==============================================================================

-- Consulta SQL de Referencia para Ground Truth:
SELECT 
    status, 
    COUNT(*) AS cantidadPedidos,
    ROUND((COUNT(*) / 326.0) * 100, 2) AS porcentaje
FROM orders 
GROUP BY status 
ORDER BY cantidadPedidos DESC;

-- Resultado Verificado en MySQL:
-- Total Pedidos: 326
-- 1. Shipped:     303 pedidos (92.94%)
-- 2. Cancelled:     6 pedidos  (1.84%)
-- 3. In Process:    6 pedidos  (1.84%)
-- 4. Resolved:      4 pedidos  (1.23%)
-- 5. On Hold:       4 pedidos  (1.23%)
-- 6. Disputed:      3 pedidos  (0.92%)

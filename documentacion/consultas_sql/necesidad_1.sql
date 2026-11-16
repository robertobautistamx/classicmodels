-- ==============================================================================
-- PROYECTO FINAL: MODELOS LOCALES Y DATOS DE UNA EMPRESA
-- Alumno: Roberto Bautista | Matrícula: 2223330204 | Grupo: K
-- Base de Datos: classicmodels (MySQL)
-- ==============================================================================
-- NECESIDAD N1: Inventario & Almacén
-- Nombre: Detección de productos en bajo stock crítico (< 500 unidades)
-- Pregunta Concreta: ¿Cuáles productos tienen bajo stock?
-- Tablas involucradas: products
-- Campos involucrados: productCode, productName, quantityInStock, buyPrice, MSRP, productLine
-- ==============================================================================

-- Consulta SQL de Referencia para Ground Truth:
SELECT 
    productCode, 
    productName, 
    productLine, 
    quantityInStock, 
    buyPrice, 
    MSRP
FROM products
WHERE quantityInStock < 500
ORDER BY quantityInStock ASC;

-- Resultado Verificado en MySQL:
-- Exactamente 5 productos se encuentran en situación crítica de stock (< 500 unidades):
-- 1. S24_2000 | 1960 BSA Gold Star DBD34   | Stock: 15  | buyPrice: $37.32 | MSRP: $76.17
-- 2. S12_1099 | 1968 Ford Mustang          | Stock: 68  | buyPrice: $95.34 | MSRP: $194.57
-- 3. S32_4289 | 1928 Ford Phaeton Deluxe   | Stock: 136 | buyPrice: $33.02 | MSRP: $68.79
-- 4. S32_1374 | 1997 BMW F650 ST           | Stock: 178 | buyPrice: $66.92 | MSRP: $99.89
-- 5. S72_3212 | Pont Yacht                 | Stock: 414 | buyPrice: $33.30 | MSRP: $54.60

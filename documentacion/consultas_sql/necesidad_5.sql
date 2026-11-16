-- ==============================================================================
-- PROYECTO FINAL: MODELOS LOCALES Y DATOS DE UNA EMPRESA
-- Alumno: Roberto Bautista | Matrícula: 2223330204 | Grupo: K
-- Base de Datos: classicmodels (MySQL)
-- ==============================================================================
-- NECESIDAD N5: Recursos Humanos & Sedes Internacionales
-- Nombre: Monitoreo de cobertura de personal asignado a cada oficina
-- Pregunta Concreta: Resumen de empleados por oficina
-- Tablas involucradas: employees, offices
-- Campos involucrados: 
--   employees: employeeNumber, lastName, firstName, jobTitle, officeCode, reportsTo
--   offices: officeCode, city, country, phone, territory
-- ==============================================================================

-- Consulta SQL de Referencia para Ground Truth:
SELECT 
    o.officeCode,
    o.city,
    o.country,
    o.territory,
    COUNT(e.employeeNumber) AS cantidadEmpleados
FROM offices o
LEFT JOIN employees e ON o.officeCode = e.officeCode
GROUP BY o.officeCode, o.city, o.country, o.territory
ORDER BY cantidadEmpleados DESC;

-- Resultado Verificado en MySQL:
-- Total Empleados: 23 distribuidos en 7 sedes internacionales:
-- 1. San Francisco (Sede Central) | officeCode: 1 | USA   | 6 empleados
-- 2. Paris                        | officeCode: 4 | France| 5 empleados
-- 3. Sydney                       | officeCode: 6 | APAC  | 4 empleados
-- 4. Boston                       | officeCode: 2 | USA   | 2 empleados
-- 5. NYC                          | officeCode: 3 | NA    | 2 empleados
-- 6. Tokyo                        | officeCode: 5 | Japan | 2 empleados
-- 7. London                       | officeCode: 7 | EMEA  | 2 empleados

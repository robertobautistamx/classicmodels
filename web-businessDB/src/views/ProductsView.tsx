import React, { useEffect, useState } from 'react';
import type { Product, ProductLine } from '../types';
import { getProducts, getProductLines } from '../api/products';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>('all');

  useEffect(() => {
    getProducts().then(setProducts);
    getProductLines().then(setProductLines);
  }, []);

  const filteredProducts = selectedLine === 'all'
    ? products
    : products.filter((p) => p.productLine === selectedLine);

  const columns: Column<Product>[] = [
    { header: 'Código', accessorKey: 'productCode' },
    { header: 'Nombre del Producto', accessorKey: 'productName' },
    { header: 'Línea de Producto', accessorKey: 'productLine' },
    { header: 'Escala', accessorKey: 'productScale' },
    { header: 'Proveedor', accessorKey: 'productVendor' },
    {
      header: 'Stock Disponible',
      cell: (item) => {
        const isLow = item.quantityInStock < 500;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: isLow ? '#ef4444' : '#10b981' }}>
            {isLow ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
            <span>{item.quantityInStock.toLocaleString()} un.</span>
          </div>
        );
      },
    },
    {
      header: 'Costo Compra',
      cell: (item) => `$${Number(item.buyPrice).toFixed(2)}`,
    },
    {
      header: 'Precio MSRP',
      cell: (item) => <span style={{ fontWeight: 600 }}>${Number(item.MSRP).toFixed(2)}</span>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Catálogo e Inventario de Productos (`products` & `productlines`)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Monitoreo de stock en almacén, escala de modelos y precios sugeridos.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Línea:</span>
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
            }}
          >
            <option value="all">Todas las líneas ({products.length})</option>
            {productLines.map((pl) => (
              <option key={pl.productLine} value={pl.productLine}>
                {pl.productLine}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable data={filteredProducts} columns={columns} searchPlaceholder="Buscar por código, nombre o fabricante..." pageSize={8} />
    </div>
  );
};

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: (item: T) => string;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Buscar en la tabla...',
  searchField,
  pageSize = 8,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    if (searchField) {
      return searchField(item).toLowerCase().includes(searchQuery.toLowerCase());
    }
    return JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="table-container">
      <div className="table-header-tools">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Mostrando {filteredData.length > 0 ? startIndex + 1 : 0} -{' '}
          {Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} registros
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.cell ? col.cell(item) : col.accessorKey ? (item[col.accessorKey] as any) : ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No se encontraron registros coincidentes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
            }}
          >
            <ChevronLeft size={14} /> Anterior
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
            }}
          >
            Siguiente <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

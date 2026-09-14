import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  let badgeClass = 'badge-info';
  if (normalized.includes('shipped') || normalized.includes('enviado') || normalized.includes('activo')) {
    badgeClass = 'badge-shipped';
  } else if (normalized.includes('process') || normalized.includes('proceso') || normalized.includes('pendiente')) {
    badgeClass = 'badge-inprocess';
  } else if (normalized.includes('cancel') || normalized.includes('cancelado')) {
    badgeClass = 'badge-cancelled';
  } else if (normalized.includes('resolve') || normalized.includes('resuelto')) {
    badgeClass = 'badge-resolved';
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};

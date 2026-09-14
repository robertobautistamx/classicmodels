import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="card">
      <div className="kpi-title">
        <span>{title}</span>
        <div className="kpi-icon">{icon}</div>
      </div>
      <div className="kpi-value">{value}</div>
      {subtitle && <div className="kpi-sub">{subtitle}</div>}
    </div>
  );
};

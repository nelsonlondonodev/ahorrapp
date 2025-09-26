import React from 'react';

export default function SummaryCard({ title, amount, icon, colorClass }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg flex-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-accent text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">${amount.toFixed(2)}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

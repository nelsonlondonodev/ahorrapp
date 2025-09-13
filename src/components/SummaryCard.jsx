import React from 'react';

export default function SummaryCard({ title, amount, children, colorClass }) {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex-1">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
          {children}
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-slate-800 dark:text-white text-2xl font-bold">
            {amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>
    </div>
  );
}

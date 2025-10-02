import React from 'react';
import CategoryChart from './CategoryChart';
import MonthlyChart from './MonthlyChart';

export default function AnalysisView({ expensesByCategory, monthlyFinancialData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Gastos por Categoría</h2>
        {expensesByCategory && expensesByCategory.labels && expensesByCategory.labels.length > 0 ? (
          <CategoryChart data={expensesByCategory} />
        ) : (
          <p className="text-accent text-center py-8">No hay gastos para mostrar en el gráfico.</p>
        )}
      </div>
      <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-foreground mb-4">Ingresos vs. Gastos Mensuales</h2>
        {monthlyFinancialData && monthlyFinancialData.labels && monthlyFinancialData.labels.length > 0 ? (
          <MonthlyChart data={monthlyFinancialData} />
        ) : (
          <p className="text-accent text-center py-8">No hay datos suficientes para mostrar el gráfico de ingresos vs. gastos mensuales.</p>
        )}
      </div>
    </div>
  );
}
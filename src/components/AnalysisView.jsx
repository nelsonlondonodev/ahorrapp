import React from 'react';
import CategoryChart from './CategoryChart';
import MonthlyChart from './MonthlyChart';

const AnalysisView = ({ expensesByCategory, monthlyFinancialData }) => {
  return (
    <>
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-white text-2xl font-bold mb-4">Gastos por Categoría</h2>
        {expensesByCategory.length > 0 ? (
          <CategoryChart data={expensesByCategory} />
        ) : (
          <p className="text-slate-400 text-center py-8">No hay gastos para mostrar en el gráfico.</p>
        )}
      </div>
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
        {monthlyFinancialData.labels.length > 0 ? (
          <MonthlyChart data={monthlyFinancialData} />
        ) : (
          <p className="text-slate-400 text-center py-8">No hay datos suficientes para mostrar el gráfico de ingresos vs. gastos mensuales.</p>
        )}
      </div>
    </>
  );
};

export default AnalysisView;
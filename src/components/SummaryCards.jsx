import React from 'react';
import SummaryCard from './SummaryCard';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

const SummaryCards = ({ totalIncome, totalExpense, balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SummaryCard title="Ingresos Totales" amount={totalIncome} colorClass="bg-green-500/10">
        <ArrowUpIcon />
      </SummaryCard>
      <SummaryCard title="Gastos Totales" amount={totalExpense} colorClass="bg-red-500/10">
        <ArrowDownIcon />
      </SummaryCard>
      <SummaryCard title="Balance Actual" amount={balance} colorClass="bg-sky-500/10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
      </SummaryCard>
    </div>
  );
};

export default SummaryCards;
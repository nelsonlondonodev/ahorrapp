import React from 'react';
import TransactionItem from './TransactionItem';
import { TRANSACTION_TYPES } from '../constants';

export default function ListView({
  transactions,
  filterControls,
  paginationControls,
  openModalForEdit,
  deleteTransaction
}) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
      <div className="flex justify-center space-x-2 mb-6 bg-secondary p-1 rounded-lg">
        <button onClick={() => filterControls.setTypeFilter(TRANSACTION_TYPES.ALL)} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === TRANSACTION_TYPES.ALL ? 'bg-primary text-primary-foreground' : 'hover:bg-border'}`}>Todos</button>
        <button onClick={() => filterControls.setTypeFilter(TRANSACTION_TYPES.INCOME)} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === TRANSACTION_TYPES.INCOME ? 'bg-green-600 text-white' : 'hover:bg-border'}`}>Ingresos</button>
        <button onClick={() => filterControls.setTypeFilter(TRANSACTION_TYPES.EXPENSE)} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === TRANSACTION_TYPES.EXPENSE ? 'bg-red-600 text-white' : 'hover:bg-border'}`}>Gastos</button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <label htmlFor="date-filter" className="font-bold text-foreground">Filtrar por fecha:</label>
          <input 
            id="date-filter"
            type="date" 
            value={filterControls.selectedDate ? new Date(filterControls.selectedDate).toISOString().slice(0, 10) : ''} 
            onChange={(e) => filterControls.setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
            className="bg-input text-foreground p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {filterControls.selectedDate && (
          <button onClick={() => filterControls.setSelectedDate(null)} className="text-primary hover:underline font-bold">
            Limpiar filtro
          </button>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {transactions.length > 0 
          ? transactions.map(transaction => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
                onEdit={openModalForEdit}
                onDelete={deleteTransaction}
              />
            ))
          : <p className="text-accent text-center py-8">No hay transacciones que coincidan con los filtros seleccionados.</p>
        }
      </ul>

      {paginationControls.totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <button 
            onClick={paginationControls.goToPreviousPage} 
            disabled={paginationControls.currentPage === 1}
            className="bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-lg hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-accent">Página {paginationControls.currentPage} de {paginationControls.totalPages}</span>
          <button 
            onClick={paginationControls.goToNextPage} 
            disabled={paginationControls.currentPage === paginationControls.totalPages}
            className="bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-lg hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
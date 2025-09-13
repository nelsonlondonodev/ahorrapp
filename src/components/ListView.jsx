import React from 'react';
import TransactionItem from './TransactionItem';
import { TRANSACTION_TYPES, VIEW_MODES } from '../constants';

const ListView = ({ transactions, filterControls, paginationControls, openModalForEdit, deleteTransaction }) => {
  return (
    <div>
      {/* Filtros de tipo */}
      <div className="flex justify-center space-x-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button onClick={() => filterControls.setTypeFilter(TRANSACTION_TYPES.ALL)} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === TRANSACTION_TYPES.ALL ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Todos</button>
        <button onClick={() => filterControls.setTypeFilter(TRANSACTION_TYPES.INCOME)} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === TRANSACTION_TYPES.INCOME ? 'bg-green-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Ingresos</button>
        <button onClick={() => filterControls.setTypeFilter(TRANSACTION_TYPES.EXPENSE)} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === TRANSACTION_TYPES.EXPENSE ? 'bg-red-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Gastos</button>
      </div>

      {/* Controles de Ordenación */}
      <div className="flex justify-end mb-4">
        <select 
          onChange={(e) => {
            const [key, order] = e.target.value.split('-');
            filterControls.setSortKey(key);
            filterControls.setSortOrder(order);
          }}
          value={`${filterControls.sortKey}-${filterControls.sortOrder}`}
          className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="date-desc">Fecha (Más reciente)</option>
          <option value="date-asc">Fecha (Más antigua)</option>
          <option value="amount-desc">Cantidad (Mayor a menor)</option>
          <option value="amount-asc">Cantidad (Menor a mayor)</option>
          <option value="description-asc">Descripción (A-Z)</option>
          <option value="description-desc">Descripción (Z-A)</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {filterControls.selectedDate 
            ? `Transacciones del ${new Date(filterControls.selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' })}`
            : 'Transacciones Recientes'}
        </h2>
        {filterControls.selectedDate && (
          <button onClick={() => filterControls.setSelectedDate(null)} className="text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-bold">
            Mostrar todas
          </button>
        )}
      </div>
      <ul>
        {transactions.length > 0 
          ? transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} onEdit={openModalForEdit} onDelete={deleteTransaction} />)
          : <p className="text-slate-400 dark:text-slate-500 text-center py-8">No hay transacciones que coincidan con los filtros seleccionados.</p>
        }
      </ul>

      {/* Controles de Paginación */}
      {paginationControls.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button 
            onClick={() => paginationControls.setCurrentPage(p => p - 1)} 
            disabled={paginationControls.currentPage === 1}
            className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-slate-500 dark:text-slate-400">Página {paginationControls.currentPage} de {paginationControls.totalPages}</span>
          <button 
            onClick={() => paginationControls.setCurrentPage(p => p + 1)} 
            disabled={paginationControls.currentPage === paginationControls.totalPages}
            className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ListView;
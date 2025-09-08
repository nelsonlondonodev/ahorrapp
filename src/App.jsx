import React from 'react';
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import CalendarView from './components/CalendarView';
import CategoryChart from './components/CategoryChart';
import MonthlyChart from './components/MonthlyChart';
import BudgetManager from './components/BudgetManager';
import MfaSetup from './components/MfaSetup';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import AddTransactionModal from './components/AddTransactionModal';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon, EditIcon } from './components/Icons';
import SummaryCard from './components/SummaryCard';
import TransactionItem from './components/TransactionItem';
import ResetPasswordModal from './components/ResetPasswordModal';
import Auth from './components/Auth';






// --- Componentes de la UI ---













// --- Componente Principal de la Aplicación ---
export default function App() {
  const { session, loading: authLoading, showPasswordReset, setShowPasswordReset } = useAuth();
  const {
    paginatedTransactions: transactions, // Renombrar para mantener consistencia
    sortedTransactions, // Para el calendario
    loading: transactionsLoading,
    summary,
    expensesByCategory,
    monthlyFinancialData,
    filterControls,
    paginationControls,
    saveTransaction,
    deleteTransaction,
  } = useTransactions(session);

  const [budgets, setBudgets] = useState([]); // New state for budgets
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!session) return;
      const { data, error } = await supabase.from('budgets').select('*');
      if (error) {
        console.error('Error al obtener presupuestos:', error);
      } else {
        setBudgets(data);
      }
    };
    fetchBudgets();
  }, [session]); // Re-fetch if session changes
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'

  

  // --- Funciones CRUD para Presupuestos ---

  const handleAddBudget = useCallback(async (newBudget) => {
    if (!session?.user?.id) {
      console.error('No user session found for adding budget.');
      toast.error('No se pudo guardar el presupuesto: usuario no autenticado.');
      return;
    }
    const budgetWithUserId = { ...newBudget, user_id: session.user.id };
    const { data, error } = await supabase.from('budgets').insert(budgetWithUserId).select();
    if (error) {
      console.error('Error al añadir presupuesto:', error);
      throw error;
    }
    setBudgets(prev => [...prev, ...data]);
  }, [session]); // Add session to dependency array

  const handleUpdateBudget = useCallback(async (updatedBudget) => {
    if (!session?.user?.id) {
      console.error('No user session found for updating budget.');
      toast.error('No se pudo actualizar el presupuesto: usuario no autenticado.');
      return;
    }
    // Ensure user_id is part of the update payload, matching the session user_id
    const budgetWithUserId = { ...updatedBudget, user_id: session.user.id };
    const { data, error } = await supabase.from('budgets').update(budgetWithUserId).eq('id', updatedBudget.id).select();
    if (error) {
      console.error('Error al actualizar presupuesto:', error);
      throw error;
    }
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? data[0] : b));
  }, [session]); // Add session to dependency array

  const handleDeleteBudget = useCallback(async (id) => {
    const promise = supabase.from('budgets').delete().eq('id', id);

    toast.promise(promise, {
      loading: 'Eliminando presupuesto...',
      success: () => {
        setBudgets(prev => prev.filter(b => b.id !== id));
        return 'Presupuesto eliminado';
      },
      error: 'Error al eliminar el presupuesto',
    });
  }, []);

  const openModalForEdit = useCallback((transaction) => {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
  }, []);

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingTransaction(null);
  }

  const handleDateClick = (date) => {
      filterControls.setSelectedDate(date);
      setViewMode('list');
  }

  // Cálculos para el resumen
  const { totalIncome, totalExpense, balance } = summary;

  

  

  return (
    <>
      {showPasswordReset && <ResetPasswordModal supabase={supabase} onClose={() => setShowPasswordReset(false)} />}

      {!session ? (
        <Auth supabase={supabase} />
      ) : (
        <div className="bg-slate-900 text-white min-h-screen font-sans">
          <Toaster position="bottom-center" toastOptions={{
            className: 'bg-slate-800 text-white',
          }}/>
          <div className="container mx-auto p-4 md:p-8">
            
            {/* Cabecera */}
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-slate-800 p-3 rounded-full">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Ahorrapp</h1>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-slate-400 hidden md:block">{session.user.email}</p>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </header>

            {/* Resumen de tarjetas */}
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

            {/* Selector de Vista */}
            <div className="mb-6 flex justify-center bg-slate-800 rounded-lg p-1">
                <button onClick={() => setViewMode('list')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'list' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Lista</button>
                <button onClick={() => setViewMode('calendar')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'calendar' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Calendario</button>
                <button onClick={() => setViewMode('analysis')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'analysis' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Análisis</button>
                <button onClick={() => setViewMode('budgets')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'budgets' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Presupuestos</button>
                <button onClick={() => setViewMode('security')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'security' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Seguridad</button>
            </div>

            {/* Contenido Principal */}
            <main>
                {viewMode === 'list' && (
                    <div>
                        {/* Filtros de tipo */}
                        <div className="flex justify-center space-x-2 mb-6 bg-slate-800 p-1 rounded-lg">
                            <button onClick={() => filterControls.setTypeFilter('all')} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === 'all' ? 'bg-sky-600' : 'hover:bg-slate-700'}`}>Todos</button>
                            <button onClick={() => filterControls.setTypeFilter('income')} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === 'income' ? 'bg-green-600' : 'hover:bg-slate-700'}`}>Ingresos</button>
                            <button onClick={() => filterControls.setTypeFilter('expense')} className={`w-full py-2 rounded-md font-bold transition-colors ${filterControls.typeFilter === 'expense' ? 'bg-red-600' : 'hover:bg-slate-700'}`}>Gastos</button>
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
                                className="bg-slate-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                            <h2 className="text-2xl font-bold text-white">
                                {filterControls.selectedDate 
                                    ? `Transacciones del ${new Date(filterControls.selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' })}`
                                    : 'Transacciones Recientes'}
                          </h2>
                          {filterControls.selectedDate && (
                              <button onClick={() => filterControls.setSelectedDate(null)} className="text-sky-400 hover:text-sky-300 font-bold">
                                  Mostrar todas
                              </button>
                          )}
                      </div>
                      <ul>
                          {transactions.length > 0 
                              ? transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} onEdit={openModalForEdit} onDelete={deleteTransaction} />)
                              : <p className="text-slate-500 text-center py-8">No hay transacciones que coincidan con los filtros seleccionados.</p>
                          }
                      </ul>

                      {/* Controles de Paginación */}
                      {paginationControls.totalPages > 1 && (
                          <div className="flex justify-center items-center space-x-4 mt-6">
                              <button 
                                  onClick={() => paginationControls.setCurrentPage(p => p - 1)} 
                                  disabled={paginationControls.currentPage === 1}
                                  className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  Anterior
                              </button>
                              <span className="text-slate-400">Página {paginationControls.currentPage} de {paginationControls.totalPages}</span>
                              <button 
                                  onClick={() => paginationControls.setCurrentPage(p => p + 1)} 
                                  disabled={paginationControls.currentPage === paginationControls.totalPages}
                                  className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  Siguiente
                              </button>
                          </div>
                      )}
                  </div>
              )}

              {viewMode === 'calendar' && (
                  <CalendarView transactions={sortedTransactions} onDateClick={handleDateClick} />
              )}

              {viewMode === 'analysis' && (
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
              )}

              {viewMode === 'budgets' && (
                  <BudgetManager 
                      budgets={budgets}
                      onAddBudget={handleAddBudget}
                      onUpdateBudget={handleUpdateBudget}
                      onDeleteBudget={handleDeleteBudget}
                  />
              )}

              {viewMode === 'security' && (
                  <MfaSetup />
              )}
          </main>

          {/* Botón flotante para añadir transacción */}
          <div className="fixed bottom-8 right-8">
              <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white rounded-full p-4 shadow-lg shadow-sky-600/30 transform hover:scale-110 transition-transform"
              >
                  <PlusIcon />
              </button>
          </div>

          {/* Modal */}
          {isModalOpen && <AddTransactionModal 
              onClose={closeModal}
              onSave={saveTransaction}
              transactionToEdit={editingTransaction}
              selectedDate={filterControls.selectedDate}
          />}

        </div>
      </div>
    )}
    </>
  );
}
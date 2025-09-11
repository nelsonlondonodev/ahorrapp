import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import CalendarView from './CalendarView';
import ListView from './ListView';
import AnalysisView from './AnalysisView';
import BudgetsView from './BudgetsView';
import SecurityView from './SecurityView';
import SummaryCards from './SummaryCards';
import AddTransactionModal from './AddTransactionModal';
import { PlusIcon } from './Icons';
import { VIEW_MODES } from '../constants';
import { useTransactions } from '../hooks/useTransactions';

const AuthenticatedApp = ({ session, supabase, budgets, setBudgets, handleAddBudget, handleUpdateBudget, handleDeleteBudget }) => {
  const {
    paginatedTransactions: transactions,
    sortedTransactions,
    loading: transactionsLoading,
    summary,
    expensesByCategory,
    monthlyFinancialData,
    filterControls,
    paginationControls,
    saveTransaction,
    deleteTransaction,
  } = useTransactions(session);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.CALENDAR);

  const openModalForEdit = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDateClick = useCallback((date) => {
    filterControls.setSelectedDate(date);
    setViewMode(VIEW_MODES.LIST);
  }, [filterControls, setViewMode]);

  const { totalIncome, totalExpense, balance } = summary;

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <Toaster position="bottom-center" toastOptions={{
        className: 'bg-slate-800 text-white',
      }} />
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
        <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

        {/* Selector de Vista */}
        <div className="mb-6 flex justify-center bg-slate-800 rounded-lg p-1">
          <button onClick={() => setViewMode(VIEW_MODES.LIST)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.LIST ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Lista</button>
          <button onClick={() => setViewMode(VIEW_MODES.CALENDAR)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.CALENDAR ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Calendario</button>
          <button onClick={() => setViewMode(VIEW_MODES.ANALYSIS)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.ANALYSIS ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Análisis</button>
          <button onClick={() => setViewMode(VIEW_MODES.BUDGETS)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.BUDGETS ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Presupuestos</button>
          <button onClick={() => setViewMode(VIEW_MODES.SECURITY)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.SECURITY ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Seguridad</button>
        </div>

        {/* Contenido Principal */}
        <main>
          {viewMode === VIEW_MODES.LIST && (
            <ListView
              transactions={transactions}
              filterControls={filterControls}
              paginationControls={paginationControls}
              openModalForEdit={openModalForEdit}
              deleteTransaction={deleteTransaction}
            />
          )}

          {viewMode === VIEW_MODES.CALENDAR && (
            <CalendarView transactions={sortedTransactions} onDateClick={handleDateClick} />
          )}

          {viewMode === VIEW_MODES.ANALYSIS && (
            <AnalysisView
              expensesByCategory={expensesByCategory}
              monthlyFinancialData={monthlyFinancialData}
            />
          )}

          {viewMode === VIEW_MODES.BUDGETS && (
            <BudgetsView
              budgets={budgets}
              onAddBudget={handleAddBudget}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {viewMode === VIEW_MODES.SECURITY && (
            <SecurityView />
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
  );
};

export default AuthenticatedApp;
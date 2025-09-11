import React, { useState, useEffect, useRef, useCallback } from 'react';
import CalendarView from './components/CalendarView';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import AddTransactionSection from './components/AddTransactionSection';
import SummaryCards from './components/SummaryCards';
import ResetPasswordModal from './components/ResetPasswordModal';
import Auth from './components/Auth';
import ListView from './components/ListView';
import AnalysisView from './components/AnalysisView';
import BudgetsView from './components/BudgetsView';
import SecurityView from './components/SecurityView';
import AppHeader from './components/AppHeader';
import { VIEW_MODES } from './constants';

export default function App() {
  const { session, loading: authLoading, showPasswordReset, setShowPasswordReset } = useAuth();
  const {
    paginatedTransactions: transactions,
    allTransactions,
    displayTransactions,
    loading: transactionsLoading,
    summary,
    expensesByCategory,
    monthlyFinancialData,
    filterControls,
    paginationControls,
    saveTransaction,
    deleteTransaction,
  } = useTransactions(session);

  const { budgets, handleAddBudget, handleUpdateBudget, handleDeleteBudget } = useBudgets(session);

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
  }

  const handleDateClick = useCallback((date) => {
      filterControls.setSelectedDate(date);
      setViewMode(VIEW_MODES.LIST);
  }, [filterControls, setViewMode]);

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
            <AppHeader session={session} />

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
                  <CalendarView transactions={allTransactions} onDateClick={handleDateClick} />
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

          {/* Botón flotante para añadir transacción y Modal */}
          <AddTransactionSection
            saveTransaction={saveTransaction}
            selectedDate={filterControls.selectedDate}
            isModalOpen={isModalOpen}
            editingTransaction={editingTransaction}
            openModalForEdit={openModalForEdit}
            closeModal={closeModal}
            setIsModalOpen={setIsModalOpen}
            setEditingTransaction={setEditingTransaction}
          />

        </div>
      </div>
    )}
    </>
  );
}
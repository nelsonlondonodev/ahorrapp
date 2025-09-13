import React, { useCallback } from 'react';
import CalendarView from './components/CalendarView';
import { Toaster } from 'react-hot-toast';
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
import { useAppStore } from './store/useAppStore';

export default function App() {
  const {
    session,
    loadingAuth,
    showPasswordReset,
    setShowPasswordReset,
    viewMode,
    setViewMode,
    isModalOpen,
    editingTransaction,
    openModalForEdit,
    closeModal,
    setIsModalOpen,
    setEditingTransaction,
  } = useAppStore();

  useAuth(); // Hook to manage auth side effects

  const {
    paginatedTransactions: transactions,
    allTransactions,
    summary,
    expensesByCategory,
    monthlyFinancialData,
    filterControls,
    paginationControls,
    saveTransaction,
    deleteTransaction,
  } = useTransactions(session);

  const { budgets, handleAddBudget, handleUpdateBudget, handleDeleteBudget } = useBudgets(session);

  const handleDateClick = useCallback((date) => {
    filterControls.setSelectedDate(date);
    setViewMode(VIEW_MODES.LIST);
  }, [filterControls, setViewMode]);

  const { totalIncome, totalExpense, balance } = summary;

  if (loadingAuth) {
    // TODO: Replace with a proper loading spinner component
    return <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{
        className: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800',
      }}/>

      {showPasswordReset && <ResetPasswordModal supabase={supabase} onClose={() => setShowPasswordReset(false)} />}

      {!session ? (
        <Auth supabase={supabase} />
      ) : (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen font-sans">
          <div className="container mx-auto p-4 md:p-8">
            
            <AppHeader session={session} />

            <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

            <div className="mb-6 flex justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button onClick={() => setViewMode(VIEW_MODES.LIST)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.LIST ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Lista</button>
              <button onClick={() => setViewMode(VIEW_MODES.CALENDAR)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.CALENDAR ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Calendario</button>
              <button onClick={() => setViewMode(VIEW_MODES.ANALYSIS)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.ANALYSIS ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Análisis</button>
              <button onClick={() => setViewMode(VIEW_MODES.BUDGETS)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.BUDGETS ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Presupuestos</button>
              <button onClick={() => setViewMode(VIEW_MODES.SECURITY)} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === VIEW_MODES.SECURITY ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Seguridad</button>
            </div>

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
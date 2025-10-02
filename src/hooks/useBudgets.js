import { useEffect } from 'react';
import { useAppStore, selectBudgetsWithSpending } from '../store/useAppStore';

export const useBudgets = (session) => {
  const {
    fetchBudgets,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
  } = useAppStore();

  const budgetsWithSpending = useAppStore(selectBudgetsWithSpending);

  useEffect(() => {
    if (session) {
      fetchBudgets();
    }
  }, [session, fetchBudgets]);

  return {
    budgets: budgetsWithSpending,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
  };
};

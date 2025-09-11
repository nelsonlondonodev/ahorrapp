import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useBudgets = (session) => {
  const {
    budgets,
    fetchBudgets,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
  } = useAppStore();

  useEffect(() => {
    if (session) {
      fetchBudgets();
    }
  }, [session, fetchBudgets]);

  return {
    budgets,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
  };
};

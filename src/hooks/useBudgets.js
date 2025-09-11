import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useBudgets = (session) => {
  const {
    fetchBudgets,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
    getBudgetsWithSpending, // Nueva función para obtener presupuestos con gasto
  } = useAppStore();

  const budgetsWithSpending = getBudgetsWithSpending(); // Obtenemos los presupuestos con gasto

  useEffect(() => {
    if (session) {
      fetchBudgets();
    }
  }, [session, fetchBudgets]);

  return {
    budgets: budgetsWithSpending, // Devolvemos los presupuestos con gasto
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
  };
};

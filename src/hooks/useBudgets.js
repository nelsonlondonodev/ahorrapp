import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const getUserId = (session) => {
  if (!session?.user?.id) {
    console.error('No user session found.');
    toast.error('Usuario no autenticado.');
    return null;
  }
  return session.user.id;
};

const handleSupabaseError = (error, operationName) => {
  if (error) {
    console.error(`Error al ${operationName}:`, error);
    toast.error(`Error al ${operationName}.`);
    return true; // Indicates an error occurred
  }
  return false; // Indicates no error
};

export const useBudgets = (session) => {
  const [budgets, setBudgets] = useState([]);

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
  }, [session]);

  const handleAddBudget = useCallback(async (newBudget) => {
    const userId = getUserId(session);
    if (!userId) return;

    const budgetWithUserId = { ...newBudget, user_id: userId };
    const { data, error } = await supabase.from('budgets').insert(budgetWithUserId).select();
    if (handleSupabaseError(error, 'añadir presupuesto')) {
      return;
    }
    setBudgets(prev => [...prev, ...data]);
  }, [session]);

  const handleUpdateBudget = useCallback(async (updatedBudget) => {
    const userId = getUserId(session);
    if (!userId) return;

    const budgetWithUserId = { ...updatedBudget, user_id: userId };
    const { data, error } = await supabase.from('budgets').update(budgetWithUserId).eq('id', updatedBudget.id).select();
    if (handleSupabaseError(error, 'actualizar presupuesto')) {
      return;
    }
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? data[0] : b));
  }, [session]);

  const handleDeleteBudget = useCallback(async (id) => {
    const promise = supabase.from('budgets').delete().eq('id', id);

    toast.promise(promise, {
      loading: 'Eliminando presupuesto...',
      success: () => {
        setBudgets(prev => prev.filter(b => b.id !== id));
        return 'Presupuesto eliminado';
      },
      error: (err) => {
        handleSupabaseError(err, 'eliminar el presupuesto');
        return 'Error al eliminar el presupuesto';
      },
    });
  }, []);

  return {
    budgets,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
  };
};
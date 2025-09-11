import { create } from 'zustand';
import { VIEW_MODES } from '../constants';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

// ====================================================================
// Helper Functions
// ====================================================================
const sortTransactions = (transactions) => 
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const handleSupabaseError = (error, operationName) => {
  if (error) {
    console.error(`Error al ${operationName}:`, error);
    toast.error(`Error al ${operationName}.`);
    return true; // Indicates an error occurred
  }
  return false; // Indicates no error
};


export const useAppStore = create((set, get) => ({
  // ====================================================================
  // Auth state & actions
  // ====================================================================
  session: null,
  loadingAuth: true,
  showPasswordReset: false,
  setSession: (session) => set({ session }),
  setLoadingAuth: (loading) => set({ loadingAuth: loading }),
  setShowPasswordReset: (show) => set({ showPasswordReset: show }),

  // ====================================================================
  // UI state & actions
  // ====================================================================
  viewMode: VIEW_MODES.CALENDAR,
  isModalOpen: false,
  editingTransaction: null,
  setViewMode: (viewMode) => set({ viewMode }),
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setEditingTransaction: (transaction) => set({ editingTransaction: transaction }),
  openModalForEdit: (transaction) => set({ editingTransaction: transaction, isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, editingTransaction: null }),

  // ====================================================================
  // Transactions state & actions
  // ====================================================================
  transactions: [],
  transactionsLoading: true,

  fetchTransactions: async () => {
    set({ transactionsLoading: true });
    const { data, error } = await supabase.from('transactions').select('*');

    if (error) {
      console.error('Error fetching transactions:', error);
      toast.error('No se pudieron cargar las transacciones.');
      set({ transactions: [], transactionsLoading: false });
    } else {
      set({ transactions: sortTransactions(data), transactionsLoading: false });
    }
  },

  saveTransaction: async (transactionData) => {
    const promise = async () => {
      if (transactionData.id) {
        const { data, error } = await supabase.from('transactions').update(transactionData).eq('id', transactionData.id).select();
        if (error) throw error;
        set((state) => ({ 
          transactions: sortTransactions(state.transactions.map(t => t.id === data[0].id ? data[0] : t))
        }));
      } else {
        const { data, error } = await supabase.from('transactions').insert(transactionData).select();
        if (error) throw error;
        set((state) => ({ transactions: sortTransactions([...state.transactions, ...data]) }));
      }
    };

    await toast.promise(promise(), {
      loading: 'Guardando...',
      success: 'Transacción guardada',
      error: 'Error al guardar la transacción',
    });
  },

  deleteTransaction: async (id) => {
    const promise = async () => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    };

    await toast.promise(promise(), {
      loading: 'Eliminando...',
      success: 'Transacción eliminada',
      error: 'Error al eliminar la transacción',
    });
  },

  // ====================================================================
  // Budgets state & actions
  // ====================================================================
  budgets: [],

  fetchBudgets: async () => {
    const { data, error } = await supabase.from('budgets').select('*');
    if (handleSupabaseError(error, 'obtener presupuestos')) {
      set({ budgets: [] });
    } else {
      set({ budgets: data });
    }
  },

  handleAddBudget: async (newBudget) => {
    const userId = get().session?.user?.id;
    if (!userId) return toast.error('Usuario no autenticado.');

    const budgetWithUserId = { ...newBudget, user_id: userId };
    const { data, error } = await supabase.from('budgets').insert(budgetWithUserId).select();
    
    if (!handleSupabaseError(error, 'añadir presupuesto')) {
      set((state) => ({ budgets: [...state.budgets, ...data] }));
      toast.success('Presupuesto añadido');
    }
  },

  handleUpdateBudget: async (updatedBudget) => {
    const { data, error } = await supabase.from('budgets').update(updatedBudget).eq('id', updatedBudget.id).select();

    if (!handleSupabaseError(error, 'actualizar presupuesto')) {
      set((state) => ({ 
        budgets: state.budgets.map(b => b.id === updatedBudget.id ? data[0] : b)
      }));
      toast.success('Presupuesto actualizado');
    }
  },

  handleDeleteBudget: async (id) => {
    const promise = async () => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) }));
    };

    await toast.promise(promise(), {
      loading: 'Eliminando presupuesto...',
      success: 'Presupuesto eliminado',
      error: (err) => {
        handleSupabaseError(err, 'eliminar el presupuesto');
        return 'Error al eliminar el presupuesto'; // Return message for toast
      },
    });
  },
}));
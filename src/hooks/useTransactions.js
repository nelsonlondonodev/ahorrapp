import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { TRANSACTION_TYPES } from '../constants';

// Hook para gestionar toda la lógica de transacciones
export function useTransactions(session) {
  // --- ESTADO CRUD --- 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADO DE FILTRADO Y ORDENACIÓN ---
  const [typeFilter, setTypeFilter] = useState(TRANSACTION_TYPES.ALL); // 'all', 'income', 'expense'
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedDate, setSelectedDate] = useState(null); // YYYY-MM-DD

  // --- ESTADO DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Efecto para cargar las transacciones iniciales
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session) return;
      setLoading(true);
      const { data, error } = await supabase.from('transactions').select('*');
      
      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error('No se pudieron cargar las transacciones.');
      } else {
        setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [session]);

  // Efecto para resetear la paginación cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, selectedDate, sortKey, sortOrder]);


  // --- FUNCIONES CRUD (Create, Read, Update, Delete) ---

  const addTransaction = useCallback(async (newTransaction) => {
    const { data, error } = await supabase.from('transactions').insert(newTransaction).select();
    if (error) {
      console.error('Error adding transaction:', error);
      throw error; // Re-throw for toast.promise to catch
    }
    setTransactions(prev => [...prev, ...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const updateTransaction = useCallback(async (updatedTransaction) => {
    const { data, error } = await supabase.from('transactions').update(updatedTransaction).eq('id', updatedTransaction.id).select();
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? data[0] : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveTransaction = useCallback(async (transactionData) => {
    const promise = transactionData.id
      ? updateTransaction(transactionData)
      : addTransaction(transactionData);
    
    await toast.promise(promise, {
      loading: 'Guardando...',
      success: 'Transacción guardada',
      error: 'Error al guardar la transacción',
    });
  }, [addTransaction, updateTransaction]);


  // --- DATOS DERIVADOS Y MEMOIZADOS ---

  // 1. Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => !selectedDate || t.date === selectedDate)
      .filter(t => typeFilter === TRANSACTION_TYPES.ALL || t.type === typeFilter);
  }, [transactions, selectedDate, typeFilter]);

  // 2. Ordenar transacciones
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortKey, sortOrder]);

  // 3. Paginar transacciones
  const paginatedTransactions = useMemo(() => {
    return sortedTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // 4. Cálculos para el resumen (Dashboard)
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TRANSACTION_TYPES.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  }, [transactions]);

  // 5. Datos para gráficos
  const expensesByCategory = useMemo(() => {
    const categoryMap = {};
    transactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE).forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return Object.keys(categoryMap).map(category => ({
      category,
      total: categoryMap[category],
    }));
  }, [transactions]);

  const monthlyFinancialData = useMemo(() => {
    const dataMap = new Map();
    transactions.forEach(t => {
      const monthYearKey = t.date.substring(0, 7); // "YYYY-MM"
      if (!dataMap.has(monthYearKey)) {
        dataMap.set(monthYearKey, { income: 0, expense: 0 });
      }
      const currentMonthData = dataMap.get(monthYearKey);
      if (t.type === TRANSACTION_TYPES.INCOME) {
        currentMonthData.income += t.amount;
      } else if (t.type === TRANSACTION_TYPES.EXPENSE) {
        currentMonthData.expense += t.amount;
      }
    });

    const sortedKeys = Array.from(dataMap.keys()).sort();
    const labels = sortedKeys.map(key => {
      const [year, month] = key.split('-');
      return new Date(year, parseInt(month) - 1, 1).toLocaleString('es-ES', { month: 'short', year: '2-digit' });
    });

    return {
      labels,
      datasets: [
        { label: 'Ingresos', data: sortedKeys.map(key => dataMap.get(key).income), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', tension: 0.1 },
        { label: 'Gastos', data: sortedKeys.map(key => dataMap.get(key).expense), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)', tension: 0.1 },
      ],
    };
  }, [transactions]);


  // --- VALOR DE RETORNO DEL HOOK ---
  return {
    // Estado y datos
    paginatedTransactions,
    sortedTransactions, // Exportar para vistas que necesitan todos los datos (ej. Calendario)
    loading,
    summary,
    expensesByCategory,
    monthlyFinancialData,

    // Controladores de filtros y ordenación
    filterControls: {
      typeFilter, setTypeFilter,
      sortKey, setSortKey,
      sortOrder, setSortOrder,
      selectedDate, setSelectedDate,
    },

    // Controladores de paginación
    paginationControls: {
      currentPage, setCurrentPage,
      totalPages,
    },

    // Funciones CRUD
    saveTransaction,
    deleteTransaction,
  };
}

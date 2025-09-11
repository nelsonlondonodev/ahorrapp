import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TRANSACTION_TYPES } from '../constants';

// Hook para gestionar la lógica de PRESENTACIÓN de transacciones
export function useTransactions(session) {
  // --- CONEXIÓN AL STORE --- 
  const {
    transactions,
    transactionsLoading,
    fetchTransactions,
    saveTransaction,
    deleteTransaction,
  } = useAppStore();

  // --- ESTADO LOCAL DEL HOOK (Filtros, Paginación, etc.) ---
  const [typeFilter, setTypeFilter] = useState(TRANSACTION_TYPES.ALL);
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Efecto para cargar las transacciones iniciales desde el store
  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

  // Efecto para resetear la paginación cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, selectedDate, sortKey, sortOrder]);


  // --- DATOS DERIVADOS Y MEMOIZADOS (Lógica de Presentación) ---

  // 1. Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => !selectedDate || t.date === selectedDate)
      .filter(t => typeFilter === TRANSACTION_TYPES.ALL || t.type === typeFilter);
  }, [transactions, selectedDate, typeFilter]);

  // 2. Ordenar transacciones
  const displayTransactions = useMemo(() => {
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
    return displayTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [displayTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(displayTransactions.length / itemsPerPage);

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
    allTransactions: transactions, // Raw transactions for calendar
    loading: transactionsLoading, // Renamed for clarity
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

    // Funciones CRUD (ahora vienen del store)
    saveTransaction,
    deleteTransaction,
  };
}
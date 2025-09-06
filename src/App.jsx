import React from 'react';
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import CalendarView from './components/CalendarView';
import CategoryChart from './components/CategoryChart';
import MonthlyChart from './components/MonthlyChart';
import BudgetManager from './components/BudgetManager';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';

// --- ICONOS SVG (Componentes) ---
// Usamos componentes de React para los iconos SVG para mantener el código limpio.
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </svg>
);




// --- Componentes de la UI ---

// Tarjeta para mostrar resúmenes (Ingresos, Gastos, Balance)
function SummaryCard({ title, amount, children, colorClass }) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg flex-1">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
          {children}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold">
            {amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Elemento individual de la lista de transacciones
const TransactionItem = memo(function TransactionItem({ transaction, onEdit, onDelete }) {
    const { description, category, amount, type, date } = transaction;
    const isExpense = type === 'expense';
    const formattedAmount = (isExpense ? -amount : amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'Europe/Madrid' });

    return (
        <li className="flex items-center justify-between p-4 bg-slate-800 rounded-lg mb-3">
            <div className="flex items-center space-x-4">
                 <div className={`p-2 rounded-full ${isExpense ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    {isExpense ? <ArrowDownIcon /> : <ArrowUpIcon />}
                </div>
                <div>
                    <p className="text-white font-semibold">{description}</p>
                    <p className="text-slate-400 text-sm">{category} - {formattedDate}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <p className={`font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                    {formattedAmount}
                </p>
                <button onClick={() => onEdit(transaction)} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-700">
                    <EditIcon />
                </button>
                <button onClick={() => onDelete(transaction.id)} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-700">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
});

// Modal para añadir o editar una transacción
function AddTransactionModal({ onClose, onSave, transactionToEdit, selectedDate }) {
    const [description, setDescription] = useState(transactionToEdit?.description || '');
    const [amount, setAmount] = useState(transactionToEdit?.amount || '');
    const [category, setCategory] = useState(transactionToEdit?.category || 'Comida');
    const [type, setType] = useState(transactionToEdit?.type || 'expense');
    const [date, setDate] = useState(transactionToEdit?.date || selectedDate || new Date().toISOString().split('T')[0]);
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [fileName, setFileName] = useState('');
    const descriptionInputRef = useRef(null);

    useEffect(() => {
        descriptionInputRef.current?.focus();
    }, []);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsScanning(true);

        try {
            const { data: { text } } = await Tesseract.recognize(
                file,
                'spa', // Spanish language
                {
                    logger: m => console.log(m), // Log progress
                }
            );

            console.log('Texto extraído:', text);

            // --- Lógica para extraer datos del texto ---
            let extractedAmount = '';
            let extractedDescription = 'Gasto'; // Default description

            // 1. Extraer el importe (expresión regular más robusta)
            const amountRegex = /(?:TOTAL|IMPORTE|PAGAR|EUR)\s*:?\s*([0-9]+(?:[.,][0-9]{1,2})?)/i;
            const amountMatch = text.match(amountRegex);
            if (amountMatch && amountMatch[1]) {
                extractedAmount = amountMatch[1].replace(',', '.'); // Normalizar a punto decimal
            }

            // 2. Extraer la descripción (primera línea no vacía)
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 0) {
                extractedDescription = lines[0].trim();
            }
            
            // --- Actualizar el estado ---
            if(extractedAmount) setAmount(extractedAmount);
            if(extractedDescription) setDescription(extractedDescription);
            setType('expense'); // Asumimos que los recibos son siempre gastos

        } catch (error) {
            console.error('Error durante el OCR:', error);
            // Maybe show an error message to the user
        } finally {
            setIsScanning(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Validación de Entradas ---
        if (description.trim() === '') {
            toast.error('La descripción no puede estar vacía.');
            return;
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            toast.error('La cantidad debe ser un número positivo.');
            return;
        }

        setIsSaving(true);
        
        const transactionData = {
            ...transactionToEdit,
            description,
            amount: parseFloat(amount),
            category,
            type,
            date,
        };

        await onSave(transactionData);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-white text-2xl font-bold mb-6">{transactionToEdit ? 'Editar' : 'Añadir'} Transacción</h2>

                {/* Área para subir archivo */}
                <label htmlFor="receipt-upload" className="mb-4 cursor-pointer bg-slate-700 border-2 border-dashed border-slate-500 rounded-lg flex flex-col items-center justify-center p-6 text-center hover:bg-slate-600 transition-colors">
                    <UploadIcon />
                    {isScanning ? (
                        <p className="text-sky-400 mt-2">Escaneando recibo...</p>
                    ) : (
                        <>
                            <p className="text-white mt-2">Sube una foto del recibo</p>
                            <p className="text-xs text-slate-400">{fileName || 'PNG, JPG, GIF hasta 10MB'}</p>
                        </>
                    )}
                </label>
                <input id="receipt-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />

                <div className="text-center my-4 text-slate-400 text-sm font-bold">O introduce los datos manualmente</div>

                {/* Formulario manual */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Descripción</label>
                        <input ref={descriptionInputRef} type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej: Café con amigos"/>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-slate-400 text-sm font-bold mb-2">Cantidad</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00"/>
                        </div>
                        <div className="flex-1">
                             <label className="block text-slate-400 text-sm font-bold mb-2">Tipo</label>
                             <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                                <option value="expense">Gasto</option>
                                <option value="income">Ingreso</option>
                             </select>
                        </div>
                    </div>
                     <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Categoría</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                           <option>Comida</option>
                           <option>Vivienda</option>
                           <option>Transporte</option>
                           <option>Ocio</option>
                           <option>Salario</option>
                           <option>Otros</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Fecha</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button 
                            type="submit" 
                            className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Componente de Autenticación ---
function Auth({ supabase }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            alert(error.error_description || error.message);
        } else {
            alert('¡Revisa tu correo para el enlace de inicio de sesión!');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h1 className="text-3xl font-bold text-white text-center mb-2">Ahorrapp</h1>
                <p className="text-slate-400 text-center mb-8">Inicia sesión con un enlace mágico</p>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-slate-400 text-sm font-bold mb-2">Correo Electrónico</label>
                        <input
                            id="email"
                            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-6">
                        <button 
                            className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? <span>Enviando...</span> : <span>Enviar enlace mágico</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Componente Principal de la Aplicación ---
export default function App() {
  const [session, setSession] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]); // New state for budgets
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  }, [session]); // Re-fetch if session changes
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(null); // YYYY-MM-DD
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', or 'expense'
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar transacciones iniciales
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session) return; // No hacer nada si no hay sesión
      const { data, error } = await supabase.from('transactions').select('*');
      if (error) {
        console.error('Error al obtener transacciones:', error);
      } else {
        setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    };
    fetchTransactions();
  }, [session]); // Volver a ejecutar si la sesión cambia

  // Resetear paginación cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, selectedDate, sortKey, sortOrder]);


  // --- Funciones CRUD ---

  const handleAddTransaction = useCallback(async (newTransaction) => {
    const { data, error } = await supabase.from('transactions').insert(newTransaction).select();
    if (error) {
        console.error('Error al añadir transacción:', error);
        throw error;
    }
    setTransactions(prev => [...prev, ...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const handleUpdateTransaction = useCallback(async (updatedTransaction) => {
    const { data, error } = await supabase.from('transactions').update(updatedTransaction).eq('id', updatedTransaction.id).select();
    if (error) {
        console.error('Error al actualizar transacción:', error);
        throw error;
    }
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? data[0] : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const handleDeleteTransaction = useCallback(async (id) => {
    const promise = supabase.from('transactions').delete().eq('id', id);

    toast.promise(promise, {
        loading: 'Eliminando...',
        success: () => {
            setTransactions(prev => prev.filter(t => t.id !== id));
            return 'Transacción eliminada';
        },
        error: 'Error al eliminar la transacción',
    });
  }, []);

  const handleSaveTransaction = useCallback(async (transactionData) => {
      const promise = transactionData.id
          ? handleUpdateTransaction(transactionData)
          : handleAddTransaction(transactionData);
      
      toast.promise(promise, {
          loading: 'Guardando...',
          success: 'Transacción guardada',
          error: 'Error al guardar la transacción',
      });
  }, [handleAddTransaction, handleUpdateTransaction]);

  // --- Funciones CRUD para Presupuestos ---

  const handleAddBudget = useCallback(async (newBudget) => {
    const { data, error } = await supabase.from('budgets').insert(newBudget).select();
    if (error) {
      console.error('Error al añadir presupuesto:', error);
      throw error;
    }
    setBudgets(prev => [...prev, ...data]);
  }, []);

  const handleUpdateBudget = useCallback(async (updatedBudget) => {
    const { data, error } = await supabase.from('budgets').update(updatedBudget).eq('id', updatedBudget.id).select();
    if (error) {
      console.error('Error al actualizar presupuesto:', error);
      throw error;
    }
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? data[0] : b));
  }, []);

  const handleDeleteBudget = useCallback(async (id) => {
    const promise = supabase.from('budgets').delete().eq('id', id);

    toast.promise(promise, {
      loading: 'Eliminando presupuesto...',
      success: () => {
        setBudgets(prev => prev.filter(b => b.id !== id));
        return 'Presupuesto eliminado';
      },
      error: 'Error al eliminar el presupuesto',
    });
  }, []);

  const openModalForEdit = useCallback((transaction) => {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
  }, []);

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingTransaction(null);
  }

  const handleDateClick = (date) => {
      setSelectedDate(date);
      setViewMode('list');
  }

  // Cálculos para el resumen
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expensesByCategory = useMemo(() => {
    const categoryMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return Object.keys(categoryMap).map(category => ({
      category,
      total: categoryMap[category],
    }));
  }, [transactions]);

  const monthlyFinancialData = useMemo(() => {
    const dataMap = new Map(); // Key: "YYYY-MM", Value: { income: 0, expense: 0 }

    transactions.forEach(t => {
      const date = new Date(t.date + 'T00:00:00'); // Ensure date is parsed correctly
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-indexed

      const monthYearKey = `${year}-${String(month + 1).padStart(2, '0')}`;

      if (!dataMap.has(monthYearKey)) {
        dataMap.set(monthYearKey, { income: 0, expense: 0 });
      }

      const currentMonthData = dataMap.get(monthYearKey);
      if (t.type === 'income') {
        currentMonthData.income += t.amount;
      } else {
        currentMonthData.expense += t.amount;
      }
    });

    // Sort keys chronologically
    const sortedKeys = Array.from(dataMap.keys()).sort();

    const labels = sortedKeys.map(key => {
      const [year, month] = key.split('-');
      const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleString('es-ES', { month: 'short' });
      return `${monthName}. ${year}`;
    });

    const incomeData = sortedKeys.map(key => dataMap.get(key).income);
    const expenseData = sortedKeys.map(key => dataMap.get(key).expense);

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Gastos',
          data: expenseData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
      ],
    };
  }, [transactions]);

  const filteredTransactions = transactions
    .filter(t => {
        if (selectedDate) {
            return t.date === selectedDate;
        }
        return true;
    })
    .filter(t => {
        if (typeFilter === 'all') {
            return true;
        }
        return t.type === typeFilter;
    });

  const sortedAndFilteredTransactions = [...filteredTransactions].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (sortKey === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
    }

    if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // --- Lógica de Paginación ---
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedAndFilteredTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedAndFilteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!session) {
    return <Auth supabase={supabase} />;
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <Toaster position="bottom-center" toastOptions={{
        className: 'bg-slate-800 text-white',
      }}/>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Ingresos Totales" amount={totalIncome} colorClass="bg-green-500/10">
            <ArrowUpIcon />
          </SummaryCard>
          <SummaryCard title="Gastos Totales" amount={totalExpense} colorClass="bg-red-500/10">
            <ArrowDownIcon />
          </SummaryCard>
          <SummaryCard title="Balance Actual" amount={balance} colorClass="bg-sky-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
          </SummaryCard>
        </div>

        {/* Selector de Vista */}
        <div className="mb-6 flex justify-center bg-slate-800 rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'list' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Lista</button>
            <button onClick={() => setViewMode('calendar')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'calendar' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Calendario</button>
            <button onClick={() => setViewMode('analysis')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'analysis' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Análisis</button>
            <button onClick={() => setViewMode('budgets')} className={`w-full py-2 rounded-md font-bold transition-colors ${viewMode === 'budgets' ? 'bg-sky-600 hover:bg-sky-700 hover:text-sky-200' : 'hover:bg-slate-700 hover:text-sky-400'}`}>Presupuestos</button>
        </div>

        {/* Contenido Principal */}
        <main>
            {viewMode === 'list' && (
                <div>
                    {/* Filtros de tipo */}
                    <div className="flex justify-center space-x-2 mb-6 bg-slate-800 p-1 rounded-lg">
                        <button onClick={() => setTypeFilter('all')} className={`w-full py-2 rounded-md font-bold transition-colors ${typeFilter === 'all' ? 'bg-sky-600' : 'hover:bg-slate-700'}`}>Todos</button>
                        <button onClick={() => setTypeFilter('income')} className={`w-full py-2 rounded-md font-bold transition-colors ${typeFilter === 'income' ? 'bg-green-600' : 'hover:bg-slate-700'}`}>Ingresos</button>
                        <button onClick={() => setTypeFilter('expense')} className={`w-full py-2 rounded-md font-bold transition-colors ${typeFilter === 'expense' ? 'bg-red-600' : 'hover:bg-slate-700'}`}>Gastos</button>
                    </div>

                    {/* Controles de Ordenación */}
                    <div className="flex justify-end mb-4">
                        <select 
                            onChange={(e) => {
                                const [key, order] = e.target.value.split('-');
                                setSortKey(key);
                                setSortOrder(order);
                            }}
                            value={`${sortKey}-${sortOrder}`}
                            className="bg-slate-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="date-desc">Fecha (Más reciente)</option>
                            <option value="date-asc">Fecha (Más antigua)</option>
                            <option value="amount-desc">Cantidad (Mayor a menor)</option>
                            <option value="amount-asc">Cantidad (Menor a mayor)</option>
                            <option value="description-asc">Descripción (A-Z)</option>
                            <option value="description-desc">Descripción (Z-A)</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">
                            {selectedDate 
                                ? `Transacciones del ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' })}`
                                : 'Transacciones Recientes'}
                        </h2>
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="text-sky-400 hover:text-sky-300 font-bold">
                                Mostrar todas
                            </button>
                        )}
                    </div>
                    <ul>
                        {paginatedTransactions.length > 0 
                            ? paginatedTransactions.map(tx => <TransactionItem key={tx.id} transaction={tx} onEdit={openModalForEdit} onDelete={handleDeleteTransaction} />)
                            : <p className="text-slate-500 text-center py-8">No hay transacciones que coincidan con los filtros seleccionados.</p>
                        }
                    </ul>

                    {/* Controles de Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-6">
                            <button 
                                onClick={() => setCurrentPage(p => p - 1)} 
                                disabled={currentPage === 1}
                                className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-slate-400">Página {currentPage} de {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(p => p + 1)} 
                                disabled={currentPage === totalPages}
                                className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'calendar' && (
                <CalendarView transactions={transactions} onDateClick={handleDateClick} />
            )}

            {viewMode === 'analysis' && (
                <>
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg mb-8">
                        <h2 className="text-white text-2xl font-bold mb-4">Gastos por Categoría</h2>
                        {expensesByCategory.length > 0 ? (
                            <CategoryChart data={expensesByCategory} />
                        ) : (
                            <p className="text-slate-400 text-center py-8">No hay gastos para mostrar en el gráfico.</p>
                        )}
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
                        {monthlyFinancialData.labels.length > 0 ? (
                            <MonthlyChart data={monthlyFinancialData} />
                        ) : (
                            <p className="text-slate-400 text-center py-8">No hay datos suficientes para mostrar el gráfico de ingresos vs. gastos mensuales.</p>
                        )}
                    </div>
                </>
            )}

            {viewMode === 'budgets' && (
                <BudgetManager 
                    budgets={budgets}
                    onAddBudget={handleAddBudget}
                    onUpdateBudget={handleUpdateBudget}
                    onDeleteBudget={handleDeleteBudget}
                />
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
            onSave={handleSaveTransaction}
            transactionToEdit={editingTransaction}
            selectedDate={selectedDate}
        />}

      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, TRANSACTION_TYPES } from '../constants';

const AddTransactionModal = () => {
  const {
    isModalOpen,
    closeModal,
    editingTransaction,
    session,
    saveTransaction,
    getBudgetCategories, // Usamos la nueva función
  } = useAppStore();

  // Combinamos las categorías predeterminadas con las de los presupuestos
  const availableCategories = useMemo(() => {
    const budgetCategories = getBudgetCategories();
    const combined = [...new Set([...CATEGORIES, ...budgetCategories])];
    return combined.sort();
  }, [getBudgetCategories]);

  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(editingTransaction?.category || availableCategories[0] || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount);
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
    } else {
      // Reset form when opening for new transaction
      setType(TRANSACTION_TYPES.EXPENSE);
      setAmount('');
      setCategory(availableCategories[0] || '');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingTransaction, isModalOpen, availableCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('La cantidad debe ser un número positivo.');
      return;
    }
    if (!category) {
      toast.error('La categoría es obligatoria.');
      return;
    }
    if (!date) {
      toast.error('La fecha es obligatoria.');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
      user_id: session.user.id,
      ...(editingTransaction && { id: editingTransaction.id }), // Añadir el ID si estamos editando
    };

    await saveTransaction(transactionData);
    closeModal();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
        <h2 className="text-white text-2xl font-bold mb-6">{editingTransaction ? 'Editar' : 'Añadir'} Transacción</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-bold mb-2">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value={TRANSACTION_TYPES.EXPENSE}>Gasto</option>
              <option value={TRANSACTION_TYPES.INCOME}>Ingreso</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-bold mb-2">Cantidad</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00" />
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-bold mb-2">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-bold mb-2">Descripción (Opcional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej. Café de la mañana" />
          </div>
          <div className="mb-6">
            <label className="block text-slate-400 text-sm font-bold mb-2">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={closeModal} className="text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors">Cancelar</button>
            <button
              type="submit"
              className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20"
            >
              Guardar Transacción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
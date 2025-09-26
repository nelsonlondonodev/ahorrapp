import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { CATEGORIES, TRANSACTION_TYPES } from '../constants';
import { useAppStore } from '../store/useAppStore';

export default function AddTransactionModal({
  closeModal,
  saveTransaction,
  editingTransaction,
  selectedDate
}) {
  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [customCategory, setCustomCategory] = useState('');

  const availableCategories = useAppStore(state => state.getAvailableCategories());

  const allCategories = useMemo(() => {
    const combined = new Set([...CATEGORIES, ...availableCategories]);
    return Array.from(combined).sort();
  }, [availableCategories]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || TRANSACTION_TYPES.EXPENSE);
      setAmount(editingTransaction.amount || '');
      setCategory(editingTransaction.category || '');
      setDescription(editingTransaction.description || '');
      setDate(editingTransaction.date ? new Date(editingTransaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = category === 'other' ? customCategory : category;
    if (!amount || !finalCategory || !date) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    const transactionData = {
      id: editingTransaction?.id,
      type,
      amount: parseFloat(amount),
      category: finalCategory,
      description,
      date,
      user_id: (await supabase.auth.getUser()).data.user.id
    };

    await saveTransaction(transactionData);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">{editingTransaction ? 'Editar' : 'Añadir'} Transacción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-accent text-sm font-bold mb-2">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
              <option value={TRANSACTION_TYPES.INCOME}>Ingreso</option>
              <option value={TRANSACTION_TYPES.EXPENSE}>Gasto</option>
            </select>
          </div>
          <div>
            <label className="block text-accent text-sm font-bold mb-2">Cantidad</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-accent text-sm font-bold mb-2">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Selecciona una categoría</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="other">Otra...</option>
            </select>
          </div>
          {category === 'other' && (
            <div>
              <label className="block text-accent text-sm font-bold mb-2">Nueva Categoría</label>
              <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Ej. Viajes" />
            </div>
          )}
          <div>
            <label className="block text-accent text-sm font-bold mb-2">Descripción (Opcional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Ej. Café de la mañana" />
          </div>
          <div>
            <label className="block text-accent text-sm font-bold mb-2">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={closeModal} className="bg-secondary text-secondary-foreground font-bold py-3 px-6 rounded-lg hover:bg-border transition-colors">Cancelar</button>
            <button type="submit" className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-lg">
              {editingTransaction ? 'Guardar Cambios' : 'Añadir Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
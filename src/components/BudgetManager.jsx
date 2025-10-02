import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, TRANSACTION_TYPES } from '../constants';
import { selectBudgetsWithSpending, useAppStore } from '../store/useAppStore';
import { EditIcon, TrashIcon, PlusIcon } from './Icons';

const BudgetModal = ({ budget, onClose, onSave }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const availableCategories = useAppStore(state => state.getAvailableCategories());
  const allCategories = useMemo(() => {
    const combined = new Set([...CATEGORIES, ...availableCategories]);
    return Array.from(combined).sort();
  }, [availableCategories]);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category || '');
      setAmount(budget.amount || '');
    } else {
      setCategory('');
      setAmount('');
    }
  }, [budget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !amount) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    onSave({ ...budget, category, amount: parseFloat(amount) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
        <h2 className="text-foreground text-2xl font-bold mb-6">{budget ? 'Editar' : 'Crear'} Presupuesto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-accent text-sm font-bold mb-2">Categoría</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecciona una categoría</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-accent text-sm font-bold mb-2">Cantidad Presupuestada</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0.00"/>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-secondary text-secondary-foreground font-bold py-3 px-6 rounded-lg hover:bg-border transition-colors">Cancelar</button>
            <button type="submit" className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-lg">
              {budget ? 'Guardar Cambios' : 'Crear Presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BudgetList = ({ budgets, onEdit, onDelete }) => {
  if (budgets.length === 0) {
    return <p className="text-accent text-center py-8">No hay presupuestos definidos. ¡Añade uno para empezar!</p>;
  }

  return (
    <ul className="space-y-4">
      {budgets.map(budget => {
        const progress = (budget.spentAmount / budget.amount) * 100;
        const progressBarClass = budget.isOverspent ? 'bg-red-500' : 'bg-primary';

        return (
          <li key={budget.id} className="bg-secondary p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-foreground">{budget.category}</span>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-semibold ${budget.isOverspent ? 'text-red-500' : 'text-accent'}`}>
                  ${budget.spentAmount.toFixed(2)} / ${budget.amount.toFixed(2)}
                </span>
                <button onClick={() => onEdit(budget)} className="text-accent hover:text-foreground p-2 rounded-full hover:bg-border">
                  <EditIcon />
                </button>
                <button onClick={() => onDelete(budget.id)} className="text-accent hover:text-foreground p-2 rounded-full hover:bg-border">
                  <TrashIcon />
                </button>
              </div>
            </div>
            <div className="w-full bg-border rounded-full h-2.5">
              <div className={progressBarClass} style={{ width: `${Math.min(progress, 100)}%`, height: '100%', borderRadius: 'inherit' }}></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default function BudgetManager({ budgets, onAddBudget, onUpdateBudget, onDeleteBudget }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const budgetsWithSpending = useAppStore(selectBudgetsWithSpending);

  const openModalForEdit = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleSave = (budgetData) => {
    if (budgetData.id) {
      onUpdateBudget(budgetData);
    }
    else {
      onAddBudget(budgetData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Gestión de Presupuestos</h2>
        <button 
          onClick={openModalForNew} 
          className="bg-primary hover:bg-opacity-90 text-primary-foreground rounded-lg p-3 flex items-center space-x-2 shadow-lg"
        >
          <PlusIcon />
          <span className="hidden sm:inline">Añadir Presupuesto</span>
        </button>
      </div>

      <BudgetList budgets={budgetsWithSpending} onEdit={openModalForEdit} onDelete={onDeleteBudget} />

      {isModalOpen && (
        <BudgetModal 
          budget={editingBudget} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
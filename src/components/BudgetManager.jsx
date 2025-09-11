import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// Iconos (reutilizados de App.jsx o definidos aquí si son específicos)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Modal para añadir o editar un presupuesto
function BudgetModal({ onClose, onSave, budgetToEdit }) {
    const [category, setCategory] = useState(budgetToEdit?.category || 'Comida');
    const [amount, setAmount] = useState(budgetToEdit?.amount || '');
    const [startDate, setStartDate] = useState(budgetToEdit?.start_date || new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(budgetToEdit?.end_date || '');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            toast.error('La cantidad debe ser un número positivo.');
            return;
        }
        if (!startDate) {
            toast.error('La fecha de inicio es obligatoria.');
            return;
        }
        if (endDate && new Date(startDate) > new Date(endDate)) {
            toast.error('La fecha de fin no puede ser anterior a la fecha de inicio.');
            return;
        }

        const budgetData = {
            ...budgetToEdit,
            category,
            amount: parseFloat(amount),
            start_date: startDate,
            end_date: endDate || null, // Guardar como null si está vacío
        };

        await onSave(budgetData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-white text-2xl font-bold mb-6">{budgetToEdit ? 'Editar' : 'Añadir'} Presupuesto</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Categoría</label>
                        <input
                          type="text"
                          list="category-suggestions"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Escribe o selecciona una categoría"
                        />
                        <datalist id="category-suggestions">
                          <option value="Comida" />
                          <option value="Vivienda" />
                          <option value="Transporte" />
                          <option value="Ocio" />
                          <option value="Salario" />
                          <option value="Otros" />
                        </datalist>
                    </div>
                    <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Cantidad Presupuestada</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00"/>
                    </div>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-slate-400 text-sm font-bold mb-2">Fecha de Inicio</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div className="flex-1">
                            <label className="block text-slate-400 text-sm font-bold mb-2">Fecha de Fin (Opcional)</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button 
                            type="submit" 
                            className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20"
                        >
                            Guardar Presupuesto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Componente principal BudgetManager
const BudgetManager = ({ budgets, onAddBudget, onUpdateBudget, onDeleteBudget }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const handleSaveBudget = useCallback(async (budgetData) => {
        const promise = budgetData.id
            ? onUpdateBudget(budgetData)
            : onAddBudget(budgetData);
        
        toast.promise(promise, {
            loading: 'Guardando presupuesto...',
            success: 'Presupuesto guardado',
            error: 'Error al guardar el presupuesto',
        });
    }, [onAddBudget, onUpdateBudget]);

    const openModalForEdit = useCallback((budget) => {
        setEditingBudget(budget);
        setIsModalOpen(true);
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-white text-2xl font-bold mb-4">Gestión de Presupuestos</h2>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg p-3 mb-6 flex items-center space-x-2 shadow-lg shadow-sky-600/20"
            >
                <PlusIcon />
                <span>Añadir Nuevo Presupuesto</span>
            </button>

            {budgets.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No hay presupuestos definidos. ¡Añade uno para empezar!</p>
            ) : (
                <ul className="space-y-3">
                    {budgets.map(budget => {
                        const budgetItemClass = `flex items-center justify-between p-4 rounded-lg ${budget.isOverspent ? 'bg-red-700' : budget.isFullySpent ? 'bg-orange-700' : 'bg-slate-700'}`;
                        return (
                            <li key={budget.id} className={budgetItemClass}>
                                <div>
                                    <p className="text-white font-semibold">{budget.category}</p>
                                    <p className="text-slate-400 text-sm">
                                        Presupuestado: {budget.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        Gastado: {budget.spentAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        Restante: {budget.remainingAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => openModalForEdit(budget)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-600">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => onDeleteBudget(budget.id)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-600">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {isModalOpen && (
                <BudgetModal 
                    onClose={closeModal} 
                    onSave={handleSaveBudget} 
                    budgetToEdit={editingBudget} 
                />
            )}
        </div>
    );
};

export default BudgetManager;
import React, { memo } from 'react';
import { ArrowUpIcon, ArrowDownIcon, EditIcon, TrashIcon } from './Icons';

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

export default TransactionItem;

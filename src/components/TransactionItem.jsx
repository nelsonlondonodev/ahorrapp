import React from 'react';
import { EditIcon, TrashIcon } from './Icons';
import { TRANSACTION_TYPES } from '../constants';

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const { type, description, category, amount, date } = transaction;
  const isExpense = type === TRANSACTION_TYPES.EXPENSE;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <li className="flex items-center justify-between p-4 bg-secondary rounded-lg">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${isExpense ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
          {/* You can place an icon here based on category if you want */}
        </div>
        <div>
          <p className="font-bold text-foreground">{description || category}</p>
          <p className="text-accent text-sm">{category} - {formattedDate}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <p className={`font-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
          {isExpense ? '-' : '+'}${amount.toFixed(2)}
        </p>
        <button onClick={() => onEdit(transaction)} className="text-accent hover:text-foreground p-2 rounded-full hover:bg-border">
          <EditIcon />
        </button>
        <button onClick={() => onDelete(transaction.id)} className="text-accent hover:text-foreground p-2 rounded-full hover:bg-border">
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

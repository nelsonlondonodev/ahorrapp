import React from 'react';
import Calendar from 'react-calendar';
import { TRANSACTION_TYPES } from '../constants';

// It's better to move these styles to a separate CSS file, 
// but for simplicity, we'll keep it here and use CSS variables from index.css
const CalendarStyles = () => (
  <style>{`
    .react-calendar {
      width: 100%;
      background-color: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.75rem; /* rounded-xl */
      padding: 1rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* shadow-lg */
    }

    .react-calendar__navigation button {
      color: var(--primary);
      min-width: 44px;
      background: none;
      font-size: 1.25rem; /* text-xl */
      font-weight: bold;
    }
    .react-calendar__navigation button:hover {
      background-color: var(--secondary);
    }
    .react-calendar__navigation button:disabled {
      color: var(--accent);
    }

    .react-calendar__month-view__weekdays__weekday {
      text-align: center;
      font-weight: bold;
      color: var(--accent);
      text-transform: uppercase;
      font-size: 0.75rem; /* text-xs */
      padding: 0.5em;
    }

    .react-calendar__tile {
      background: none;
      text-align: center;
      line-height: 16px;
      font-size: 0.875rem; /* text-sm */
      padding: 1em 0.5em;
      border-radius: 0.5rem; /* rounded-lg */
      color: var(--foreground);
    }

    .react-calendar__tile:disabled {
      color: var(--accent);
      opacity: 0.7;
    }

    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus {
      background-color: var(--secondary);
    }

    .react-calendar__tile--now {
      background-color: var(--secondary);
      font-weight: bold;
    }

    .react-calendar__tile--active {
      background-color: var(--primary);
      color: var(--primary-foreground);
    }

    .transaction-dot {
      height: 6px;
      width: 6px;
      border-radius: 50%;
      margin: 2px auto 0;
    }
    .income-dot {
      background-color: var(--color-income);
    }
    .expense-dot {
      background-color: var(--color-expense);
    }
  `}</style>
);

export default function CalendarView({ transactions, onDateClick }) {
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayTransactions = transactions.filter(t => new Date(t.date).toDateString() === date.toDateString());
      const hasIncome = dayTransactions.some(t => t.type === TRANSACTION_TYPES.INCOME);
      const hasExpense = dayTransactions.some(t => t.type === TRANSACTION_TYPES.EXPENSE);

      return (
        <div className="flex justify-center items-center">
          {hasIncome && <div className="transaction-dot income-dot"></div>}
          {hasExpense && <div className="transaction-dot expense-dot"></div>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border p-4 rounded-2xl shadow-lg">
      <CalendarStyles />
      <Calendar
        onChange={onDateClick}
        tileContent={tileContent}
        className="text-foreground"
      />
      <div className="mt-4 flex justify-center space-x-4 text-sm text-accent">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full income-dot mr-2"></div>
          <span>Ingresos</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full expense-dot mr-2"></div>
          <span>Gastos</span>
        </div>
      </div>
    </div>
  );
}
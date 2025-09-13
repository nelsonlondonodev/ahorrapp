import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Estilos personalizados para el calendario
const customCalendarStyles = `
  .react-calendar {
    width: 100%;
    border: none;
    border-radius: 1rem;
    background-color: #f1f5f9; /* bg-slate-100 */
    color: #1e293b; /* text-slate-800 */
    padding: 1rem;
  }
  .dark .react-calendar {
    background-color: #1e293b; /* bg-slate-800 */
    color: white;
  }

  .react-calendar__navigation button {
    color: #1e293b; /* text-slate-800 */
    font-size: 1.25rem;
    font-weight: bold;
  }
  .dark .react-calendar__navigation button {
    color: white;
  }
  
  .react-calendar__navigation button:hover,
  .react-calendar__navigation button:focus {
    background-color: #e2e8f0 !important; /* bg-slate-200 */
    color: #0ea5e9; /* text-sky-500 */
  }
  .dark .react-calendar__navigation button:hover,
  .dark .react-calendar__navigation button:focus {
    background-color: #334155 !important; /* bg-slate-700 */
    color: #38bdf8; /* text-sky-400 */
  }

  .react-calendar__month-view__weekdays__weekday {
    color: #64748b; /* text-slate-500 */
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75rem;
  }
  .dark .react-calendar__month-view__weekdays__weekday {
    color: #94a3b8; /* text-slate-400 */
  }

  .react-calendar__tile {
    color: #334155; /* text-slate-700 */
    border-radius: 0.5rem;
  }
  .dark .react-calendar__tile {
    color: #cbd5e1; /* text-slate-300 */
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #e2e8f0; /* bg-slate-200 */
  }
  .dark .react-calendar__tile:enabled:hover,
  .dark .react-calendar__tile:enabled:focus {
    background-color: #334155; /* bg-slate-700 */
  }

  .react-calendar__tile--now {
    background-color: #e2e8f0; /* bg-slate-200 */
    color: #0ea5e9; /* text-sky-500 */
  }
  .dark .react-calendar__tile--now {
    background-color: #334155; /* bg-slate-700 */
    color: #38bdf8; /* text-sky-400 */
  }
  
  .react-calendar__tile--active {
    background-color: #0ea5e9; /* bg-sky-600 */
    color: white;
  }
  
  .transaction-marker {
    height: 8px;
    width: 8px;
    border-radius: 50%;
    margin: 0 auto;
    margin-top: 4px;
  }

  .income-marker {
    background-color: #22c55e; /* bg-green-500 */
  }
  .dark .income-marker {
    background-color: #4ade80; /* bg-green-400 */
  }

  .expense-marker {
    background-color: #ef4444; /* bg-red-500 */
  }
  .dark .expense-marker {
    background-color: #f87171; /* bg-red-400 */
  }
`;

function CalendarView({ transactions, onDateClick }) {
  const getMarkersForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    const transactionsOnDay = transactions.filter(t => t.date === dateString);

    if (transactionsOnDay.length === 0) return null;

    const hasIncome = transactionsOnDay.some(t => t.type === 'income');
    const hasExpense = transactionsOnDay.some(t => t.type === 'expense');

    return (
      <div className="flex justify-center space-x-1">
        {hasIncome && <div className="transaction-marker income-marker"></div>}
        {hasExpense && <div className="transaction-marker expense-marker"></div>}
      </div>
    );
  };

  return (
    <div>
      <style>{customCalendarStyles}</style>
      <Calendar
        onClickDay={(date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            onDateClick(`${year}-${month}-${day}`);
        }}
        tileContent={({ date, view }) => view === 'month' && getMarkersForDate(date)}
      />
      <div className="mt-4 flex justify-center space-x-4 text-sm text-slate-400">
          <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
              <span>Ingresos</span>
          </div>
          <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-400 mr-2"></div>
              <span>Gastos</span>
          </div>
      </div>
    </div>
  );
}

export default CalendarView;
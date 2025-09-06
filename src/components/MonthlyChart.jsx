import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1', // slate-300
        },
      },
      title: {
        display: true,
        text: 'Ingresos vs. Gastos Mensuales',
        color: '#f8fafc', // slate-50
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8', // slate-400
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.2)', // slate-500 with transparency
        },
      },
      y: {
        ticks: {
          color: '#94a3b8', // slate-400
          callback: function(value) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
          }
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.2)', // slate-500 with transparency
        },
      },
    },
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
      <Line options={options} data={data} />
    </div>
  );
};

export default MonthlyChart;

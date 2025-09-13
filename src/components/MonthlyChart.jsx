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
import { useAppStore } from '../store/useAppStore';

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
  const theme = useAppStore((state) => state.theme);
  const legendColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const titleColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
  const ticksColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.5)';

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: legendColor,
        },
      },
      title: {
        display: true,
        text: 'Ingresos vs. Gastos Mensuales',
        color: titleColor,
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
          color: ticksColor,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: ticksColor,
          callback: function(value) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
          }
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  return (
    <div>
      <Line options={options} data={data} />
    </div>
  );
};

export default MonthlyChart;

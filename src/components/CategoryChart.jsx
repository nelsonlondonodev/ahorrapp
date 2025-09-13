import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAppStore } from '../store/useAppStore';

ChartJS.register(ArcElement, Tooltip, Legend);

function CategoryChart({ data }) {
  const theme = useAppStore((state) => state.theme);
  const legendColor = theme === 'dark' ? '#fff' : '#334155';

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Gastos por Categoría',
        data: data.map(item => item.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
            color: legendColor,
            font: {
                size: 14
            }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="h-96">
        <Doughnut data={chartData} options={options} />
    </div>
  );
}

export default CategoryChart;

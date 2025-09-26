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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlyChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Ingresos',
        data: data.incomeValues,
        borderColor: 'var(--color-income)', // green-500
        backgroundColor: 'var(--color-income)',
        tension: 0.3,
      },
      {
        label: 'Gastos',
        data: data.expenseValues,
        borderColor: 'var(--color-expense)', // red-500
        backgroundColor: 'var(--color-expense)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--foreground)', // text-foreground
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'var(--primary)', // bg-primary
        titleColor: 'var(--primary-foreground)',
        bodyColor: 'var(--primary-foreground)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--border)', // border color for grid lines
        },
        ticks: {
          color: 'var(--accent)', // text-accent for ticks
        },
      },
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: 'var(--accent)', // text-accent for ticks
        },
      },
    },
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
      <Line data={chartData} options={options} />
    </div>
  );
}

import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// A simple function to generate shades of gray for the chart
const generateGrayShades = (numColors) => {
  const shades = [];
  for (let i = 0; i < numColors; i++) {
    const intensity = 200 - i * (150 / numColors); // Start from a dark gray and get lighter
    shades.push(`rgb(${intensity}, ${intensity}, ${intensity})`);
  }
  return shades;
};

export default function CategoryChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: generateGrayShades(data.labels.length),
        borderColor: '#FFFFFF', // white border for separation
        borderWidth: 2,
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
          color: '#111827', // foreground color
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#111827', // primary color
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg h-96">
      <Pie data={chartData} options={options} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { api } from "~/trpc/react"; // Import your API client
import type { Transaction } from "~/types/transactionType";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the type for chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

const BarGraph = () => {
  // Explicitly type the state
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Spending ($)",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });

  const { data: transactions, isLoading, error } = api.transaction.getAll.useQuery();

  useEffect(() => {
    if (transactions && !isLoading && !error) {
      const categoryTotals: Record<string, number> = {};
      transactions.forEach((transaction: Transaction) => {
        const category = typeof transaction.category === "string" ? transaction.category : "Uncategorized";
        if (category) {
          categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
        }
      });

      const labels: string[] = Object.keys(categoryTotals);
      const dataValues: number[] = Object.values(categoryTotals);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Spending ($)",
            data: dataValues,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    }
  }, [transactions, isLoading, error]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error.message}</p>;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Spending by Category",
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarGraph;

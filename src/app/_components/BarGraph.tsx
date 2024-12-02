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
import { api } from "~/trpc/react";
import type { Transaction } from "~/types/transactionType";
import { useAuth } from "@clerk/nextjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

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
  const { userId, isSignedIn } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
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

  useEffect(() => {
    // Simulate a delay for authentication check
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500); // Adjust the delay as needed
    return () => clearTimeout(timer);
  }, [isSignedIn]);

  const {
    data: transactions,
    isLoading,
    error,
  } = api.transactionTable.getAll.useQuery(
    { userId: userId as string },
    {
      enabled: Boolean(userId && isSignedIn),
    },
  );

  useEffect(() => {
    if (transactions && !isLoading && !error) {
      console.log("Raw transactions data:", transactions);

      const categoryTotals: Record<string, number> = {};

      transactions.forEach((transaction) => {
        const categoryName =
          transaction.categories.categoryname || "Uncategorized";
        const categoryId = transaction.id;
        categoryTotals[categoryName] =
          (categoryTotals[categoryName] ?? 0) + transaction.amountspent;
        console.log("Category ID:", transaction.amountspent);
      });

      console.log("Category Totals:", categoryTotals);

      const labels: string[] = Object.keys(categoryTotals);
      const dataValues: number[] = Object.values(categoryTotals);

      console.log("Labels for chart:", labels);
      console.log("Data values for chart:", dataValues);

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

  if (!authChecked) return <p>Checking authentication...</p>;
  if (!isSignedIn) return <p>Please log in to view the chart.</p>;
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

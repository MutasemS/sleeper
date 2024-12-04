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
import { useAuth } from "@clerk/nextjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
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
        backgroundColor: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [isSignedIn]);

  const safeUserId = userId ?? "defaultUserId";
  const {
    data: transactions,
    isLoading,
    error,
  } = api.transactionTable.getAll.useQuery(
    { userId: safeUserId },
    {
      enabled: Boolean(userId && isSignedIn),
    }
  );

  useEffect(() => {
    if (transactions && !isLoading && !error) {
      const categoryTotals: Record<string, { totalSpent: number; maxLimit: number }> = {};
  
      // Aggregate spending and fetch max limits
      transactions.forEach((transaction) => {
        const categoryName = transaction.categories?.categoryname || "Uncategorized";
        const maxLimit = transaction.categories?.maxspendlimit ?? Infinity;
  
        // Initialize the category if it doesn't exist
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = { totalSpent: 0, maxLimit };
        }
  
        // Safely add the amount spent to the category's total
        categoryTotals[categoryName]!.totalSpent += transaction.amountspent; // Non-null assertion here
      });
  
      const labels: string[] = Object.keys(categoryTotals);
      const dataValues: number[] = labels.map((label) => categoryTotals[label]!.totalSpent); // Non-null assertion
      const barColors: string[] = labels.map((label) =>
        categoryTotals[label]!.totalSpent > categoryTotals[label]!.maxLimit
          ? "rgba(255, 99, 132, 0.6)" // Red for overspending
          : "rgba(75, 192, 192, 0.6)" // Default color
      );
  
      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Spending ($)",
            data: dataValues,
            backgroundColor: barColors,
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
        text: "Spending by Category",
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarGraph;

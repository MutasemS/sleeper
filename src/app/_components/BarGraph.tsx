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
    borderColor: string[];
    borderWidth: number;
  }[];
}

const timeRanges = [
  { label: "1 Month", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "1 Year", value: 365 },
  { label: "5 Years", value: 1825 },
  { label: "All Time", value: Infinity },
];

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
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  const [timeRange, setTimeRange] = useState("All Time");

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
      const now = new Date();
      const rangeDays =
        timeRanges.find((range) => range.label === timeRange)?.value ?? Infinity;
  
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.transactiondate);
        return now.getTime() - transactionDate.getTime() <= rangeDays * 24 * 60 * 60 * 1000;
      });
  
      filteredTransactions.forEach((transaction) => {
        console.log(
          "Category:",
          transaction.categories?.categoryname,
          "Max Spend Limit:",
          transaction.categories?.maxspendlimit
        );
      });
  
      const categoryTotals: Record<string, { totalSpent: number; maxLimit: number }> = {};
  
      filteredTransactions.forEach((transaction) => {
        const categoryName = transaction.categories?.categoryname ?? "Uncategorized";
        const maxLimit = transaction.categories?.maxspendlimit ?? Infinity;
  
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = { totalSpent: 0, maxLimit };
        }
  
        categoryTotals[categoryName].totalSpent += transaction.amountspent;
      });
  
      const labels = Object.keys(categoryTotals);
      const dataValues = labels.map((label) => categoryTotals[label]!.totalSpent);
      const barColors = labels.map((label) =>
        categoryTotals[label]!.totalSpent > categoryTotals[label]!.maxLimit
          ? "rgba(255, 99, 132, 0.6)"
          : "rgba(75, 192, 192, 0.6)"
      );
  
      setChartData({
        labels,
        datasets: [
          {
            label: "Spending ($)",
            data: dataValues,
            backgroundColor: barColors,
            borderColor: barColors,
            borderWidth: 1,
          },
        ],
      });
    }
  }, [transactions, isLoading, error, timeRange]);
  

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

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="timeRange">Time Range: </label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            color: "black",
            backgroundColor: "white",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          {timeRanges.map((range) => (
            <option
              key={range.label}
              value={range.label}
              style={{ color: "black" }}
            >
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarGraph;

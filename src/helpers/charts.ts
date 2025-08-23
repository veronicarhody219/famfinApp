import type { Transaction } from "../types";
import {
  getFinancialSummary,
  getMonthlyTrend,
  getComparisonData,
} from "./financialOverview";

export const getExpenseByPurposeChart = (
  transactions: Transaction[],
  year?: number,
  month?: number
) => {
  const summary = getFinancialSummary(transactions, year, month);
  const labels = Object.keys(summary.expenseByPurpose);
  const data = Object.values(summary.expenseByPurpose);

  return {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"], // Colors for Sinh hoạt, Kinh doanh, Khác
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: `Tỷ trọng chi phí ${month ? `tháng ${month}/` : ""}${
            year || "Tất cả"
          }`,
        },
      },
    },
  };
};

export const getMonthlyTrendChart = (
  transactions: Transaction[],
  year?: number
) => {
  const trend = getMonthlyTrend(transactions, year);
  return {
    type: "bar",
    data: {
      labels: trend.map((t) => t.month),
      datasets: [
        {
          label: "Thu nhập",
          data: trend.map((t) => t.thu),
          backgroundColor: "#36A2EB",
        },
        {
          label: "Chi phí",
          data: trend.map((t) => t.chi),
          backgroundColor: "#FF6384",
        },
        {
          label: "Lợi nhuận",
          data: trend.map((t) => t.loiNhuan),
          backgroundColor: "#FFCE56",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: `Xu hướng thu chi ${year || "Tất cả"}` },
      },
      scales: {
        x: { stacked: false },
        y: { stacked: false },
      },
    },
  };
};

export const getComparisonChart = (
  transactions: Transaction[],
  period1: string,
  period2: string
) => {
  const comparison = getComparisonData(transactions, period1, period2);
  return {
    type: "bar",
    data: {
      labels: comparison.map((c) => c.period),
      datasets: [
        {
          label: "Thu nhập",
          data: comparison.map((c) => c.income),
          backgroundColor: "#36A2EB",
        },
        {
          label: "Chi phí",
          data: comparison.map((c) => c.expense),
          backgroundColor: "#FF6384",
        },
        {
          label: "Lợi nhuận",
          data: comparison.map((c) => c.profit),
          backgroundColor: "#FFCE56",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: `So sánh ${period1} vs ${period2}` },
      },
      scales: {
        x: { stacked: false },
        y: { stacked: false },
      },
    },
  };
};

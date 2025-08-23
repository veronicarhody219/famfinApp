import type {
  Transaction,
  FinancialSummary,
  MonthlyData,
  ComparisonData,
} from "../types";
import { TRANSACTION_TYPES } from "./constants";

export const getFinancialSummary = (
  transactions: Transaction[],
  year?: number,
  month?: number
): FinancialSummary => {
  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    const tYear = date.getFullYear();
    const tMonth = date.getMonth() + 1;
    return (!year || tYear === year) && (!month || tMonth === month);
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === TRANSACTION_TYPES[0])
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === TRANSACTION_TYPES[1])
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseByPurpose = filteredTransactions
    .filter((t) => t.type === TRANSACTION_TYPES[1])
    .reduce((acc, t) => {
      acc[t.purpose] = (acc[t.purpose] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });

  return {
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
    expenseByPurpose,
  };
};

export const getMonthlyTrend = (
  transactions: Transaction[],
  year?: number
): MonthlyData[] => {
  const monthlyData: { [key: string]: { thu: number; chi: number } } = {};

  transactions
    .filter((t) => !year || new Date(t.date).getFullYear() === year)
    .forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { thu: 0, chi: 0 };
      }
      if (t.type === TRANSACTION_TYPES[0]) {
        monthlyData[key].thu += t.amount;
      } else {
        monthlyData[key].chi += t.amount;
      }
    });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      thu: data.thu,
      chi: data.chi,
      loiNhuan: data.thu - data.chi,
    }))
    .sort((a, b) => a.month.localeCompare(b.month)); // Ascending order
};

export const getComparisonData = (
  transactions: Transaction[],
  period1: string,
  period2: string
): ComparisonData[] => {
  const isMonthly = period1.includes("-");
  const getPeriodKey = (date: string) => {
    const d = new Date(date);
    return isMonthly
      ? `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
      : `${d.getFullYear()}`;
  };

  const data: { [key: string]: { income: number; expense: number } } = {};

  transactions
    .filter((t) => [period1, period2].includes(getPeriodKey(t.date)))
    .forEach((t) => {
      const key = getPeriodKey(t.date);
      if (!data[key]) {
        data[key] = { income: 0, expense: 0 };
      }
      if (t.type === TRANSACTION_TYPES[0]) {
        data[key].income += t.amount;
      } else {
        data[key].expense += t.amount;
      }
    });

  return [period1, period2]
    .map((period) => ({
      period,
      income: data[period]?.income || 0,
      expense: data[period]?.expense || 0,
      profit: (data[period]?.income || 0) - (data[period]?.expense || 0),
    }))
    .filter((d) => d.income || d.expense);
};

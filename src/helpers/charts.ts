import type {
  Transaction,
  FinancialSummary,
  MonthlyData,
  ComparisonData,
  CategorizedData,
} from "../types";
import {
  getFinancialSummary,
  getMonthlyTrend,
  getComparisonData,
} from "./financialOverview";

export const getExpenseByPurposeChart = (
  transactions: Transaction[],
  year?: number,
  month?: number
): CategorizedData[] => {
  const summary: FinancialSummary = getFinancialSummary(
    transactions,
    year,
    month
  );
  return Object.entries(summary.expenseByPurpose).map(([name, value]) => ({
    name,
    value,
  }));
};

export const getMonthlyTrendChart = (
  transactions: Transaction[],
  year?: number
): MonthlyData[] => {
  return getMonthlyTrend(transactions, year);
};

export const getComparisonChart = (
  transactions: Transaction[],
  period1: string,
  period2: string
): MonthlyData[] => {
  const comparison: ComparisonData[] = getComparisonData(
    transactions,
    period1,
    period2
  );
  return comparison.map((c) => ({
    month: c.period,
    thu: c.income,
    chi: c.expense,
    loiNhuan: c.profit,
  }));
};

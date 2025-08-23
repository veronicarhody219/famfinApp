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
  period1: string, // Format: dd/mm/yyyy
  period2: string // Format: dd/mm/yyyy
): MonthlyData[] => {
  const parsePeriod = (period: string): string => {
    const [day, month, year] = period.split("/").map(Number);
    if (!day || !month || !year) return period; // Fallback to original if invalid
    return `${year}-${month.toString().padStart(2, "0")}`;
  };
  const comparison: ComparisonData[] = getComparisonData(
    transactions,
    parsePeriod(period1),
    parsePeriod(period2)
  );
  return comparison.map((c) => ({
    month: c.period, // Use period as month for display
    thu: c.income,
    chi: c.expense,
    loiNhuan: c.profit,
  }));
};

// src/components/Dashboard/DashboardPage.tsx
import React from "react";
import FinancialSummary from "./FinancialSummary";
import MonthlyCharts from "./MonthlyCharts";
import type { Transaction, MonthlyData } from "../../types";

interface DashboardPageProps {
  transactions: Transaction[];
  monthlyTrend: MonthlyData[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  transactions,
  monthlyTrend,
}) => {
  return (
    <div>
      <FinancialSummary transactions={transactions} />
      <MonthlyCharts monthlyTrend={monthlyTrend} />
    </div>
  );
};

export default DashboardPage;

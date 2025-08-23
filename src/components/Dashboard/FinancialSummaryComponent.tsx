import React from "react";
import SummaryCard from "../Shared/SummaryCard";
import { getFinancialSummary } from "../../helpers/financialOverview";
import { formatCurrency } from "../../helpers/formatters";
import type { Transaction, FinancialSummary } from "../../types";

interface FinancialSummaryProps {
  transactions: Transaction[];
  year?: number;
  month?: number;
}

const FinancialSummaryComponent: React.FC<FinancialSummaryProps> = ({
  transactions,
  year,
  month,
}) => {
  const summary: FinancialSummary = getFinancialSummary(
    transactions,
    year,
    month
  );

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      <SummaryCard
        title="Tổng Thu nhập"
        value={formatCurrency(summary.totalIncome)}
        color="#36A2EB"
      />
      <SummaryCard
        title="Thu Kinh doanh"
        value={formatCurrency(summary.businessIncome)}
        color="#4ade80"
      />
      <SummaryCard
        title="Thu Khác"
        value={formatCurrency(summary.otherIncome)}
        color="#FFCE56"
      />
      <SummaryCard
        title="Tổng Chi tiêu"
        value={formatCurrency(summary.totalExpense)}
        color="#FF6384"
      />
      <SummaryCard
        title="Chi Kinh doanh"
        value={formatCurrency(summary.businessExpense)}
        color="#f87171"
      />
      <SummaryCard
        title="Chi Sinh hoạt"
        value={formatCurrency(summary.livingExpense)}
        color="#FF9F40"
      />
      <SummaryCard
        title="Chi Khác"
        value={formatCurrency(summary.otherExpense)}
        color="#9966FF"
      />
      <SummaryCard
        title="Lợi nhuận Kinh doanh"
        value={formatCurrency(summary.businessProfit)}
        color="#3b82f6"
      />
      <SummaryCard
        title="Thu nhập Thuần"
        value={formatCurrency(summary.netIncome)}
        color="#10B981"
      />
    </div>
  );
};

export default FinancialSummaryComponent;

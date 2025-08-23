import React, { useState } from "react";
import FinancialSummaryComponent from "./FinancialSummaryComponent";
import MonthlyCharts from "./MonthlyCharts";
import type { Transaction } from "../../types";

interface DashboardPageProps {
  transactions: Transaction[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions }) => {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined
  );
  const [comparisonPeriod1, setComparisonPeriod1] = useState<string>("2025-07");
  const [comparisonPeriod2, setComparisonPeriod2] = useState<string>("2024-07");

  const years = Array.from(
    new Set(transactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Tổng quan tài chính</h1>
      <div style={{ marginBottom: "20px" }}>
        <label>Chọn năm: </label>
        <select
          onChange={(e) =>
            setSelectedYear(
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
        >
          <option value="">Tất cả</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <label style={{ marginLeft: "20px" }}>Chọn tháng: </label>
        <select
          onChange={(e) =>
            setSelectedMonth(
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
        >
          <option value="">Tất cả</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <div style={{ marginTop: "10px" }}>
          <label>So sánh kỳ 1: </label>
          <input
            type="text"
            value={comparisonPeriod1}
            onChange={(e) => setComparisonPeriod1(e.target.value)}
            placeholder="YYYY-MM hoặc YYYY"
            style={{ marginRight: "20px" }}
          />
          <label>So sánh kỳ 2: </label>
          <input
            type="text"
            value={comparisonPeriod2}
            onChange={(e) => setComparisonPeriod2(e.target.value)}
            placeholder="YYYY-MM hoặc YYYY"
          />
        </div>
      </div>
      <FinancialSummaryComponent
        transactions={transactions}
        year={selectedYear}
        month={selectedMonth}
      />
      <MonthlyCharts
        transactions={transactions}
        year={selectedYear}
        month={selectedMonth}
        comparisonPeriod1={comparisonPeriod1}
        comparisonPeriod2={comparisonPeriod2}
      />
    </div>
  );
};

export default DashboardPage;

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import FinancialSummaryComponent from "./FinancialSummaryComponent";
import MonthlyCharts from "./MonthlyCharts";
import type { Transaction } from "../../types";

interface DashboardPageProps {
  transactions: Transaction[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [comparisonDate1, setComparisonDate1] = useState<Date | null>(
    new Date("2025-07-01")
  );
  const [comparisonDate2, setComparisonDate2] = useState<Date | null>(
    new Date("2024-07-01")
  );

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // const parseDate = (dateStr: string): Date | null => {
  //   const [day, month, year] = dateStr.split("/").map(Number);
  //   if (!day || !month || !year) return null;
  //   return new Date(year, month - 1, day);
  // };

  const getYearMonth = (
    date: Date | null
  ): { year?: number; month?: number } => {
    if (!date) return { year: undefined, month: undefined };
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  };

  const { year, month } = getYearMonth(selectedDate);
  const comparisonPeriod1 = formatDate(comparisonDate1);
  const comparisonPeriod2 = formatDate(comparisonDate2);

  // const years = Array.from(
  //   new Set(transactions.map((t) => new Date(t.date).getFullYear()))
  // ).sort((a, b) => b - a);

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Tổng quan tài chính
      </h2>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <label>Chọn tháng/năm: </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Chọn tháng/năm"
            className="border rounded p-2"
          />
        </div>
        <div>
          <label>So sánh kỳ 1: </label>
          <DatePicker
            selected={comparisonDate1}
            onChange={(date: Date | null) => setComparisonDate1(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày"
            className="border rounded p-2"
          />
        </div>
        <div>
          <label>So sánh kỳ 2: </label>
          <DatePicker
            selected={comparisonDate2}
            onChange={(date: Date | null) => setComparisonDate2(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày"
            className="border rounded p-2"
          />
        </div>
      </div>
      <FinancialSummaryComponent
        transactions={transactions}
        year={year}
        month={month}
      />
      <MonthlyCharts
        transactions={transactions}
        year={year}
        month={month}
        comparisonPeriod1={comparisonPeriod1}
        comparisonPeriod2={comparisonPeriod2}
      />
    </div>
  );
};

export default DashboardPage;

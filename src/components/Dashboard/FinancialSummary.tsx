// src/components/Dashboard/FinancialSummary.tsx
import React from "react";
import SummaryCard from "../Shared/SummaryCard";
import type { Transaction } from "../../types";

interface FinancialSummaryProps {
  transactions: Transaction[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  transactions,
}) => {
  // Lọc và tính toán tổng thu, tổng chi
  const totalCredit = transactions
    .filter((tx) => tx.type === "Thu")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebit = transactions
    .filter((tx) => tx.type === "Chi")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalCredit - totalDebit;
  const totalThuKinhDoanh = transactions
    .filter((tx) => tx.type === "Thu" && tx.purpose === "Kinh doanh")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalChiKinhDoanh = transactions
    .filter((tx) => tx.type === "Chi" && tx.purpose === "Kinh doanh")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const loiNhuanKinhDoanh = totalThuKinhDoanh - totalChiKinhDoanh;
  const totalThuKhac = totalCredit - totalThuKinhDoanh;
  const totalChiSinhHoat = transactions
    .filter((tx) => tx.type === "Chi" && tx.purpose === "Sinh hoat")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalChiKhac = totalDebit - totalChiKinhDoanh - totalChiSinhHoat;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">
        Tổng quan tài chính
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Tổng thu nhập" amount={totalCredit} color="green" />
        <SummaryCard title="Tổng chi tiêu" amount={totalDebit} color="red" />
        <SummaryCard title="Số dư hiện tại" amount={balance} color="blue" />
        <SummaryCard
          title="Lợi nhuận Kinh doanh"
          amount={loiNhuanKinhDoanh}
          color="blue"
        />
        <SummaryCard title="Thu Khác" amount={totalThuKhac} color="green" />
        <SummaryCard
          title="Chi Sinh hoạt"
          amount={totalChiSinhHoat}
          color="red"
        />
        <SummaryCard title="Chi Khác" amount={totalChiKhac} color="orange" />
      </div>
    </div>
  );
};

export default FinancialSummary;

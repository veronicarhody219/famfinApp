// import React from "react";
// import SummaryCard from "../Shared/SummaryCard";
// import type { Transaction } from "../../types";

// interface FinancialSummaryProps {
//   transactions: Transaction[];
// }

// const FinancialSummary: React.FC<FinancialSummaryProps> = ({
//   transactions,
// }) => {
//   // Tính toán tổng thu/chi
//   const totalThu = transactions
//     .filter((tx) => tx.type === "Thu")
//     .reduce((sum, tx) => sum + tx.amount, 0);

//   const totalChi = transactions
//     .filter((tx) => tx.type === "Chi")
//     .reduce((sum, tx) => sum + tx.amount, 0);

//   const soDu = totalThu - totalChi;

//   // Tách theo purpose
//   const thuKinhDoanh = transactions
//     .filter((tx) => tx.type === "Thu" && tx.purpose === "Kinh doanh")
//     .reduce((sum, tx) => sum + tx.amount, 0);

//   const chiKinhDoanh = transactions
//     .filter((tx) => tx.type === "Chi" && tx.purpose === "Kinh doanh")
//     .reduce((sum, tx) => sum + tx.amount, 0);

//   const loiNhuanKinhDoanh = thuKinhDoanh - chiKinhDoanh;

//   const chiSinhHoat = transactions
//     .filter((tx) => tx.type === "Chi" && tx.purpose === "Sinh hoat")
//     .reduce((sum, tx) => sum + tx.amount, 0);

//   const thuKhac = totalThu - thuKinhDoanh;

//   const chiKhac = totalChi - chiKinhDoanh - chiSinhHoat;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//       <h2 className="text-2xl font-bold text-slate-700 mb-4">
//         Tổng quan tài chính
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {/* Nhóm Kinh doanh */}
//         <SummaryCard
//           title="Thu từ Kinh doanh"
//           amount={thuKinhDoanh}
//           color="green"
//         />
//         <SummaryCard
//           title="Chi cho Kinh doanh"
//           amount={chiKinhDoanh}
//           color="red"
//         />
//         <SummaryCard
//           title="Lợi nhuận Kinh doanh"
//           amount={loiNhuanKinhDoanh}
//           color="blue"
//         />

//         {/* Khác */}
//         <SummaryCard title="Thu Khác" amount={thuKhac} color="green" />
//         <SummaryCard title="Chi Khác" amount={chiKhac} color="orange" />
//         {/* Sinh hoạt */}
//         <SummaryCard title="Chi Sinh hoạt" amount={chiSinhHoat} color="red" />

//         {/* Tổng số dư */}
//         <SummaryCard title="Số dư hiện tại" amount={soDu} color="blue" />
//       </div>
//     </div>
//   );
// };

// export default FinancialSummary;

import React from "react";
import SummaryCard from "../Shared/SummaryCard";
import { getFinancialSummary } from "../../helpers/financialOverview";
import type { Transaction, FinancialSummary } from "../../types";
import { formatCurrency } from "../../helpers/formatters";

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
        title="Tổng thu nhập"
        value={formatCurrency(summary.totalIncome)}
        color="#36A2EB"
      />
      <SummaryCard
        title="Tổng chi phí"
        value={formatCurrency(summary.totalExpense)}
        color="#FF6384"
      />
      <SummaryCard
        title="Lợi nhuận"
        value={formatCurrency(summary.profit)}
        color="#FFCE56"
      />
    </div>
  );
};

export default FinancialSummaryComponent;

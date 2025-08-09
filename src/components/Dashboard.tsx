// src/components/Dashboard.tsx
import React from "react";

// Giao diện dữ liệu cho một giao dịch
interface Transaction {
  amount: number;
  type: "Thu" | "Chi";
  description: string;
  date: string;
  account: string;
  purpose: string;
  category: string;
  member: string;
  channel: string;
}

// Component để hiển thị các giao dịch
const Dashboard: React.FC<{ transactions: Transaction[] }> = ({
  transactions,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        5 Giao Dịch Gần Nhất
      </h2>
      {transactions.length === 0 ? (
        <p className="text-slate-500 text-center">
          Chưa có giao dịch nào được ghi nhận.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Mô Tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Số Tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Loại
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {transactions.slice(0, 5).map((transaction, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {transaction.description}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === "Thu"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount.toLocaleString("vi-VN")} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        transaction.type === "Chi"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { Transaction } from "../../types";
import { formatCurrency } from "../../helpers/formatters";

interface ReportsPageProps {
  transactions: Transaction[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions }) => {
  // Hàm này lọc giao dịch Chi và nhóm theo danh mục
  const getSpendingByCategory = (): { name: string; value: number }[] => {
    const spendingData: { [key: string]: number } = {};
    const categoryMap: { [key: string]: string } = {
      chi_kinh_doanh: "Chi Kinh doanh",
      chi_sinh_hoat: "Chi Sinh hoạt",
      chi_khac: "Chi Khác",
    };

    transactions
      .filter((t) => t.type === "Chi")
      .forEach((t) => {
        const categoryName = categoryMap[t.category] || "Không xác định";
        spendingData[categoryName] =
          (spendingData[categoryName] || 0) + t.amount;
      });

    return Object.keys(spendingData).map((key) => ({
      name: key,
      value: spendingData[key],
    }));
  };

  const data = getSpendingByCategory();
  const COLORS = ["#FF8042", "#0088FE", "#00C49F"];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Biểu đồ Chi tiêu
      </h2>
      <p className="text-gray-600 mb-6">
        Phân tích chi tiêu của bạn theo từng danh mục.
      </p>

      <div className="flex justify-center items-center">
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value as number)} />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default ReportsPage;

// src/components/Dashboard/MonthlyCharts.tsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "../../helpers/formatters";
import type { CustomTooltip, MonthlyData } from "../../types";

interface MonthlyChartsProps {
  monthlyTrend: MonthlyData[];
}

// Hàm render tooltip tùy chỉnh cho biểu đồ
const renderCustomTooltip = ({ active, payload, label }: CustomTooltip) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white shadow-lg rounded-md border border-slate-200">
        <p className="font-bold text-slate-700">{`Tháng: ${label}`}</p>
        {payload.map((entry, index) => (
          <p
            key={`tooltip-${index}`}
            className={`text-sm ${
              entry.name === "Thu"
                ? "text-green-600"
                : entry.name === "Chi"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyCharts: React.FC<MonthlyChartsProps> = ({ monthlyTrend }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-slate-700 mb-6">
        Biểu đồ xu hướng thu chi hàng tháng
      </h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-600 mb-4">
          Thu nhập và Chi tiêu
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyTrend}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={renderCustomTooltip} />
            <Legend />
            <Bar dataKey="thu" name="Thu" fill="#4ade80" />
            <Bar dataKey="chi" name="Chi" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-slate-600 mb-4">
          Lợi nhuận kinh doanh theo tháng
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={renderCustomTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="loiNhuan"
              name="Lợi nhuận"
              stroke="#3b82f6"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyCharts;
